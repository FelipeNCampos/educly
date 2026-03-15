
-- 1. Inserir as ferramentas AI
INSERT INTO ai_tools (name, slug, description, icon_name, color_gradient, category) VALUES
('ChatGPT', 'chatgpt', 'Assistente de IA conversacional da OpenAI para textos, ideias e programação', 'MessageSquare', 'from-green-500 to-emerald-600', 'conversacional'),
('Claude', 'claude', 'IA da Anthropic focada em conversas seguras e análises detalhadas', 'Brain', 'from-orange-500 to-amber-600', 'conversacional'),
('DeepSeek', 'deepseek', 'IA open-source especializada em raciocínio lógico e código', 'Search', 'from-blue-500 to-indigo-600', 'busca'),
('Gemini', 'gemini', 'IA multimodal do Google com integração a serviços Google', 'Sparkles', 'from-purple-500 to-violet-600', 'conversacional'),
('NanoBanana', 'nanobanana', 'Ferramenta de geração de imagens com IA', 'Image', 'from-yellow-500 to-orange-600', 'imagem'),
('Lovable', 'lovable', 'Plataforma para criar aplicativos web com IA', 'Heart', 'from-pink-500 to-rose-600', 'codigo'),
('Captions AI', 'captions', 'IA para legendas e edição de vídeos automatizada', 'Video', 'from-cyan-500 to-teal-600', 'video'),
('ElevenLabs', 'elevenlabs', 'Síntese de voz realista com clonagem de voz', 'Mic', 'from-red-500 to-pink-600', 'audio');

-- 2. Inserir o desafio principal
INSERT INTO challenges (name, slug, description, challenge_type, duration_days, difficulty, is_active, order_index, image_url) VALUES
('Desafio Iniciante de IA', 'iniciante-ia', 'Aprenda a dominar as principais ferramentas de IA em 28 dias com aulas práticas e exercícios diários', 'trail', 28, 'iniciante', true, 1, '/challenge-iniciante-ia.png');

-- 3. Inserir 28 fases na trail_phases (para trilha ChatGPT)
-- Primeiro pegamos o ID do ChatGPT
DO $$
DECLARE
  v_chatgpt_id uuid;
  v_challenge_id uuid;
BEGIN
  SELECT id INTO v_chatgpt_id FROM ai_tools WHERE slug = 'chatgpt';
  SELECT id INTO v_challenge_id FROM challenges WHERE slug = 'iniciante-ia';
  
  -- Semana 1: Fundamentos ChatGPT
  INSERT INTO trail_phases (ai_tool_id, phase_number, title, description, task_description) VALUES
  (v_chatgpt_id, 1, 'Primeiro Contato com ChatGPT', 'Conheça a interface e faça sua primeira conversa', 'Faça 3 perguntas diferentes ao ChatGPT e observe as respostas'),
  (v_chatgpt_id, 2, 'Entendendo Prompts', 'Aprenda o que são prompts e como estruturá-los', 'Reescreva um prompt vago de 3 formas diferentes e compare resultados'),
  (v_chatgpt_id, 3, 'Contexto é Tudo', 'Descubra como o contexto melhora as respostas', 'Peça uma receita sem contexto e depois com contexto detalhado'),
  (v_chatgpt_id, 4, 'Persona e Tom', 'Aprenda a definir personas para respostas personalizadas', 'Peça explicação sobre blockchain como professor, cientista e influencer'),
  (v_chatgpt_id, 5, 'Formato de Saída', 'Controle como o ChatGPT formata as respostas', 'Peça a mesma informação em lista, tabela e texto corrido'),
  (v_chatgpt_id, 6, 'Iteração e Refinamento', 'Aprenda a melhorar respostas através de interação', 'Refine uma resposta 3 vezes pedindo melhorias específicas'),
  (v_chatgpt_id, 7, 'Revisão Semana 1', 'Consolide o aprendizado da primeira semana', 'Crie um prompt completo usando todas as técnicas aprendidas');

  -- Semana 2: Técnicas Avançadas
  INSERT INTO trail_phases (ai_tool_id, phase_number, title, description, task_description) VALUES
  (v_chatgpt_id, 8, 'Chain of Thought', 'Faça a IA pensar passo a passo', 'Use "pense passo a passo" para resolver um problema de lógica'),
  (v_chatgpt_id, 9, 'Few-Shot Learning', 'Ensine com exemplos dentro do prompt', 'Dê 3 exemplos e peça para a IA seguir o padrão'),
  (v_chatgpt_id, 10, 'Role Playing Avançado', 'Crie personas complexas e especializadas', 'Simule uma entrevista de emprego com a IA como entrevistador'),
  (v_chatgpt_id, 11, 'Constraints e Limites', 'Aprenda a definir restrições nas respostas', 'Peça um texto com exatamente 100 palavras sobre um tema'),
  (v_chatgpt_id, 12, 'Prompts para Código', 'Use IA para programação e debugging', 'Peça para explicar e melhorar um trecho de código'),
  (v_chatgpt_id, 13, 'Análise de Textos', 'Extraia insights de textos longos', 'Resuma um artigo e extraia os 5 pontos principais'),
  (v_chatgpt_id, 14, 'Revisão Semana 2', 'Pratique técnicas avançadas de prompting', 'Combine chain-of-thought com few-shot em um prompt');

  -- Semana 3: Aplicações Práticas
  INSERT INTO trail_phases (ai_tool_id, phase_number, title, description, task_description) VALUES
  (v_chatgpt_id, 15, 'Criação de Conteúdo', 'Use IA para criar posts e artigos', 'Crie um post para redes sociais com hook, corpo e CTA'),
  (v_chatgpt_id, 16, 'Emails Profissionais', 'Escreva emails eficientes com IA', 'Redija um email de negociação e um de follow-up'),
  (v_chatgpt_id, 17, 'Brainstorming com IA', 'Gere ideias criativas sistematicamente', 'Faça brainstorming de 10 nomes para um produto fictício'),
  (v_chatgpt_id, 18, 'Pesquisa e Aprendizado', 'Use IA como tutor pessoal', 'Peça explicação de um conceito complexo de forma progressiva'),
  (v_chatgpt_id, 19, 'Revisão de Textos', 'Melhore seus textos com feedback de IA', 'Submeta um texto seu e peça revisão detalhada'),
  (v_chatgpt_id, 20, 'Planejamento com IA', 'Crie planos e cronogramas', 'Crie um plano de estudos semanal para aprender algo novo'),
  (v_chatgpt_id, 21, 'Revisão Semana 3', 'Aplique IA em cenários reais', 'Resolva um problema real do seu dia usando as técnicas');

  -- Semana 4: Maestria e Integração
  INSERT INTO trail_phases (ai_tool_id, phase_number, title, description, task_description) VALUES
  (v_chatgpt_id, 22, 'System Prompts', 'Configure comportamentos persistentes', 'Crie um system prompt para um assistente especializado'),
  (v_chatgpt_id, 23, 'Automações com IA', 'Integre IA em workflows', 'Crie um template de prompt reutilizável para uma tarefa recorrente'),
  (v_chatgpt_id, 24, 'IA para Decisões', 'Use IA como consultor para decisões', 'Peça análise de prós e contras para uma decisão importante'),
  (v_chatgpt_id, 25, 'Criatividade Avançada', 'Explore limites criativos da IA', 'Crie uma história colaborativa com a IA'),
  (v_chatgpt_id, 26, 'IA no Trabalho', 'Aplique IA em contexto profissional', 'Automatize uma tarefa repetitiva do seu trabalho'),
  (v_chatgpt_id, 27, 'Ética e Limitações', 'Entenda os limites e uso responsável', 'Identifique um caso onde IA não deve ser usada sozinha'),
  (v_chatgpt_id, 28, 'Projeto Final', 'Demonstre sua maestria em prompts', 'Crie um sistema completo de prompts para resolver um problema real');

  -- 4. Inserir 28 challenge_days
  INSERT INTO challenge_days (challenge_id, day_number, title, description, focus_area, ai_tool_id)
  SELECT 
    v_challenge_id,
    phase_number,
    title,
    description,
    CASE 
      WHEN phase_number <= 7 THEN 'Fundamentos'
      WHEN phase_number <= 14 THEN 'Técnicas Avançadas'
      WHEN phase_number <= 21 THEN 'Aplicações Práticas'
      ELSE 'Maestria'
    END,
    v_chatgpt_id
  FROM trail_phases
  WHERE ai_tool_id = v_chatgpt_id
  ORDER BY phase_number;
  
END $$;
