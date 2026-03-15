
-- Adicionar políticas RLS de admin para tabelas que faltam

-- 1. Política para admins verem todos os user_day_progress
CREATE POLICY "Admins can view all day progress"
ON public.user_day_progress
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 2. Política para admins verem todos os user_progress
CREATE POLICY "Admins can view all user progress"
ON public.user_progress
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 3. Política para admins verem todos os user_certificates
CREATE POLICY "Admins can view all certificates"
ON public.user_certificates
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 4. Política para admins verem todos os user_challenge_progress
CREATE POLICY "Admins can view all challenge progress"
ON public.user_challenge_progress
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 5. Política para admins verem todos os chat_messages (para métricas)
CREATE POLICY "Admins can view all chat messages"
ON public.chat_messages
FOR SELECT
TO authenticated
USING (public.is_admin());
