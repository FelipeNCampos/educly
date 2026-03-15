-- Tabela para logar todos os eventos de billing (inclusive quando usuário ainda não existe)
CREATE TABLE public.billing_event_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB,
  processed BOOLEAN DEFAULT false,
  is_premium_set BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ
);

-- Apenas admins podem ver os logs
ALTER TABLE public.billing_event_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view billing event logs"
  ON public.billing_event_logs FOR SELECT
  USING (is_admin());

-- Índices para buscar eventos pendentes
CREATE INDEX idx_billing_event_logs_email ON public.billing_event_logs(email);
CREATE INDEX idx_billing_event_logs_processed ON public.billing_event_logs(processed);
CREATE INDEX idx_billing_event_logs_event_type ON public.billing_event_logs(event_type);

-- Função para processar eventos pendentes após signup
CREATE OR REPLACE FUNCTION public.process_pending_billing_events(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_has_pending BOOLEAN := FALSE;
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