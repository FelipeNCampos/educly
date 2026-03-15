-- Create medals table
CREATE TABLE public.freelancer_medals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'amber',
  tier TEXT NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  unlock_condition JSONB NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user medals table
CREATE TABLE public.user_freelancer_medals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medal_id UUID NOT NULL REFERENCES public.freelancer_medals(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, medal_id)
);

-- Enable RLS
ALTER TABLE public.freelancer_medals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_freelancer_medals ENABLE ROW LEVEL SECURITY;

-- Medals are public to view
CREATE POLICY "Anyone can view medals" 
ON public.freelancer_medals 
FOR SELECT 
USING (true);

-- Users can view their own earned medals
CREATE POLICY "Users can view their own earned medals" 
ON public.user_freelancer_medals 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can earn medals
CREATE POLICY "Users can earn medals" 
ON public.user_freelancer_medals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert default medals
INSERT INTO public.freelancer_medals (slug, name, description, icon_name, color, tier, unlock_condition, order_index) VALUES
-- Module completion medals
('first_step', 'Primeiro Passo', 'Complete seu primeiro módulo', 'Footprints', 'emerald', 'bronze', '{"type": "modules_completed", "count": 1}', 1),
('explorer', 'Explorador', 'Complete 3 módulos', 'Compass', 'blue', 'silver', '{"type": "modules_completed", "count": 3}', 2),
('dedicated', 'Dedicado', 'Complete 5 módulos', 'Target', 'purple', 'gold', '{"type": "modules_completed", "count": 5}', 3),
('master', 'Mestre Freelancer', 'Complete todos os 8 módulos', 'Crown', 'amber', 'platinum', '{"type": "modules_completed", "count": 8}', 4),

-- Streak medals
('streak_3', 'Em Ritmo', 'Mantenha uma sequência de 3 dias', 'Flame', 'orange', 'bronze', '{"type": "streak", "count": 3}', 5),
('streak_7', 'Constante', 'Mantenha uma sequência de 7 dias', 'Zap', 'yellow', 'silver', '{"type": "streak", "count": 7}', 6),
('streak_14', 'Imparável', 'Mantenha uma sequência de 14 dias', 'Rocket', 'red', 'gold', '{"type": "streak", "count": 14}', 7),

-- Speed medals
('fast_learner', 'Aprendiz Rápido', 'Complete um módulo em um único dia', 'Timer', 'cyan', 'silver', '{"type": "fast_module", "hours": 24}', 8),

-- Perfect medals
('perfect_quiz', 'Quiz Perfeito', 'Acerte todas as questões de um módulo na primeira tentativa', 'CheckCircle', 'green', 'gold', '{"type": "perfect_quiz", "count": 1}', 9);