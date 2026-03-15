/**
 * Template de conteúdo para certificados
 * Contém todos os textos e informações que serão preenchidos dinamicamente
 */

export interface CertificateData {
  // Dados do aluno
  nome: string;
  
  // Dados do curso
  formacao: string;
  nivel: string;
  horas: number;
  descricao?: string;
  
  // Dados de conclusão
  cidade: string;
  data: string;
  
  // Dados adicionais
  contribuicao?: string;
  nomeResponsavel?: string;
}

export const certificateTemplate = {
  title: "Certificado de Conclusão",
  
  conclusionText: (nome: string) => `${nome}`,
  
  courseCompletionText: "Concluiu com sucesso o curso de",
  
  specializationText: (formacao: string) => `Especialização em ${formacao}`,
  
  levelLabel: (nivel: string) => `Nível ${nivel}`,
  
  descriptionText: (formacao: string, horas: number, contribuicao?: string) => 
    `Formação em ${formacao} com carga horária total de ${horas} horas, demonstrando conhecimentos práticos e compreensão dos fundamentos essenciais da ${formacao} aplicados ${contribuicao || ''}`,
  
  locationLabel: "Cidade:",
  
  completionDateLabel: "Data de conclusão:",
  
  instructorLabel: "Nome do responsável/instrutor",
  
  organizationName: "Educly - Educação digital",
  
  // Configurações de renderização
  layout: {
    // Posições no canvas (pixels)
    badge: { x: 1000, y: 50 },
    title: { x: 665, y: 100 },
    studentName: { x: 665, y: 167 },
    conclusionText: { x: 245, y: 220 },
    specializationTitle: { x: 245, y: 263 },
    levelBadge: { x: 138, y: 310 },
    description: { x: 245, y: 399 },
    location: { x: 100, y: 491 },
    date: { x: 782, y: 491 },
    signature: { x: 680, y: 553 },
    instructor: { x: 769, y: 585 },
    organization: { x: 804, y: 601 },
    mascot: { x: 1025, y: 380 },
  },
  
  // Estilos de fonte
  fonts: {
    title: {
      family: 'Arial',
      size: 32,
      weight: 'bold',
      color: '#1e3a5f',
    },
    studentName: {
      family: 'Arial',
      size: 28,
      weight: 'normal',
      color: '#1e3a5f',
    },
    conclusionText: {
      family: 'Arial',
      size: 16,
      weight: 'normal',
      color: '#1e3a5f',
    },
    specializationTitle: {
      family: 'Arial',
      size: 26,
      weight: 'bold',
      color: '#1e3a5f',
    },
    level: {
      family: 'Arial',
      size: 14,
      weight: 'bold',
      color: '#ffffff',
    },
    description: {
      family: 'Arial',
      size: 12,
      weight: 'normal',
      color: '#1e3a5f',
    },
    labels: {
      family: 'Arial',
      size: 11,
      weight: 'normal',
      color: '#1e3a5f',
    },
    signature: {
      family: 'Brush Script MT',
      size: 20,
      weight: 'italic',
      color: '#1e3a5f',
    },
    instructor: {
      family: 'Arial',
      size: 10,
      weight: 'normal',
      color: '#1e3a5f',
    },
  },
  
  // Cores
  colors: {
    primary: '#1e3a5f',
    secondary: '#f59e0b',
    background: '#ffffff',
    levelBadge: '#ff8833',
  },
};
