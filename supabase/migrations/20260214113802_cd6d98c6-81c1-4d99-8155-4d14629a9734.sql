
-- Table to queue thank-you emails with a 5-minute delay for aggregation
CREATE TABLE public.pending_thank_you_emails (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  buyer_name TEXT NOT NULL DEFAULT 'Aluno',
  product_id TEXT,
  product_type TEXT,
  language TEXT NOT NULL DEFAULT 'es',
  send_after TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '5 minutes'),
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for efficient cron queries
CREATE INDEX idx_pending_emails_send_after ON public.pending_thank_you_emails (send_after) WHERE sent = false;
CREATE INDEX idx_pending_emails_email ON public.pending_thank_you_emails (email) WHERE sent = false;

-- Enable RLS
ALTER TABLE public.pending_thank_you_emails ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) can access this table
CREATE POLICY "Service role full access"
ON public.pending_thank_you_emails
FOR ALL
USING (true)
WITH CHECK (true);

-- Admins can view for debugging
CREATE POLICY "Admins can view pending emails"
ON public.pending_thank_you_emails
FOR SELECT
USING (is_admin());
