-- Drop the duplicate function with different parameter order
DROP FUNCTION IF EXISTS public.process_pending_billing_events(text, uuid);

-- Recreate the unified function with proper support for ALL billing event types
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id uuid, p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_event RECORD;
  v_raw_product_id TEXT;
  v_product_type TEXT;
  v_events_processed INTEGER := 0;
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
        -- Hotmart events
        'PURCHASE_COMPLETE', 'PURCHASE_APPROVED'
      )
    ORDER BY created_at ASC
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
      SELECT pd.product_type INTO v_product_type
      FROM product_definitions pd
      WHERE pd.product_id = v_raw_product_id;
      
      -- If not found in definitions, use fallback logic
      IF v_product_type IS NULL THEN
        IF v_raw_product_id IN ('educy_base', 'base', '7018201', '') OR v_raw_product_id IS NULL THEN
          v_product_type := 'base';
        ELSIF v_raw_product_id IN ('educy_freelancer', 'freelancer', '7031196') THEN
          v_product_type := 'freelancer';
        ELSIF v_raw_product_id IN ('educy_ai_hub', 'ai_hub') THEN
          v_product_type := 'ai_hub';
        ELSE
          -- Default to 'base' for unknown products
          v_product_type := 'base';
        END IF;
      END IF;
      
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
      
      -- Mark event as processed
      UPDATE billing_event_logs 
      SET 
        processed = true,
        processed_at = NOW(),
        status = 'success',
        user_id = p_user_id,
        is_premium_set = true
      WHERE id = v_event.id;
      
      v_events_processed := v_events_processed + 1;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue processing other events
      UPDATE billing_event_logs 
      SET 
        status = 'error',
        error_message = SQLERRM
      WHERE id = v_event.id;
    END;
  END LOOP;
  
  -- Log reconciliation result (for debugging)
  IF v_events_processed > 0 THEN
    RAISE NOTICE 'Processed % billing events for user %', v_events_processed, p_user_id;
  END IF;
END;
$$;

-- EMERGENCY FIX: Grant access to all users who purchased today but didn't get access
DO $$
DECLARE
  rec RECORD;
  v_product_id TEXT;
  v_product_type TEXT;
BEGIN
  FOR rec IN 
    SELECT DISTINCT 
      au.id as user_id,
      au.email,
      bel.id as event_id,
      bel.event_type,
      bel.payload
    FROM auth.users au
    JOIN billing_event_logs bel ON LOWER(bel.email) = LOWER(au.email)
    WHERE bel.status = 'USER_NOT_FOUND'
      AND bel.processed = false
      AND bel.event_type IN ('SETTLED', 'STARTING_TRIAL', 'PURCHASE_COMPLETE', 'PURCHASE_APPROVED', 'GRANTED')
  LOOP
    -- Extract product_id
    v_product_id := COALESCE(
      rec.payload->>'product_id',
      rec.payload->'metadata'->>'product_id',
      rec.payload->'data'->'product'->>'id',
      ''
    );
    v_product_id := REPLACE(v_product_id, 'product_', '');
    
    -- Determine product type
    IF v_product_id IN ('educy_base', 'base', '7018201', '') OR v_product_id IS NULL THEN
      v_product_type := 'base';
    ELSIF v_product_id IN ('educy_freelancer', 'freelancer', '7031196') THEN
      v_product_type := 'freelancer';
    ELSE
      v_product_type := 'base';
    END IF;
    
    -- Grant premium access
    INSERT INTO user_premium_access (user_id, is_premium, plan_type, purchased_at, plan_updated_at)
    VALUES (rec.user_id, true, 'premium', NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET 
      is_premium = true,
      plan_type = 'premium',
      plan_updated_at = NOW();
    
    -- Grant product access
    INSERT INTO user_product_access (user_id, product_id, product_type, is_active, granted_at)
    VALUES (rec.user_id, COALESCE(NULLIF(v_product_id, ''), 'manual_fix_' || rec.event_id), v_product_type, true, NOW())
    ON CONFLICT (user_id, product_id) DO UPDATE SET 
      is_active = true,
      granted_at = NOW();
    
    -- Mark event as processed
    UPDATE billing_event_logs 
    SET 
      processed = true,
      processed_at = NOW(),
      status = 'success',
      user_id = rec.user_id,
      is_premium_set = true
    WHERE id = rec.event_id;
    
    RAISE NOTICE 'Fixed access for user: %', rec.email;
  END LOOP;
END $$;