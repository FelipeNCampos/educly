-- Fix 1: Ensure billing_event_logs has proper RLS (it should already have admin-only policy)
-- Double-check RLS is enabled
ALTER TABLE public.billing_event_logs ENABLE ROW LEVEL SECURITY;

-- Fix 2: Add RLS policies to landing_chat_rate_limits
-- This table is used by edge functions with service role, so we block all public access
ALTER TABLE public.landing_chat_rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view rate limits for monitoring
CREATE POLICY "Admins can view rate limits"
ON public.landing_chat_rate_limits
FOR SELECT
USING (is_admin());

-- No INSERT/UPDATE/DELETE policies for users - only service role (edge functions) can modify
-- This prevents rate limit bypass attacks