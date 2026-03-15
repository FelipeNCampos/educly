-- Atualizar a função process_pending_billing_events para extrair product_id de TODOS os caminhos possíveis
-- Inclui: subscription.price_point.features, oneoff.price_point.features (upsells FF), e hotmart data.product.id

DROP FUNCTION IF EXISTS public.process_pending_billing_events(uuid, text);

CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_event RECORD;
  v_raw_product_id TEXT;
  v_product_type TEXT;
  v_events_processed INTEGER := 0;
  v_extraction_path TEXT;
BEGIN
  -- Process all pending billing events for this email
  -- Supports BOTH Funnelfox AND Hotmart events
  FOR v_event IN 
    SELECT * FROM billing_event_logs 
    WHERE LOWER(email) = LOWER(p_email)
      AND (status = 'pending' OR status = 'USER_NOT_FOUND')
      AND processed = false
      AND event_type IN (
        -- Funnelfox events
        'SETTLED', 'STARTING_TRIAL', 'subscription_settled', 'subscription_trial_started', 'GRANTED',
        'CONVERTION', 'RENEWING', 'RESUMING', 'RECOVERING', 'RECOVERING_AUTORENEW',
        -- Hotmart events
        'PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 'PURCHASE_PROTEST', 'PURCHASE_DELAYED'
      )
    ORDER BY created_at ASC
  LOOP
    BEGIN
      -- Extract product_id from ALL possible payload structures
      -- Priority order: subscription features > oneoff features > direct paths > hotmart
      
      -- 1. Funnelfox: subscription features (compra recorrente)
      v_raw_product_id := v_event.payload->'subscription'->'price_point'->'features'->0->>'ident';
      IF v_raw_product_id IS NOT NULL THEN
        v_extraction_path := 'subscription.price_point.features';
      END IF;
      
      -- 2. Funnelfox: oneoff features (upsells/compras avulsas)
      IF v_raw_product_id IS NULL THEN
        v_raw_product_id := v_event.payload->'oneoff'->'price_point'->'features'->0->>'ident';
        IF v_raw_product_id IS NOT NULL THEN
          v_extraction_path := 'oneoff.price_point.features';
        END IF;
      END IF;
      
      -- 3. Direct product_id paths (legacy)
      IF v_raw_product_id IS NULL THEN
        v_raw_product_id := v_event.payload->>'product_id';
        IF v_raw_product_id IS NOT NULL THEN
          v_extraction_path := 'payload.product_id';
        END IF;
      END IF;
      
      IF v_raw_product_id IS NULL THEN
        v_raw_product_id := v_event.payload->'metadata'->>'product_id';
        IF v_raw_product_id IS NOT NULL THEN
          v_extraction_path := 'payload.metadata.product_id';
        END IF;
      END IF;
      
      -- 4. Hotmart path (data.product.id)
      IF v_raw_product_id IS NULL THEN
        v_raw_product_id := v_event.payload->'data'->'product'->>'id';
        IF v_raw_product_id IS NOT NULL THEN
          v_extraction_path := 'hotmart.data.product.id';
        END IF;
      END IF;
      
      -- 5. Fallback to empty string
      IF v_raw_product_id IS NULL THEN
        v_raw_product_id := '';
        v_extraction_path := 'fallback_empty';
      END IF;
      
      -- Normalize: remove 'product_' prefix if present (Funnelfox sends this)
      v_raw_product_id := REPLACE(v_raw_product_id, 'product_', '');
      
      -- Log extraction info
      RAISE NOTICE 'Event %: extracted product_id=% via path=%', v_event.id, v_raw_product_id, v_extraction_path;
      
      -- First, try to get product_type from product_definitions table
      SELECT pd.product_type INTO v_product_type
      FROM product_definitions pd
      WHERE pd.product_id = v_raw_product_id
         OR pd.product_id = 'product_' || v_raw_product_id;
      
      -- If not found in definitions, use fallback logic
      IF v_product_type IS NULL THEN
        IF v_raw_product_id IN ('educy_base', 'base', '7018201', '') OR v_raw_product_id IS NULL THEN
          v_product_type := 'base';
        ELSIF v_raw_product_id IN ('educy_freelancer', 'freelancer', '7031196', '01KF4029KCA1QPQXXCMGN69DV9') THEN
          v_product_type := 'freelancer';
        ELSIF v_raw_product_id IN ('educy_ai_hub', 'ai_hub') THEN
          v_product_type := 'ai_hub';
        ELSE
          -- Default to 'base' for unknown products (SECURITY)
          v_product_type := 'base';
        END IF;
      END IF;
      
      RAISE NOTICE 'Resolved product_type=% for product_id=%', v_product_type, v_raw_product_id;
      
      -- Grant premium access
      INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
      VALUES (p_user_id, true, 'premium', NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        is_premium = true,
        plan_type = 'premium',
        plan_updated_at = NOW();
      
      -- Grant product access
      INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
      VALUES (p_user_id, COALESCE(NULLIF(v_raw_product_id, ''), 'billing_event_' || v_event.id), v_product_type, true, NOW())
      ON CONFLICT (user_id, product_id) DO UPDATE SET 
        is_active = true, 
        granted_at = NOW();
      
      -- Mark event as processed with extraction info
      UPDATE billing_event_logs 
      SET 
        processed = true,
        processed_at = NOW(),
        status = 'success',
        user_id = p_user_id,
        is_premium_set = true,
        error_message = 'Processed via path: ' || v_extraction_path || ', product_type: ' || v_product_type
      WHERE id = v_event.id;
      
      v_events_processed := v_events_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other events
      UPDATE billing_event_logs 
      SET 
        status = 'error',
        error_message = 'SQL Error: ' || SQLERRM
      WHERE id = v_event.id;
      
      RAISE NOTICE 'Error processing event %: %', v_event.id, SQLERRM;
    END;
  END LOOP;
  
  -- Log reconciliation result
  IF v_events_processed > 0 THEN
    RAISE NOTICE 'SUCCESS: Processed % billing events for user % (email: %)', v_events_processed, p_user_id, p_email;
  ELSE
    RAISE NOTICE 'No pending billing events found for email: %', p_email;
  END IF;
END;
$function$;

-- Adicionar evento GRANTED que estava faltando no webhook logging
COMMENT ON FUNCTION public.process_pending_billing_events IS 'Reconciles pending billing events (Funnelfox + Hotmart) during user signup. Extracts product_id from subscription, oneoff, or hotmart paths.';