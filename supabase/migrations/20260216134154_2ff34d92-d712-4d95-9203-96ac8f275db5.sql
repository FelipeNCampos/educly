
-- ETAPA 1: Acesso retroativo para compradores do fim de semana
-- 1. Inserir billing_event_logs para todas as compras em pending_thank_you_emails que não têm correspondência
DO $$
DECLARE
  rec RECORD;
  v_user_id UUID;
  v_product_type TEXT;
BEGIN
  FOR rec IN 
    SELECT DISTINCT ON (pte.email, pte.product_id) 
      pte.email,
      pte.buyer_name,
      pte.product_id,
      pte.product_type as pte_product_type,
      pte.created_at
    FROM pending_thank_you_emails pte
    WHERE pte.created_at >= '2025-02-14'
      AND NOT EXISTS (
        SELECT 1 FROM billing_event_logs bel 
        WHERE LOWER(bel.email) = LOWER(pte.email)
          AND bel.event_type = 'PURCHASE_COMPLETE'
          AND bel.status = 'success'
      )
    ORDER BY pte.email, pte.product_id, pte.created_at ASC
  LOOP
    -- Insert billing_event_log
    INSERT INTO billing_event_logs (email, event_type, payload, status, processed, created_at)
    VALUES (
      LOWER(rec.email),
      'PURCHASE_COMPLETE',
      jsonb_build_object(
        'product_id', rec.product_id,
        'source', 'retroactive_fix_2025_02_16',
        'buyer_name', rec.buyer_name,
        'original_created_at', rec.created_at
      ),
      'pending',
      false,
      rec.created_at
    );

    -- Check if user is registered
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(rec.email);
    
    IF v_user_id IS NOT NULL THEN
      -- Look up product type from product_definitions
      SELECT pd.product_type INTO v_product_type
      FROM product_definitions pd
      WHERE pd.product_id = rec.product_id;
      
      IF v_product_type IS NULL THEN
        v_product_type := COALESCE(rec.pte_product_type, 'base');
      END IF;

      -- Grant premium access
      INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
      VALUES (v_user_id, true, 'premium', rec.created_at, NOW())
      ON CONFLICT (user_id) DO UPDATE SET 
        is_premium = true, 
        plan_type = 'premium',
        plan_updated_at = NOW();

      -- Grant product access (handle combo)
      IF v_product_type = 'combo_freelancer_ai' THEN
        INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
        VALUES (v_user_id, COALESCE(rec.product_id, 'unknown'), 'freelancer', true, NOW())
        ON CONFLICT (user_id, product_id) DO UPDATE SET is_active = true, granted_at = NOW();
        
        INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
        VALUES (v_user_id, COALESCE(rec.product_id, 'unknown') || '_ai_hub', 'ai_hub', true, NOW())
        ON CONFLICT (user_id, product_id) DO UPDATE SET is_active = true, granted_at = NOW();
      ELSE
        INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
        VALUES (v_user_id, COALESCE(rec.product_id, 'unknown'), v_product_type, true, NOW())
        ON CONFLICT (user_id, product_id) DO UPDATE SET is_active = true, granted_at = NOW();
      END IF;

      -- Mark billing event as processed
      UPDATE billing_event_logs
      SET processed = true, processed_at = NOW(), status = 'success', user_id = v_user_id, is_premium_set = true
      WHERE LOWER(email) = LOWER(rec.email)
        AND event_type = 'PURCHASE_COMPLETE'
        AND status = 'pending'
        AND processed = false;

      RAISE NOTICE 'Granted access to: % (product: %)', rec.email, v_product_type;
    ELSE
      -- User not registered yet - billing_event_log stays pending for reconciliation on signup
      UPDATE billing_event_logs
      SET status = 'USER_NOT_FOUND'
      WHERE LOWER(email) = LOWER(rec.email)
        AND event_type = 'PURCHASE_COMPLETE'
        AND status = 'pending'
        AND processed = false;
        
      RAISE NOTICE 'User not found (will reconcile on signup): %', rec.email;
    END IF;
  END LOOP;
END $$;
