-- Add medals for the 28-day challenge trail
INSERT INTO public.freelancer_medals (slug, name, description, icon_name, color, tier, unlock_condition, order_index) VALUES
-- Trail 28 Days - Week milestones
('trail_week1', 'Primeira Semana', 'Complete a primeira semana da trilha de 28 dias', 'Calendar', 'blue', 'bronze', '{"type": "trail_days_completed", "count": 7}', 10),
('trail_week2', 'Duas Semanas', 'Complete duas semanas da trilha de 28 dias', 'Calendar', 'blue', 'silver', '{"type": "trail_days_completed", "count": 14}', 11),
('trail_week3', 'Três Semanas', 'Complete três semanas da trilha de 28 dias', 'Calendar', 'blue', 'gold', '{"type": "trail_days_completed", "count": 21}', 12),
('trail_complete', 'Mestre da Trilha', 'Complete toda a trilha de 28 dias', 'Trophy', 'amber', 'platinum', '{"type": "trail_days_completed", "count": 28}', 13),
-- Tool mastery medals
('chatgpt_master', 'Mestre do ChatGPT', 'Complete todos os dias de ChatGPT', 'MessageSquare', 'green', 'gold', '{"type": "tool_completed", "tool": "chatgpt"}', 14),
('claude_master', 'Mestre do Claude', 'Complete todos os dias de Claude', 'Bot', 'purple', 'gold', '{"type": "tool_completed", "tool": "claude"}', 15),
('gemini_master', 'Mestre do Gemini', 'Complete todos os dias de Gemini', 'Sparkles', 'cyan', 'gold', '{"type": "tool_completed", "tool": "gemini"}', 16),
-- Dedication medals
('early_bird', 'Madrugador', 'Complete uma aula antes das 8h da manhã', 'Sunrise', 'yellow', 'bronze', '{"type": "early_lesson", "hour": 8}', 17),
('night_owl', 'Coruja Noturna', 'Complete uma aula depois das 22h', 'Moon', 'purple', 'bronze', '{"type": "late_lesson", "hour": 22}', 18)
ON CONFLICT (slug) DO NOTHING;

-- Grant all existing medals to the admin users
INSERT INTO public.user_freelancer_medals (user_id, medal_id)
SELECT '0994205a-c838-461e-b518-962f45aa65e6'::uuid, id FROM public.freelancer_medals
ON CONFLICT DO NOTHING;

INSERT INTO public.user_freelancer_medals (user_id, medal_id)
SELECT '824890d4-c50f-47dd-8212-2a0dbe693bf5'::uuid, id FROM public.freelancer_medals
ON CONFLICT DO NOTHING;