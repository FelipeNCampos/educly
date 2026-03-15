-- =============================================
-- SECURITY FIX: Create is_admin() function and add validation
-- =============================================

-- PART 1: Ensure is_admin() function exists (referenced by RLS policies)
-- This fixes the MISSING_RLS error for webhook_logs, billing_event_logs, 
-- premium_whitelist, and user_roles tables

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'::app_role
  );
END;
$$;

-- PART 2: Fix process_pending_billing_events to validate caller owns the email
-- This fixes the DEFINER_OR_RPC_BYPASS vulnerability

CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_pending BOOLEAN := FALSE;
  v_user_email TEXT;
  v_event RECORD;
BEGIN
  -- SECURITY VALIDATION 1: Verify caller is the user (not someone else calling for them)
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only process own billing events';
  END IF;
  
  -- SECURITY VALIDATION 2: Verify the user_id actually owns the email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  IF v_user_email IS NULL OR LOWER(v_user_email) != LOWER(p_email) THEN
    RAISE EXCEPTION 'Email does not match user account';
  END IF;

  -- Check for pending billing events for this email
  FOR v_event IN
    SELECT id, event_type, payload
    FROM billing_event_logs
    WHERE LOWER(email) = LOWER(p_email)
      AND processed = false
      AND status = 'pending'
      AND event_type IN ('SETTLED', 'STARTING_TRIAL', 'subscription_settled', 'subscription_trial_started')
  LOOP
    v_has_pending := TRUE;
    
    -- Grant premium access
    INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
    VALUES (p_user_id, true, 'premium', now(), now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      is_premium = true,
      plan_type = 'premium',
      plan_updated_at = now();

    -- Also grant base product access if not already there
    INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
    VALUES (p_user_id, 'billing_reconciliation', 'base', true, now())
    ON CONFLICT (user_id, product_id) 
    DO UPDATE SET 
      is_active = true,
      granted_at = now();

    -- Mark the billing event as processed
    UPDATE billing_event_logs
    SET processed = true,
        processed_at = now(),
        user_id = p_user_id,
        status = 'processed',
        is_premium_set = true
    WHERE id = v_event.id;
  END LOOP;

  RETURN v_has_pending;
END;
$$;

-- PART 3: Create audit logging table for sensitive billing data access
-- This fixes the EXPOSED_SENSITIVE_DATA vulnerability

CREATE TABLE IF NOT EXISTS public.billing_access_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  action_type TEXT NOT NULL DEFAULT 'view',
  records_accessed INTEGER DEFAULT 0,
  ip_address TEXT,
  user_agent TEXT
);

-- Enable RLS on audit log
ALTER TABLE public.billing_access_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view their own audit logs
CREATE POLICY "Admins can view own audit logs"
ON public.billing_access_audit_log
FOR SELECT
USING (auth.uid() = admin_user_id AND is_admin());

-- Function to log billing data access
CREATE OR REPLACE FUNCTION public.log_billing_access(
  p_action_type TEXT DEFAULT 'view',
  p_records_accessed INTEGER DEFAULT 0
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_admin() THEN
    INSERT INTO public.billing_access_audit_log (
      admin_user_id, 
      action_type, 
      records_accessed
    )
    VALUES (
      auth.uid(), 
      p_action_type, 
      p_records_accessed
    );
  END IF;
END;
$$;

-- Ensure user_roles has proper RLS policies (needed for is_admin to work)
-- Drop existing policy if exists and recreate properly
DROP POLICY IF EXISTS "Admins can view user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- Users can view their own role
CREATE POLICY "Users can view own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all roles (uses has_role to avoid recursion with is_admin)
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Grant admin role to the owner account (only if not already exists)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE email = 'ferramentasdigitais1000@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;