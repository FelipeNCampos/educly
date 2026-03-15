import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Trophy, RefreshCw } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from "react";

const CANVAS_W = 1456;
const CANVAS_H = 816;

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      line = word + ' ';
      currentY += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
}

function drawRoundedPill(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  const r = h / 2;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// Mapeamento de conteúdo e carga horária por ferramenta
const toolCertificateData: Record<string, { specialization: string; hours: number; description: string }> = {
  chatgpt: {
    specialization: 'ChatGPT',
    hours: 32,
    description: 'demonstrando domínio em criação de prompts avançados, automação de tarefas e aplicação prática de inteligência artificial conversacional em projetos reais.',
  },
  claude: {
    specialization: 'Claude',
    hours: 24,
    description: 'demonstrando domínio em análise de documentos, raciocínio lógico avançado e aplicação prática de IA para produtividade e pesquisa.',
  },
  gemini: {
    specialization: 'Gemini',
    hours: 24,
    description: 'demonstrando domínio em integração multimodal, análise de dados e aplicação prática da IA do Google em fluxos de trabalho.',
  },
  deepseek: {
    specialization: 'DeepSeek',
    hours: 24,
    description: 'demonstrando domínio em raciocínio técnico, programação assistida por IA e resolução de problemas complexos.',
  },
  elevenlabs: {
    specialization: 'ElevenLabs',
    hours: 32,
    description: 'demonstrando domínio em síntese de voz, clonagem vocal e produção de áudio profissional com inteligência artificial.',
  },
  lovable: {
    specialization: 'Lovable',
    hours: 32,
    description: 'demonstrando domínio em desenvolvimento de aplicações web com IA, prototipagem rápida e criação de produtos digitais.',
  },
  captions: {
    specialization: 'Captions AI',
    hours: 24,
    description: 'demonstrando domínio em edição de vídeo com IA, legendagem automática e produção de conteúdo audiovisual.',
  },
  nanobanana: {
    specialization: 'NanoBanana',
    hours: 32,
    description: 'demonstrando domínio em geração de imagens com IA, design criativo e produção visual para projetos digitais.',
  },
};

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // refreshKey força a regeneração do canvas quando você editar os valores
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: certificate, isLoading } = useQuery({
    queryKey: ['certificate', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_certificates')
        .select('*, challenges(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (!certificate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bg = new Image();
    bg.crossOrigin = "anonymous";
    bg.src = "/images/certificado-template.png";

    bg.onload = () => {
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);

      const navy = '#1e3a5f';
      const lineColor = '#c8ced5';
      const challengeName = certificate.challenges?.name || certificate.tool_slug;
      const studentName = certificate.user_full_name || 'Aluno';
      const earnedDate = new Date(certificate.earned_at).toLocaleDateString('pt-BR');

      // Content area boundaries (avoiding logo ~0-320px left, badge ~1050+ right, mascot ~1100+ right bottom)
      const contentLeft = 100;
      const contentRight = 1080;
      const contentCenter = (contentLeft + contentRight) / 2; // ~590

      // ─── "Certificado de Conclusão" ───
      // In the model it's centered in the upper area, to the right of the logo
      ctx.fillStyle = navy;
      ctx.font = 'Bold 60px Sequel Sans, serif';
      ctx.textAlign = 'center';
      ctx.fillText('Certificado de Conclusão', 756, 127);

      // ─── Student Name (centered, under title) ───
      ctx.font = '40px Sequel Sans, serif';
      ctx.fillStyle = navy;
      ctx.textAlign = 'center';
      ctx.fillText(studentName, 749, 210);

      // ─── "Concluiu com sucesso o curso de" ───
      // Left-aligned, below the logo area (~y=230)
      ctx.textAlign = 'left';
      ctx.font = '16px Sequel Sans, sans-serif';
      ctx.fillStyle = navy;
      ctx.fillText('Concluiu com sucesso o curso de', contentLeft, 280);

      // ─── "Especialização em ..." ───
      const toolInfo = toolCertificateData[certificate.tool_slug];
      const specName = toolInfo?.specialization || challengeName;
      ctx.font = 'bold 28px Sequel Sans, serif';
      ctx.fillStyle = navy;
      ctx.fillText(`Especialização em ${specName}`, contentLeft, 320);

      // ─── Level badge ───
      const badgeText = 'Nível júnior';
      ctx.font = 'bold 30px Sequel Sans, sans-serif';
      const badgeTW = ctx.measureText(badgeText).width;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, 420 / 2, 370  );

      // ─── Description paragraph ───
      const toolData = toolCertificateData[certificate.tool_slug] || {
        specialization: challengeName,
        hours: 28,
        description: `demonstrando conhecimentos práticos e compreensão dos fundamentos essenciais aplicados em projetos reais.`,
      };

      ctx.textAlign = 'left';
      ctx.font = '20px Sequel Sans, sans-serif';
      ctx.fillStyle = navy;
      const desc = `Formação em ${toolData.specialization} com carga horária total de ${toolData.hours} horas, ${toolData.description}`;
      wrapText(ctx, desc, contentLeft, 440, 890, 30);

      // ─── City & Date ───
      ctx.font = '16px Sequel Sans, sans-serif';
      ctx.fillStyle = navy;
      ctx.textAlign = 'left';
      ctx.fillText('Cidade: Goiânia', contentLeft + 5, 575);
      ctx.textAlign = 'right';
      ctx.fillText(`Data de conclusão: ${earnedDate}`, contentRight, 580);

      // ─── Signature area (right-aligned) ───
      // Signature name (cursive)
      ctx.font = 'italic 34px Yustine Signature, serif';
      ctx.fillStyle = navy;
      ctx.textAlign = 'center';
      const sigCenter = (750 + contentRight) / 2; // ~915
      ctx.fillText("Sidney Júnior", 1010, 645);

      // Instructor label
      ctx.font = '16px Sequel Sans, sans-serif';
      ctx.fillStyle = navy;
      ctx.textAlign = 'center';
      ctx.fillText('Nome do responsável/instrutor', 1000, 690);
      ctx.fillText('Educly - Educação digital', 1020, 710);

      setImageUrl(canvas.toDataURL('image/png'));
    };
  }, [certificate, t, refreshKey]); // refreshKey força re-render ao clicar em RefreshCw

  const handleDownload = () => {
    if (!imageUrl || !certificate) return;
    const link = document.createElement('a');
    link.download = `certificado-${certificate.tool_slug}-${certificate.id}.png`;
    link.href = imageUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl || !certificate) return;
    if (navigator.share) {
      try {
        const blob = await (await fetch(imageUrl)).blob();
        const file = new File([blob], `certificado-${certificate.tool_slug}.png`, { type: 'image/png' });
        await navigator.share({
          title: t('certificate.shareTitle'),
          text: t('certificate.shareText', { challenge: certificate.challenges?.name }),
          files: [file]
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t('common.loading')}</div>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{t('certificate.notFound')}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-success/10 safe-area-inset">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground flex-1">{t('certificate.myCertificate')}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRefreshKey(k => k + 1)}
            title="Regenerar certificado"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </header>

        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-6">
          {imageUrl ? (
            <img src={imageUrl} alt={t('certificate.title')} className="w-full h-auto" />
          ) : (
            <div className="aspect-[1456/816] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">{t('certificate.generating')}</div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="flex gap-3">
          <Button onClick={handleDownload} className="flex-1 h-14 text-lg font-semibold" size="lg">
            <Download className="w-5 h-5 mr-2" />
            {t('certificate.download')}
          </Button>
          {navigator.share && (
            <Button onClick={handleShare} variant="outline" className="h-14 px-6" size="lg">
              <Share2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-muted-foreground">{t('certificate.congratsMessage')}</p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
