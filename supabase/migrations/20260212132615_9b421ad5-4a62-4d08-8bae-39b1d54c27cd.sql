
-- Fix 1: Recreate user_session_details view with security_invoker=on
-- This fixes both SUPA_auth_users_exposed and SUPA_security_definer_view
DROP VIEW IF EXISTS public.user_session_details;

CREATE VIEW public.user_session_details
WITH (security_invoker=on) AS
WITH first_sessions AS (
  SELECT user_sessions.user_id,
    user_sessions.started_at,
    user_sessions.last_ping_at,
    row_number() OVER (PARTITION BY user_sessions.user_id ORDER BY user_sessions.started_at) AS session_rank
  FROM user_sessions
)
SELECT p.full_name AS nome,
  u.email,
  fs.started_at AS inicio,
  fs.last_ping_at AS ultimo_sinal,
  round((EXTRACT(epoch FROM (fs.last_ping_at - fs.started_at)) / (60)::numeric), 2) AS minutos_ativos
FROM first_sessions fs
JOIN profiles p ON fs.user_id = p.id
JOIN auth.users u ON fs.user_id = u.id
WHERE fs.session_rank = 1
  AND fs.started_at >= p.created_at
  AND p.created_at >= '2026-02-01 00:00:00+00'::timestamp with time zone;

-- Fix 2: Fix user_sessions "Admins can view all sessions" policy
-- Currently uses USING (true) which exposes all session data to everyone
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.user_sessions;

CREATE POLICY "Admins can view all sessions"
ON public.user_sessions
FOR SELECT
USING (is_admin());

-- Also add a SELECT policy for regular users to see their own sessions
CREATE POLICY "Users can view own sessions"
ON public.user_sessions
FOR SELECT
USING (auth.uid() = user_id);
