CREATE OR REPLACE FUNCTION public.check_purchase_exists(p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM billing_event_logs
    WHERE LOWER(RTRIM(email, '.')) = LOWER(RTRIM(p_email, '.'))
      AND UPPER(event_type) IN (
        'SETTLED', 'STARTING_TRIAL', 'SUBSCRIPTION_SETTLED',
        'SUBSCRIPTION_TRIAL_STARTED', 'GRANTED',
        'PURCHASE_COMPLETE', 'PURCHASE_APPROVED',
        'CONVERTION', 'RENEWING'
      )
    LIMIT 1
  );
END;
$$;