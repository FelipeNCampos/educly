-- Policy para admin ver todos os profiles
CREATE POLICY "Admin can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (is_admin());

-- Policy para admin ver todos os streaks
CREATE POLICY "Admin can view all user streaks"
  ON public.user_streaks
  FOR SELECT
  USING (is_admin());

-- Policy para admin ver todos os status premium
CREATE POLICY "Admin can view all premium access"
  ON public.user_premium_access
  FOR SELECT
  USING (is_admin());

-- Policy para admin ver todos os acessos de produto
CREATE POLICY "Admin can view all product access"
  ON public.user_product_access
  FOR SELECT
  USING (is_admin());