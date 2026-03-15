-- Tabela de definições de produtos
CREATE TABLE public.product_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL UNIQUE,
  product_type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inserir produtos conhecidos
INSERT INTO public.product_definitions (product_id, product_type, name, description) VALUES
  ('01KF3ZTNPMB3V44NEKKN1ACN5G', 'base', 'Trial/Mensal', 'Acesso básico ao app - trilhas e desafios'),
  ('01KF4029KCA1QPQXXCMGN69DV9', 'freelancer', 'Upsell Freelancer', 'Acesso à área de vagas de emprego');

-- RLS para product_definitions (apenas leitura pública)
ALTER TABLE public.product_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view product definitions" ON public.product_definitions
  FOR SELECT USING (true);

-- Tabela de acessos de produtos por usuário
CREATE TABLE public.user_product_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  granted_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- RLS para user_product_access
ALTER TABLE public.user_product_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own product access" ON public.user_product_access
  FOR SELECT USING (auth.uid() = user_id);

-- Função para verificar acesso a produto específico
CREATE OR REPLACE FUNCTION public.check_product_access(p_product_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_product_access
    WHERE user_id = auth.uid()
      AND product_type = p_product_type
      AND is_active = true
  );
END;
$$;

-- Função para obter todos os produtos do usuário
CREATE OR REPLACE FUNCTION public.get_user_products()
RETURNS TABLE(product_type TEXT, is_active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT upa.product_type, upa.is_active
  FROM user_product_access upa
  WHERE upa.user_id = auth.uid()
    AND upa.is_active = true;
END;
$$;

-- Atualizar process_pending_billing_events para incluir produtos
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_pending BOOLEAN := FALSE;
  v_event RECORD;
BEGIN
  -- Verificar se existe evento de grant pendente para este email
  SELECT EXISTS (
    SELECT 1 FROM billing_event_logs
    WHERE LOWER(email) = LOWER(p_email)
      AND processed = false
      AND event_type IN ('SETTLED', 'STARTING_TRIAL', 'CONVERTION', 'RENEWING', 'RESUMING', 'RECOVERING', 'RECOVERING_AUTORENEW', 'GRANTED')
  ) INTO v_has_pending;

  IF v_has_pending THEN
    -- Ativar premium para o usuário
    INSERT INTO user_premium_access (user_id, is_premium, plan_type, plan_updated_at, purchased_at)
    VALUES (p_user_id, true, 'premium', now(), now())
    ON CONFLICT (user_id) DO UPDATE SET 
      is_premium = true, 
      plan_type = 'premium',
      plan_updated_at = now();

    -- Processar cada evento pendente e adicionar acessos a produtos
    FOR v_event IN 
      SELECT bel.id, bel.payload
      FROM billing_event_logs bel
      WHERE LOWER(bel.email) = LOWER(p_email) 
        AND bel.processed = false
        AND bel.event_type IN ('SETTLED', 'STARTING_TRIAL', 'CONVERTION', 'RENEWING', 'RESUMING', 'RECOVERING', 'RECOVERING_AUTORENEW', 'GRANTED')
    LOOP
      -- Extrair product_id do payload e adicionar acesso
      DECLARE
        v_product_id TEXT;
        v_product_type TEXT;
      BEGIN
        -- Tentar extrair o product_id do payload
        v_product_id := v_event.payload->'subscription'->'price_point'->'features'->0->>'ident';
        
        IF v_product_id IS NOT NULL THEN
          -- Buscar o tipo de produto
          SELECT pd.product_type INTO v_product_type
          FROM product_definitions pd
          WHERE pd.product_id = v_product_id;
          
          -- Se não encontrar, usar 'base' como padrão
          IF v_product_type IS NULL THEN
            v_product_type := 'base';
          END IF;
          
          -- Inserir ou atualizar acesso ao produto
          INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
          VALUES (p_user_id, v_product_id, v_product_type, true, now())
          ON CONFLICT (user_id, product_id) DO UPDATE SET
            is_active = true,
            granted_at = now(),
            revoked_at = NULL;
        END IF;
      END;
    END LOOP;

    -- Marcar eventos como processados e associar ao usuário
    UPDATE billing_event_logs
    SET processed = true, 
        user_id = p_user_id,
        processed_at = now()
    WHERE LOWER(email) = LOWER(p_email) AND processed = false;

    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;