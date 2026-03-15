-- Drop existing function first to allow recreation
DROP FUNCTION IF EXISTS public.process_pending_billing_events(uuid, text);

-- Recreate function with USER_NOT_FOUND status included
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_product_type text;
BEGIN
  -- Find all pending billing events for this email (including USER_NOT_FOUND status)
  FOR v_event IN 
    SELECT id, event_type, payload
    FROM billing_event_logs
    WHERE LOWER(email) = LOWER(p_email)
      AND processed = false
      AND status IN ('pending', 'USER_NOT_FOUND')
      AND event_type IN ('SETTLED', 'STARTING_TRIAL', 'subscription_settled', 'subscription_trial_started')
    ORDER BY created_at ASC
  LOOP
    -- Grant premium access
    INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
    VALUES (p_user_id, true, 'premium', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET 
      is_premium = true, 
      plan_updated_at = now();

    -- Extract product_id from payload and grant product access
    v_product_type := COALESCE(
      v_event.payload->>'product_id',
      v_event.payload->'metadata'->>'product_id',
      'base'
    );
    
    -- Normalize product type
    IF v_product_type IN ('educy_base', 'base', '') OR v_product_type IS NULL THEN
      v_product_type := 'base';
    ELSIF v_product_type IN ('educy_freelancer', 'freelancer') THEN
      v_product_type := 'freelancer';
    ELSIF v_product_type IN ('educy_ai_hub', 'ai_hub') THEN
      v_product_type := 'ai_hub';
    END IF;

    -- Grant product access
    INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
    VALUES (p_user_id, 'billing_event_' || v_event.id, v_product_type, true, now())
    ON CONFLICT (user_id, product_id) DO UPDATE SET 
      is_active = true, 
      granted_at = now();

    -- Mark event as processed
    UPDATE billing_event_logs
    SET processed = true,
        processed_at = now(),
        user_id = p_user_id,
        status = 'processed',
        is_premium_set = true
    WHERE id = v_event.id;
  END LOOP;
END;
$$;

-- Grant access to all 3 affected users who paid before signup
INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
VALUES 
  ('6897a09c-7c45-46a6-90c6-cc742c1345a8', true, 'premium', now(), now()),
  ('fd783ea0-6cd2-4fba-a34f-1dabe2cd9cd9', true, 'premium', now(), now()),
  ('c9cb9faa-ed05-403e-b280-6afa026127c9', true, 'premium', now(), now())
ON CONFLICT (user_id) DO UPDATE SET 
  is_premium = true, 
  plan_updated_at = now();

INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
VALUES 
  ('6897a09c-7c45-46a6-90c6-cc742c1345a8', 'billing_reconciliation_fix', 'base', true, now()),
  ('fd783ea0-6cd2-4fba-a34f-1dabe2cd9cd9', 'billing_reconciliation_fix', 'base', true, now()),
  ('c9cb9faa-ed05-403e-b280-6afa026127c9', 'billing_reconciliation_fix', 'base', true, now())
ON CONFLICT (user_id, product_id) DO UPDATE SET 
  is_active = true, 
  granted_at = now();

UPDATE billing_event_logs
SET processed = true,
    processed_at = now(),
    status = 'processed',
    is_premium_set = true
WHERE LOWER(email) IN ('legna750@hotmail.com', 'jesusmpp2044@gmail.com', 'anarelucian@gmail.com')
  AND processed = false;