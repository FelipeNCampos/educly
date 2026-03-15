/**
 * Exemplo de uso da função de geração de certificados
 * 
 * Este arquivo contém exemplos de como usar a função generate-certificate
 * no frontend da aplicação Educly
 */

import React from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Interface de dados do certificado
 */
export interface CertificateData {
  nome: string;
  formacao: string;
  nivel: string;
  horas: number;
  descricao?: string;
  cidade: string;
  data: string;
  contribuicao?: string;
  nomeResponsavel?: string;
}

/**
 * Tipos de resposta da função
 */
interface CertificateResponse {
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}

/**
 * Gera um certificado para o usuário logado
 * 
 * @param data Dados do certificado (nome, formação, etc.)
 * @returns URL do certificado gerado
 */
export async function generateCertificate(
  data: CertificateData
): Promise<string> {
  try {
    const { data: response, error } = await supabase.functions.invoke<CertificateResponse>(
      'generate-certificate',
      {
        body: data
      }
    );

    if (error) {
      throw new Error(error.message || 'Erro ao gerar certificado');
    }

    if (!response?.success || !response.url) {
      throw new Error(response?.error || 'Erro ao gerar certificado');
    }

    return response.url;
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
}

/**
 * Busca todos os certificados do usuário logado
 * Nota: A tabela 'certificates' precisa ser criada primeiro com a migration
 */
export async function getUserCertificates() {
  try {
    // A tabela será criada após executar a migration
    const { data, error } = await supabase
      .from('certificates' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return [];
  }
}

/**
 * Exemplo 1: Gerar certificado de conclusão de curso
 */
export async function exampleGenerateCourseCertificate() {
  const certificateUrl = await generateCertificate({
    nome: 'Matheus Felipe Sousa Santos',
    formacao: 'Inteligência Artificial',
    nivel: 'júnior',
    horas: 40,
    cidade: 'Granada',
    data: new Date().toLocaleDateString('pt-BR'),
    contribuicao: 'Demonstrou excelente desempenho',
    nomeResponsavel: 'Prof. João Silva'
  });

  console.log('Certificado gerado:', certificateUrl);
  return certificateUrl;
}

/**
 * Exemplo 2: Gerar certificado com dados mínimos
 */
export async function exampleGenerateMinimalCertificate() {
  const certificateUrl = await generateCertificate({
    nome: 'Maria Silva',
    formacao: 'ChatGPT Avançado',
    nivel: 'pleno',
    horas: 20,
    cidade: 'São Paulo',
    data: '15/02/2026'
  });

  return certificateUrl;
}

/**
 * Exemplo 3: Hook React para gerar certificado
 */
export function useCertificateGenerator() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = React.useState<string | null>(null);

  const generate = async (data: CertificateData) => {
    setLoading(true);
    setError(null);
    setCertificateUrl(null);

    try {
      const url = await generateCertificate(data);
      setCertificateUrl(url);
      return url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error, certificateUrl };
}

/**
 * Exemplo 4: Componente React para gerar certificado
 */
export function CertificateGenerator({ 
  courseData 
}: { 
  courseData: Omit<CertificateData, 'nome' | 'data'> 
}) {
  const [generating, setGenerating] = React.useState(false);
  const [certificateUrl, setCertificateUrl] = React.useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);

    try {
      // Busca dados do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Busca nome do perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      // Gera o certificado
      const url = await generateCertificate({
        ...courseData,
        nome: profile?.full_name || user.email || 'Aluno',
        data: new Date().toLocaleDateString('pt-BR')
      });

      setCertificateUrl(url);
      
      // Opcional: Fazer download automático
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${courseData.formacao.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.click();

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao gerar certificado. Tente novamente.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="certificate-generator">
      <button 
        onClick={handleGenerate}
        disabled={generating}
        className="btn btn-primary"
      >
        {generating ? 'Gerando...' : 'Gerar Certificado'}
      </button>

      {certificateUrl && (
        <div className="certificate-preview">
          <img src={certificateUrl} alt="Certificado" />
          <a 
            href={certificateUrl} 
            download
            className="btn btn-secondary"
          >
            Download
          </a>
        </div>
      )}
    </div>
  );
}

/**
 * Exemplo 5: Gerar certificado após conclusão de módulo
 * Nota: Esta função é um exemplo e precisa ser adaptada conforme
 * o schema real do banco de dados
 */
export async function generateCertificateOnModuleCompletion(
  userId: string,
  moduleId: string
) {
  try {
    // Busca dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .single();

    // Exemplo simplificado - adapte conforme seu schema
    const certificateUrl = await generateCertificate({
      nome: profile?.full_name || 'Aluno',
      formacao: 'Curso Completo',
      nivel: 'júnior',
      horas: 40,
      cidade: 'Não informado',
      data: new Date().toLocaleDateString('pt-BR'),
      contribuicao: 'Concluído com sucesso'
    });

    return certificateUrl;
  } catch (error) {
    console.error('Erro ao gerar certificado:', error);
    throw error;
  }
}

/**
 * Exemplo 6: Lista de certificados do usuário
 */
export function UserCertificatesList() {
  const [certificates, setCertificates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCertificates();
  }, []);

  const loadCertificates = async () => {
    try {
      const data = await getUserCertificates();
      setCertificates(data);
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando certificados...</div>;
  }

  return (
    <div className="certificates-list">
      <h2>Meus Certificados</h2>
      
      {certificates.length === 0 ? (
        <p>Você ainda não possui certificados.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert: any) => (
            <div key={cert.id} className="certificate-card">
              <img 
                src={cert.file_url} 
                alt={`Certificado - ${cert.course_name}`}
                className="w-full h-auto"
              />
              <div className="certificate-info">
                <h3>{cert.course_name}</h3>
                <p>Concluído em: {cert.completion_date}</p>
                <a 
                  href={cert.file_url} 
                  download
                  className="btn btn-sm btn-primary"
                >
                  Download
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Exporta todas as funções
export default {
  generateCertificate,
  getUserCertificates,
  useCertificateGenerator,
  CertificateGenerator,
  generateCertificateOnModuleCompletion,
  UserCertificatesList
};
