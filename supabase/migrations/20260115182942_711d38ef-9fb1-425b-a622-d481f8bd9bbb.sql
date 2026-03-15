-- Atualizar os 28 dias com as ferramentas AI corretas e títulos apropriados
-- Baseado no conteúdo do pt-lessons.json

-- Dias 1-4: ChatGPT (e734b5dc-a23e-467c-9001-998e81e2d677)
UPDATE challenge_days SET 
  ai_tool_id = 'e734b5dc-a23e-467c-9001-998e81e2d677',
  title = 'O Que é o ChatGPT',
  description = 'Fundamentos e primeiros passos com ChatGPT'
WHERE day_number = 1;

UPDATE challenge_days SET 
  ai_tool_id = 'e734b5dc-a23e-467c-9001-998e81e2d677',
  title = 'Engenharia de Prompt',
  description = 'Técnicas para criar prompts eficazes'
WHERE day_number = 2;

UPDATE challenge_days SET 
  ai_tool_id = 'e734b5dc-a23e-467c-9001-998e81e2d677',
  title = 'Personas Consultoras',
  description = 'Como usar personas para respostas especializadas'
WHERE day_number = 3;

UPDATE challenge_days SET 
  ai_tool_id = 'e734b5dc-a23e-467c-9001-998e81e2d677',
  title = 'Projeto de Marketing',
  description = 'Aplicação prática: campanha de marketing completa'
WHERE day_number = 4;

-- Dias 5-7: Claude (e2a47770-4633-4a88-aff2-aa773d2e93eb)
UPDATE challenge_days SET 
  ai_tool_id = 'e2a47770-4633-4a88-aff2-aa773d2e93eb',
  title = 'Conhecendo o Claude',
  description = 'Introdução ao Claude e suas capacidades únicas'
WHERE day_number = 5;

UPDATE challenge_days SET 
  ai_tool_id = 'e2a47770-4633-4a88-aff2-aa773d2e93eb',
  title = 'Claude para Copywriting',
  description = 'Técnicas AIDA e PAS para textos persuasivos'
WHERE day_number = 6;

UPDATE challenge_days SET 
  ai_tool_id = 'e2a47770-4633-4a88-aff2-aa773d2e93eb',
  title = 'Projeto Claude',
  description = 'Aplicação prática: criando copy profissional'
WHERE day_number = 7;

-- Dias 8-10: DeepSeek (de693814-b259-4156-995f-0af7710d8915)
UPDATE challenge_days SET 
  ai_tool_id = 'de693814-b259-4156-995f-0af7710d8915',
  title = 'Introdução ao DeepSeek',
  description = 'Conhecendo o DeepSeek e análise de dados'
WHERE day_number = 8;

UPDATE challenge_days SET 
  ai_tool_id = 'de693814-b259-4156-995f-0af7710d8915',
  title = 'DeepSeek para Análise',
  description = 'Análise de dados e consultas SQL com IA'
WHERE day_number = 9;

UPDATE challenge_days SET 
  ai_tool_id = 'de693814-b259-4156-995f-0af7710d8915',
  title = 'Projeto DeepSeek',
  description = 'Aplicação prática: análise de dados empresariais'
WHERE day_number = 10;

-- Dias 11-13: Gemini (54c6e3f9-c427-4087-988a-7475bdbfdf26)
UPDATE challenge_days SET 
  ai_tool_id = '54c6e3f9-c427-4087-988a-7475bdbfdf26',
  title = 'Introdução ao Gemini',
  description = 'Conhecendo o Gemini do Google'
WHERE day_number = 11;

UPDATE challenge_days SET 
  ai_tool_id = '54c6e3f9-c427-4087-988a-7475bdbfdf26',
  title = 'Gemini para Produtividade',
  description = 'Integrações com Google Workspace'
WHERE day_number = 12;

UPDATE challenge_days SET 
  ai_tool_id = '54c6e3f9-c427-4087-988a-7475bdbfdf26',
  title = 'Projeto Gemini',
  description = 'Aplicação prática: automação de fluxos de trabalho'
WHERE day_number = 13;

-- Dias 14-17: NanoBanana (a035c405-5584-47bc-8e01-155993972c8b)
UPDATE challenge_days SET 
  ai_tool_id = 'a035c405-5584-47bc-8e01-155993972c8b',
  title = 'Introdução ao NanoBanana',
  description = 'Fundamentos de geração de imagens com IA'
WHERE day_number = 14;

UPDATE challenge_days SET 
  ai_tool_id = 'a035c405-5584-47bc-8e01-155993972c8b',
  title = 'Estilos Artísticos',
  description = 'Explorando diferentes estilos visuais'
WHERE day_number = 15;

UPDATE challenge_days SET 
  ai_tool_id = 'a035c405-5584-47bc-8e01-155993972c8b',
  title = 'Composição Avançada',
  description = 'Técnicas avançadas de composição visual'
WHERE day_number = 16;

UPDATE challenge_days SET 
  ai_tool_id = 'a035c405-5584-47bc-8e01-155993972c8b',
  title = 'Projeto Visual',
  description = 'Aplicação prática: campanha visual completa'
WHERE day_number = 17;

-- Dias 18-21: Lovable (7cf59924-c93d-4c82-9873-bd569713f12c)
UPDATE challenge_days SET 
  ai_tool_id = '7cf59924-c93d-4c82-9873-bd569713f12c',
  title = 'Introdução ao Lovable',
  description = 'Criando aplicativos web com IA'
WHERE day_number = 18;

UPDATE challenge_days SET 
  ai_tool_id = '7cf59924-c93d-4c82-9873-bd569713f12c',
  title = 'Design Systems',
  description = 'Criando sistemas de design consistentes'
WHERE day_number = 19;

UPDATE challenge_days SET 
  ai_tool_id = '7cf59924-c93d-4c82-9873-bd569713f12c',
  title = 'Funcionalidades Avançadas',
  description = 'Integrações e funcionalidades complexas'
WHERE day_number = 20;

UPDATE challenge_days SET 
  ai_tool_id = '7cf59924-c93d-4c82-9873-bd569713f12c',
  title = 'Projeto App Completo',
  description = 'Aplicação prática: app web funcional'
WHERE day_number = 21;

-- Dias 22-24: Captions (256d0946-057d-48b5-9b72-cb2ef1982710)
UPDATE challenge_days SET 
  ai_tool_id = '256d0946-057d-48b5-9b72-cb2ef1982710',
  title = 'Fundamentos de Vídeo',
  description = 'Introdução ao Captions para edição de vídeo'
WHERE day_number = 22;

UPDATE challenge_days SET 
  ai_tool_id = '256d0946-057d-48b5-9b72-cb2ef1982710',
  title = 'Edição Dinâmica',
  description = 'Técnicas de edição e legendas automáticas'
WHERE day_number = 23;

UPDATE challenge_days SET 
  ai_tool_id = '256d0946-057d-48b5-9b72-cb2ef1982710',
  title = 'Projeto Vídeo',
  description = 'Aplicação prática: vídeo profissional completo'
WHERE day_number = 24;

-- Dias 25-28: ElevenLabs (93935368-6d10-4517-8d0b-9b384fad8122)
UPDATE challenge_days SET 
  ai_tool_id = '93935368-6d10-4517-8d0b-9b384fad8122',
  title = 'Introdução ao ElevenLabs',
  description = 'Clonagem e síntese de voz com IA'
WHERE day_number = 25;

UPDATE challenge_days SET 
  ai_tool_id = '93935368-6d10-4517-8d0b-9b384fad8122',
  title = 'Controle de Emoção',
  description = 'Técnicas avançadas de expressividade vocal'
WHERE day_number = 26;

UPDATE challenge_days SET 
  ai_tool_id = '93935368-6d10-4517-8d0b-9b384fad8122',
  title = 'Projeto Narração',
  description = 'Aplicação prática: audiobook ou podcast'
WHERE day_number = 27;

UPDATE challenge_days SET 
  ai_tool_id = '93935368-6d10-4517-8d0b-9b384fad8122',
  title = 'Graduação - Arquiteto de IA',
  description = 'Projeto final: integrando todas as ferramentas'
WHERE day_number = 28;