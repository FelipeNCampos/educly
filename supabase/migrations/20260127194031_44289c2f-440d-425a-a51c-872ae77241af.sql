-- Fix 1: Add DELETE policy for profiles table (GDPR compliance)
CREATE POLICY "Users can delete own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = id);

-- Fix 2: Add admin management policies to premium_whitelist
-- Currently only has SELECT for admins, add INSERT/UPDATE/DELETE for admins
CREATE POLICY "Admins can insert whitelist entries"
ON public.premium_whitelist
FOR INSERT
WITH CHECK (is_admin());

CREATE POLICY "Admins can update whitelist entries"
ON public.premium_whitelist
FOR UPDATE
USING (is_admin());

CREATE POLICY "Admins can delete whitelist entries"
ON public.premium_whitelist
FOR DELETE
USING (is_admin());