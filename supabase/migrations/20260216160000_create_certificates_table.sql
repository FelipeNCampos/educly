    -- Migration: Criação de tabela e bucket para certificados
    -- Data: 2026-02-16
    -- Descrição: Adiciona suporte para geração e armazenamento de certificados

    -- Criar bucket público para certificados
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('certificates', 'certificates', true)
    ON CONFLICT (id) DO NOTHING;

    -- Políticas de storage para certificados
    -- Permitir upload apenas para usuários autenticados
    DO $$
    BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Usuários autenticados podem fazer upload de certificados'
    ) THEN
        CREATE POLICY "Usuários autenticados podem fazer upload de certificados"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'certificates');
    END IF;
    END $$;

    -- Permitir leitura pública dos certificados
    DO $$
    BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Certificados são públicos para leitura'
    ) THEN
        CREATE POLICY "Certificados são públicos para leitura"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'certificates');
    END IF;
    END $$;

    -- Permitir que usuários deletem seus próprios certificados
    DO $$
    BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Usuários podem deletar seus próprios certificados'
    ) THEN
        CREATE POLICY "Usuários podem deletar seus próprios certificados"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (
        bucket_id = 'certificates' AND
        (storage.foldername(name))[1] = auth.uid()::text
        );
    END IF;
    END $$;

    -- Criar tabela de certificados
    CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    course_name TEXT NOT NULL,
    completion_date TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Criar índices para otimizar consultas
    CREATE INDEX IF NOT EXISTS idx_certificates_user_id 
    ON public.certificates(user_id);

    CREATE INDEX IF NOT EXISTS idx_certificates_created_at 
    ON public.certificates(created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_certificates_course_name 
    ON public.certificates(course_name);

    -- Adicionar comentários
    COMMENT ON TABLE public.certificates IS 'Armazena informações sobre certificados gerados para os usuários';
    COMMENT ON COLUMN public.certificates.user_id IS 'ID do usuário que recebeu o certificado';
    COMMENT ON COLUMN public.certificates.file_path IS 'Caminho do arquivo no storage';
    COMMENT ON COLUMN public.certificates.file_url IS 'URL pública do certificado';
    COMMENT ON COLUMN public.certificates.course_name IS 'Nome do curso/formação';
    COMMENT ON COLUMN public.certificates.completion_date IS 'Data de conclusão do curso';
    COMMENT ON COLUMN public.certificates.metadata IS 'Dados adicionais do certificado (JSON)';

    -- Habilitar Row Level Security (RLS)
    ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

    -- Política: Usuários podem ver seus próprios certificados
    CREATE POLICY "Usuários podem ver seus próprios certificados"
    ON public.certificates FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

    -- Política: Usuários podem inserir certificados (via edge function)
    CREATE POLICY "Sistema pode inserir certificados"
    ON public.certificates FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

    -- Política: Usuários podem atualizar seus próprios certificados
    CREATE POLICY "Usuários podem atualizar seus próprios certificados"
    ON public.certificates FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

    -- Política: Usuários podem deletar seus próprios certificados
    CREATE POLICY "Usuários podem deletar seus próprios certificados"
    ON public.certificates FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

    -- Função para atualizar updated_at automaticamente
    CREATE OR REPLACE FUNCTION public.handle_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Trigger para atualizar updated_at
    DROP TRIGGER IF EXISTS set_updated_at ON public.certificates;
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

    -- Criar view para estatísticas de certificados
    CREATE OR REPLACE VIEW public.certificate_stats AS
    SELECT 
    user_id,
    COUNT(*) as total_certificates,
    COUNT(DISTINCT course_name) as unique_courses,
    MIN(created_at) as first_certificate,
    MAX(created_at) as latest_certificate
    FROM public.certificates
    GROUP BY user_id;

    COMMENT ON VIEW public.certificate_stats IS 'Estatísticas de certificados por usuário';

    -- Conceder permissões
    GRANT SELECT ON public.certificate_stats TO authenticated;
    GRANT ALL ON public.certificates TO authenticated;

    -- Criar função helper para buscar certificados de um usuário
    CREATE OR REPLACE FUNCTION public.get_user_certificates(p_user_id UUID DEFAULT auth.uid())
    RETURNS TABLE (
    id UUID,
    file_url TEXT,
    course_name TEXT,
    completion_date TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE
    ) 
    SECURITY DEFINER
    SET search_path = public
    LANGUAGE plpgsql
    AS $$
    BEGIN
    -- Verifica se o usuário está autenticado
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Não autenticado';
    END IF;

    -- Verifica se o usuário está tentando acessar seus próprios certificados
    IF p_user_id != auth.uid() THEN
        RAISE EXCEPTION 'Acesso negado';
    END IF;

    RETURN QUERY
    SELECT 
        c.id,
        c.file_url,
        c.course_name,
        c.completion_date,
        c.metadata,
        c.created_at
    FROM public.certificates c
    WHERE c.user_id = p_user_id
    ORDER BY c.created_at DESC;
    END;
    $$;

    COMMENT ON FUNCTION public.get_user_certificates IS 'Retorna todos os certificados de um usuário específico';

    -- Conceder permissão para executar a função
    GRANT EXECUTE ON FUNCTION public.get_user_certificates TO authenticated;
