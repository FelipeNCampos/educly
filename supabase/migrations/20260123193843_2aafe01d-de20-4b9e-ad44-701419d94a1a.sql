-- Fase 1: Adicionar colunas de expiração

-- 1.1 Adicionar expires_at em user_premium_access
ALTER TABLE public.user_premium_access
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 1.2 Adicionar expires_at em user_product_access  
ALTER TABLE public.user_product_access
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- 1.3 Adicionar expires_at em billing_event_logs para eventos pendentes
ALTER TABLE public.billing_event_logs
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Fase 2: Criar função de verificação e expiração de acessos
CREATE OR REPLACE FUNCTION public.check_and_expire_access()
RETURNS TABLE(
  expired_premium_count INTEGER,
  expired_product_count INTEGER,
  expired_events_count INTEGER,
  details JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_premium INTEGER := 0;
  v_expired_product INTEGER := 0;
  v_expired_events INTEGER := 0;
  v_details JSONB := '{"expired_users": [], "expired_events": []}'::JSONB;
  v_user RECORD;
  v_event RECORD;
BEGIN
  -- 1. Revogar acesso premium de usuários com expires_at expirado
  FOR v_user IN 
    SELECT upa.user_id, au.email
    FROM user_premium_access upa
    LEFT JOIN auth.users au ON au.id = upa.user_id
    WHERE upa.is_premium = true 
      AND upa.expires_at IS NOT NULL 
      AND upa.expires_at < NOW()
  LOOP
    -- Revogar acesso premium
    UPDATE user_premium_access
    SET is_premium = false, plan_updated_at = NOW()
    WHERE user_id = v_user.user_id;
    
    -- Revogar todos os produtos ativos
    UPDATE user_product_access
    SET is_active = false, revoked_at = NOW()
    WHERE user_id = v_user.user_id AND is_active = true;
    
    v_expired_premium := v_expired_premium + 1;
    
    -- Log para auditoria
    v_details := jsonb_set(
      v_details,
      '{expired_users}',
      v_details->'expired_users' || jsonb_build_object(
        'user_id', v_user.user_id,
        'email', v_user.email,
        'expired_at', NOW()
      )
    );
  END LOOP;

  -- 2. Marcar eventos USER_NOT_FOUND com mais de 7 dias como expirados
  FOR v_event IN
    SELECT id, email, event_type, created_at
    FROM billing_event_logs
    WHERE status = 'USER_NOT_FOUND'
      AND processed = false
      AND created_at < NOW() - INTERVAL '7 days'
  LOOP
    UPDATE billing_event_logs
    SET status = 'expired_no_signup',
        processed = true,
        processed_at = NOW(),
        error_message = 'Auto-expired: user did not register within 7 days'
    WHERE id = v_event.id;
    
    v_expired_events := v_expired_events + 1;
    
    v_details := jsonb_set(
      v_details,
      '{expired_events}',
      v_details->'expired_events' || jsonb_build_object(
        'event_id', v_event.id,
        'email', v_event.email,
        'event_type', v_event.event_type,
        'created_at', v_event.created_at
      )
    );
  END LOOP;

  -- 3. Contar produtos expirados individualmente
  SELECT COUNT(*) INTO v_expired_product
  FROM user_product_access
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  -- Revogar produtos expirados
  UPDATE user_product_access
  SET is_active = false, revoked_at = NOW()
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();

  RETURN QUERY SELECT v_expired_premium, v_expired_product, v_expired_events, v_details;
END;
$$;

-- Fase 3: Atualizar process_pending_billing_events para definir expires_at
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_product_type TEXT;
  v_product_id TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Loop through all pending/USER_NOT_FOUND billing events for this email
  -- IMPORTANT: Ignore expired events
  FOR v_event IN 
    SELECT * FROM billing_event_logs 
    WHERE LOWER(email) = LOWER(p_email)
      AND (status = 'pending' OR status = 'USER_NOT_FOUND')
      AND status != 'expired_no_signup' -- Ignore expired events
      AND processed = false
      AND UPPER(event_type) IN (
        'SETTLED', 'STARTING_TRIAL', 'SUBSCRIPTION_SETTLED', 
        'SUBSCRIPTION_TRIAL_STARTED', 'GRANTED',
        'CONVERTION', 'RENEWING', 'RESUMING', 
        'RECOVERING', 'RECOVERING_AUTORENEW',
        'PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 
        'PURCHASE_PROTEST', 'PURCHASE_DELAYED'
      )
    ORDER BY created_at ASC
  LOOP
    -- Check if event is older than 7 days (expired trial)
    IF v_event.created_at < NOW() - INTERVAL '7 days' THEN
      UPDATE billing_event_logs 
      SET status = 'expired_no_signup',
          processed = true,
          processed_at = NOW(),
          error_message = 'Trial expired before user registration'
      WHERE id = v_event.id;
      CONTINUE;
    END IF;

    -- Extract product_id from payload
    v_product_id := COALESCE(
      v_event.payload->>'product_id',
      v_event.payload->'data'->'product'->>'id',
      v_event.payload->'oneoff'->>'product_id'
    );
    
    -- Look up product type from product_definitions
    SELECT product_type INTO v_product_type 
    FROM product_definitions 
    WHERE product_id = v_product_id;
    
    -- Default to 'base' if not found
    IF v_product_type IS NULL THEN
      v_product_type := 'base';
    END IF;
    
    -- Calculate expires_at based on event type
    -- Trial: 7 days from event, Subscription: 35 days (monthly + 5 day grace)
    IF UPPER(v_event.event_type) IN ('STARTING_TRIAL', 'SUBSCRIPTION_TRIAL_STARTED') THEN
      v_expires_at := NOW() + INTERVAL '7 days';
    ELSE
      v_expires_at := NOW() + INTERVAL '35 days';
    END IF;
    
    -- Grant premium access with expiration
    INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at, expires_at)
    VALUES (p_user_id, true, 'premium', NOW(), NOW(), v_expires_at)
    ON CONFLICT (user_id) DO UPDATE SET 
      is_premium = true, 
      plan_updated_at = NOW(),
      expires_at = GREATEST(user_premium_access.expires_at, v_expires_at);
    
    -- Grant product access with expiration
    INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at, expires_at)
    VALUES (p_user_id, COALESCE(v_product_id, 'unknown'), v_product_type, true, NOW(), v_expires_at)
    ON CONFLICT (user_id, product_id) DO UPDATE SET 
      is_active = true, 
      granted_at = NOW(),
      expires_at = GREATEST(user_product_access.expires_at, v_expires_at);
    
    -- Mark event as processed
    UPDATE billing_event_logs 
    SET processed = true, 
        processed_at = NOW(), 
        status = 'success',
        user_id = p_user_id,
        is_premium_set = true
    WHERE id = v_event.id;
  END LOOP;
END;
$$;

-- Fase 4: Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_user_premium_access_expires 
ON user_premium_access(expires_at) 
WHERE is_premium = true AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_product_access_expires 
ON user_product_access(expires_at) 
WHERE is_active = true AND expires_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_billing_event_logs_pending_expires
ON billing_event_logs(created_at)
WHERE status = 'USER_NOT_FOUND' AND processed = false;