-- Create function for updated_at trigger
CREATE OR REPLACE FUNCTION public.update_freelancer_progress_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for freelancer module progress
CREATE TABLE public.freelancer_module_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  module_number INTEGER NOT NULL CHECK (module_number BETWEEN 1 AND 8),
  step_index INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, module_number)
);

-- Enable RLS
ALTER TABLE public.freelancer_module_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own progress
CREATE POLICY "Users can view own freelancer progress"
  ON public.freelancer_module_progress
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert own freelancer progress"
  ON public.freelancer_module_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update only their own progress
CREATE POLICY "Users can update own freelancer progress"
  ON public.freelancer_module_progress
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all progress (for analytics)
CREATE POLICY "Admins can view all freelancer progress"
  ON public.freelancer_module_progress
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Create trigger for automatic updated_at
CREATE TRIGGER update_freelancer_progress_timestamp
  BEFORE UPDATE ON public.freelancer_module_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_freelancer_progress_updated_at();