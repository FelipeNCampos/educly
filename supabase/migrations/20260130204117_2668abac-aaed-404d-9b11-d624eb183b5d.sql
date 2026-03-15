-- Add product definition for Educly App + Combo (AI Hub included)
INSERT INTO public.product_definitions (product_id, product_type, name, description, language)
VALUES (
  '01KG88G787M4W70J3GGAVS6RM1',
  'ai_hub',
  'Educly App + Combo',
  'Acesso completo ao Hub de IA (Assistentes)',
  'pt'
)
ON CONFLICT (product_id) DO UPDATE SET
  product_type = EXCLUDED.product_type,
  name = EXCLUDED.name,
  description = EXCLUDED.description;