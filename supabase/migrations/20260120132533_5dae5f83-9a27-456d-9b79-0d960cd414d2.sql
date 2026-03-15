
-- Drop and recreate the function with Hotmart support
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_email text, p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_raw_product_id TEXT;
  v_product_type TEXT;
  v_final_type TEXT;
BEGIN
  -- Process all pending billing events for this email
  -- Now includes both Funnelfox AND Hotmart events
  FOR v_event IN 
    SELECT * FROM billing_event_logs 
    WHERE LOWER(email) = LOWER(p_email)
      AND (status = 'pending' OR status = 'USER_NOT_FOUND')
      AND processed = false
      AND event_type IN (
        -- Funnelfox events
        'SETTLED', 'STARTING_TRIAL', 'subscription_settled', 'subscription_trial_started',
        -- Hotmart events
        'PURCHASE_COMPLETE', 'PURCHASE_APPROVED'
      )
  LOOP
    BEGIN
      -- Extract product_id from different payload structures
      v_raw_product_id := COALESCE(
        -- Funnelfox paths
        v_event.payload->>'product_id',
        v_event.payload->'metadata'->>'product_id',
        -- Hotmart path (data.product.id)
        v_event.payload->'data'->'product'->>'id',
        -- Fallback
        ''
      );
      
      -- Normalize: remove 'product_' prefix if present (Funnelfox sends this)
      v_raw_product_id := REPLACE(v_raw_product_id, 'product_', '');
      
      -- First, try to get product_type from product_definitions table
      SELECT product_type INTO v_final_type
      FROM product_definitions
      WHERE product_id = v_raw_product_id;
      
      -- If not found in definitions, use fallback logic
      IF v_final_type IS NULL THEN
        IF v_raw_product_id IN ('educy_base', 'base', '') OR v_raw_product_id IS NULL THEN
          v_final_type := 'base';
        ELSIF v_raw_product_id IN ('educy_freelancer', 'freelancer') THEN
          v_final_type := 'freelancer';
        ELSIF v_raw_product_id IN ('educy_ai_hub', 'ai_hub') THEN
          v_final_type := 'ai_hub';
        ELSE
          -- Default to 'base' for unknown products
          v_final_type := 'base';
        END IF;
      END IF;
      
      -- Insert/update user_premium_access
      INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
      VALUES (p_user_id, true, 'premium', NOW(), NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        is_premium = true,
        plan_type = 'premium',
        plan_updated_at = NOW();
      
      -- Insert into user_product_access if not exists
      INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
      VALUES (p_user_id, v_raw_product_id, v_final_type, true, NOW())
      ON CONFLICT DO NOTHING;
      
      -- Mark event as processed
      UPDATE billing_event_logs 
      SET 
        processed = true,
        processed_at = NOW(),
        status = 'success',
        user_id = p_user_id,
        is_premium_set = true
      WHERE id = v_event.id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other events
      UPDATE billing_event_logs 
      SET 
        status = 'error',
        error_message = SQLERRM
      WHERE id = v_event.id;
    END;
  END LOOP;
END;
$$;
