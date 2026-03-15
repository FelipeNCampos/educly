-- Add quiz completion tracking to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_quiz_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS personalized_trail_quiz_completed BOOLEAN DEFAULT false;