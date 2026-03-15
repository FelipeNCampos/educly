-- Tabela para métricas manuais do painel administrativo
CREATE TABLE IF NOT EXISTS public.admin_manual_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date date NOT NULL DEFAULT CURRENT_DATE,
  nps_score numeric(3,1),
  emails_sent integer DEFAULT 0,
  emails_opened integer DEFAULT 0,
  emails_clicked integer DEFAULT 0,
  support_tickets_opened integer DEFAULT 0,
  support_tickets_resolved integer DEFAULT 0,
  notes text,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(metric_date)
);

-- Enable RLS
ALTER TABLE public.admin_manual_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Only admin can view
CREATE POLICY "Admin can view manual metrics"
ON public.admin_manual_metrics
FOR SELECT
USING (is_admin());

-- Policy: Only admin can insert
CREATE POLICY "Admin can insert manual metrics"
ON public.admin_manual_metrics
FOR INSERT
WITH CHECK (is_admin());

-- Policy: Only admin can update
CREATE POLICY "Admin can update manual metrics"
ON public.admin_manual_metrics
FOR UPDATE
USING (is_admin());

-- Policy: Only admin can delete
CREATE POLICY "Admin can delete manual metrics"
ON public.admin_manual_metrics
FOR DELETE
USING (is_admin());