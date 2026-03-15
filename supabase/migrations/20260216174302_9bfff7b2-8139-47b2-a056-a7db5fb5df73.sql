
CREATE OR REPLACE FUNCTION public.generate_tool_certificate(p_challenge_id uuid, p_tool_slug text, p_user_full_name text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_completed_days INTEGER;
  v_total_tool_days INTEGER;
  v_certificate_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Count total days for this tool in this challenge
  SELECT COUNT(*) INTO v_total_tool_days
  FROM challenge_days cd
  JOIN ai_tools at ON cd.ai_tool_id = at.id
  WHERE cd.challenge_id = p_challenge_id
    AND at.slug = p_tool_slug;

  IF v_total_tool_days = 0 THEN
    RETURN NULL;
  END IF;

  -- Count completed days for this tool
  SELECT COUNT(*) INTO v_completed_days
  FROM user_day_progress udp
  JOIN challenge_days cd ON udp.challenge_day_id = cd.id
  JOIN ai_tools at ON cd.ai_tool_id = at.id
  WHERE udp.user_id = v_user_id
    AND cd.challenge_id = p_challenge_id
    AND at.slug = p_tool_slug
    AND udp.completed = true;

  -- Must complete all days for this tool
  IF v_completed_days < v_total_tool_days THEN
    RETURN NULL;
  END IF;

  -- Generate certificate (avoid duplicates)
  INSERT INTO user_certificates (user_id, tool_slug, certificate_type, challenge_id, user_full_name)
  VALUES (v_user_id, p_tool_slug, 'tool_completion', p_challenge_id, p_user_full_name)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_certificate_id;

  -- If conflict (already exists), fetch existing
  IF v_certificate_id IS NULL THEN
    SELECT id INTO v_certificate_id
    FROM user_certificates
    WHERE user_id = v_user_id
      AND tool_slug = p_tool_slug
      AND challenge_id = p_challenge_id;
  END IF;

  RETURN v_certificate_id;
END;
$function$;
