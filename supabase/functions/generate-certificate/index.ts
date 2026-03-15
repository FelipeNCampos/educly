import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  createCanvas, 
  loadImage, 
  CanvasRenderingContext2D 
} from "https://deno.land/x/canvas@v1.4.1/mod.ts";
import { certificateTemplate, CertificateData } from "./certificate-template.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Função para quebrar texto em múltiplas linhas baseado em largura máxima
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Desenha texto com quebra de linha automática
 */
function drawMultilineText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): void {
  const lines = wrapText(ctx, text, maxWidth);
  
  lines.forEach((line, index) => {
    ctx.fillText(line, x, y + (index * lineHeight));
  });
}

/**
 * Gera o certificado em formato PNG
 */
async function generateCertificate(data: CertificateData): Promise<Uint8Array> {
  // Carrega a imagem de fundo
  const backgroundImage = await loadImage(
    new URL('./certificado-template.png', import.meta.url).toString()
  );
  
  // Cria canvas com as dimensões da imagem de fundo
  const canvas = createCanvas(backgroundImage.width(), backgroundImage.height());
  const ctx = canvas.getContext('2d');
  
  // Desenha o fundo
  ctx.drawImage(backgroundImage, 0, 0);
  
  const tpl = certificateTemplate;
  
  // Configuração de fonte padrão
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  // Título: "Certificado de Conclusão"
  ctx.font = `${tpl.fonts.title.weight} ${tpl.fonts.title.size}px ${tpl.fonts.title.family}`;
  ctx.fillStyle = tpl.fonts.title.color;
  ctx.fillText(tpl.title, tpl.layout.title.x, tpl.layout.title.y);
  
  // Nome do aluno
  ctx.font = `${tpl.fonts.studentName.weight} ${tpl.fonts.studentName.size}px ${tpl.fonts.studentName.family}`;
  ctx.fillStyle = tpl.fonts.studentName.color;
  ctx.fillText(data.nome, tpl.layout.studentName.x, tpl.layout.studentName.y);
  
  // Texto "Concluiu com sucesso o curso de"
  ctx.textAlign = 'left';
  ctx.font = `${tpl.fonts.conclusionText.weight} ${tpl.fonts.conclusionText.size}px ${tpl.fonts.conclusionText.family}`;
  ctx.fillStyle = tpl.fonts.conclusionText.color;
  ctx.fillText(tpl.courseCompletionText, tpl.layout.conclusionText.x, tpl.layout.conclusionText.y);
  
  // Especialização
  ctx.font = `${tpl.fonts.specializationTitle.weight} ${tpl.fonts.specializationTitle.size}px ${tpl.fonts.specializationTitle.family}`;
  ctx.fillStyle = tpl.fonts.specializationTitle.color;
  ctx.fillText(tpl.specializationText(data.formacao), tpl.layout.specializationTitle.x, tpl.layout.specializationTitle.y);
  
  // Badge de nível (fundo laranja + texto)
  ctx.fillStyle = tpl.colors.levelBadge;
  ctx.fillRect(tpl.layout.levelBadge.x, tpl.layout.levelBadge.y, 150, 40);
  ctx.font = `${tpl.fonts.level.weight} ${tpl.fonts.level.size}px ${tpl.fonts.level.family}`;
  ctx.fillStyle = tpl.fonts.level.color;
  ctx.textAlign = 'center';
  ctx.fillText(tpl.levelLabel(data.nivel), tpl.layout.levelBadge.x + 75, tpl.layout.levelBadge.y + 13);
  
  // Descrição (texto longo com quebra de linha)
  ctx.textAlign = 'left';
  ctx.font = `${tpl.fonts.description.weight} ${tpl.fonts.description.size}px ${tpl.fonts.description.family}`;
  ctx.fillStyle = tpl.fonts.description.color;
  const descriptionText = tpl.descriptionText(
    data.formacao, 
    data.horas, 
    data.contribuicao
  );
  drawMultilineText(ctx, descriptionText, tpl.layout.description.x, tpl.layout.description.y, 700, 20);
  
  // Cidade
  ctx.font = `${tpl.fonts.labels.weight} ${tpl.fonts.labels.size}px ${tpl.fonts.labels.family}`;
  ctx.fillStyle = tpl.fonts.labels.color;
  ctx.fillText(`${tpl.locationLabel} ${data.cidade}`, tpl.layout.location.x, tpl.layout.location.y);
  
  // Data de conclusão
  ctx.fillText(`${tpl.completionDateLabel} ${data.data}`, tpl.layout.date.x, tpl.layout.date.y);
  
  // Assinatura (estilo manuscrito)
  if (data.contribuicao) {
    ctx.font = `${tpl.fonts.signature.weight} ${tpl.fonts.signature.size}px ${tpl.fonts.signature.family}`;
    ctx.fillStyle = tpl.fonts.signature.color;
    ctx.fillText(data.contribuicao, tpl.layout.signature.x, tpl.layout.signature.y);
  }
  
  // Nome do responsável
  ctx.font = `${tpl.fonts.instructor.weight} ${tpl.fonts.instructor.size}px ${tpl.fonts.instructor.family}`;
  ctx.fillStyle = tpl.fonts.instructor.color;
  ctx.textAlign = 'center';
  if (data.nomeResponsavel) {
    ctx.fillText(data.nomeResponsavel, tpl.layout.instructor.x, tpl.layout.instructor.y);
  }
  ctx.fillText(tpl.instructorLabel, tpl.layout.instructor.x, tpl.layout.instructor.y + 12);
  
  // Organização
  ctx.fillText(tpl.organizationName, tpl.layout.organization.x, tpl.layout.organization.y);
  
  // Converte canvas para PNG
  return canvas.toBuffer();
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verifica autenticação
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Não autenticado');
    }

    // Recebe os dados do certificado
    const certificateData: CertificateData = await req.json();

    // Valida dados obrigatórios
    if (!certificateData.nome || !certificateData.formacao || !certificateData.nivel) {
      throw new Error('Dados obrigatórios faltando: nome, formacao e nivel são necessários');
    }

    // Gera o certificado
    const certificateBuffer = await generateCertificate(certificateData);

    // Salva no Supabase Storage
    const fileName = `certificate_${user.id}_${Date.now()}.png`;
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from('certificates')
      .upload(fileName, certificateBuffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtém URL pública
    const { data: urlData } = supabaseClient
      .storage
      .from('certificates')
      .getPublicUrl(fileName);

    // Registra no banco de dados
    const { error: dbError } = await supabaseClient
      .from('certificates')
      .insert({
        user_id: user.id,
        file_path: fileName,
        file_url: urlData.publicUrl,
        course_name: certificateData.formacao,
        completion_date: certificateData.data,
        metadata: certificateData,
      });

    if (dbError) {
      console.error('Erro ao salvar no banco:', dbError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        fileName: fileName,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erro:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
