-- 1. Criar perfis para usuários que não têm perfil
INSERT INTO public.profiles (id, full_name, onboarding_quiz_completed, created_at, updated_at)
SELECT 
  u.id,
  u.raw_user_meta_data ->> 'full_name',
  false,
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- 2. Garantir que o trigger existe e está correto
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Popular user_product_access para usuários que têm is_premium = true mas não têm produto
INSERT INTO public.user_product_access (user_id, product_id, product_type, is_active, granted_at)
SELECT 
  upa.user_id,
  'base_premium',
  'base',
  true,
  now()
FROM public.user_premium_access upa
WHERE upa.is_premium = true
  AND NOT EXISTS (
    SELECT 1 FROM public.user_product_access p 
    WHERE p.user_id = upa.user_id AND p.product_type = 'base'
  );