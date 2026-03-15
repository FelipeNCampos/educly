-- Add language column to product_definitions
ALTER TABLE product_definitions ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'es';

-- Insert new French products
INSERT INTO product_definitions (name, product_id, product_type, description, language)
VALUES 
  ('Educly Frances', '01KFH6TYKXMKQ5AJQJ4PZZ1G43', 'base', 'Acesso básico - Idioma Francês', 'fr'),
  ('Educly Premium Frances', '01KFHKR3GQBV995WFEGPAXYTPQ', 'base', 'Acesso premium - Idioma Francês', 'fr')
ON CONFLICT (product_id) DO UPDATE SET language = 'fr';

-- Update existing products to Spanish (default)
UPDATE product_definitions SET language = 'es' WHERE language IS NULL;