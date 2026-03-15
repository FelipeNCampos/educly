-- 1. Remover acesso premium indevido do usuário sem pagamento
DELETE FROM user_premium_access 
WHERE user_id = '0994205a-c838-461e-b518-962f45aa65e6';

DELETE FROM user_product_access 
WHERE user_id = '0994205a-c838-461e-b518-962f45aa65e6';

-- 2. Criar tabela de whitelist para gerenciar acessos gratuitos de forma organizada
CREATE TABLE IF NOT EXISTS public.premium_whitelist (
  email TEXT PRIMARY KEY,
  reason TEXT,
  granted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.premium_whitelist ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver a whitelist
CREATE POLICY "Admins can view whitelist" 
ON public.premium_whitelist 
FOR SELECT 
USING (is_admin());

-- Inserir email do admin/owner na whitelist
INSERT INTO public.premium_whitelist (email, reason, granted_by) 
VALUES ('ferramentasdigitais1000@gmail.com', 'Admin/Owner', 'system')
ON CONFLICT (email) DO NOTHING;

-- 3. Criar função de auditoria para detectar acessos suspeitos
CREATE OR REPLACE FUNCTION public.audit_premium_access()
RETURNS TABLE (
  user_email TEXT,
  user_id_val UUID,
  is_premium BOOLEAN,
  plan_type TEXT,
  billing_events_count BIGINT,
  status TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.email::TEXT,
    au.id,
    COALESCE(upa.is_premium, false),
    COALESCE(upa.plan_type, 'none'),
    COUNT(bel.id),
    CASE 
      WHEN COUNT(bel.id) = 0 AND COALESCE(upa.is_premium, false) = true 
           AND NOT EXISTS (SELECT 1 FROM premium_whitelist pw WHERE LOWER(pw.email) = LOWER(au.email))
      THEN 'SUSPICIOUS'
      WHEN EXISTS (SELECT 1 FROM premium_whitelist pw WHERE LOWER(pw.email) = LOWER(au.email))
      THEN 'WHITELISTED'
      ELSE 'OK'
    END
  FROM auth.users au
  LEFT JOIN user_premium_access upa ON au.id = upa.user_id
  LEFT JOIN billing_event_logs bel ON LOWER(bel.email) = LOWER(au.email)
  WHERE upa.is_premium = true
  GROUP BY au.email, au.id, upa.is_premium, upa.plan_type;
END;
$$;

-- 4. Atualizar função check_premium_access para usar a tabela whitelist
CREATE OR REPLACE FUNCTION public.check_premium_access(user_email TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  check_email TEXT;
  has_premium BOOLEAN := false;
  has_product_access BOOLEAN := false;
  is_whitelisted BOOLEAN := false;
BEGIN
  -- Get email to check
  IF user_email IS NOT NULL THEN
    check_email := user_email;
  ELSE
    SELECT email INTO check_email FROM auth.users WHERE id = auth.uid();
  END IF;
  
  IF check_email IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check whitelist table
  SELECT EXISTS (
    SELECT 1 FROM premium_whitelist WHERE LOWER(email) = LOWER(check_email)
  ) INTO is_whitelisted;
  
  IF is_whitelisted THEN
    RETURN true;
  END IF;
  
  -- Check user_premium_access table
  SELECT COALESCE(upa.is_premium, false)
  INTO has_premium
  FROM auth.users u
  LEFT JOIN user_premium_access upa ON u.id = upa.user_id
  WHERE LOWER(u.email) = LOWER(check_email);
  
  IF has_premium THEN
    RETURN true;
  END IF;
  
  -- Check user_product_access for any active product
  SELECT EXISTS (
    SELECT 1 
    FROM auth.users u
    JOIN user_product_access upa ON u.id = upa.user_id
    WHERE LOWER(u.email) = LOWER(check_email)
    AND upa.is_active = true
  ) INTO has_product_access;
  
  RETURN has_product_access;
END;
$$;