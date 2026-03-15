import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Trophy, RefreshCw } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from "react";

const Certificate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // refreshKey força a regeneração do canvas quando você editar os valores
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch certificate data
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

  // Generate certificate image
  useEffect(() => {
    if (!certificate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1920;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(0.5, '#8b5cf6');
    gradient.addColorStop(1, '#ec4899');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Inner white card
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(40, 40, width - 80, height - 80, 20);
    ctx.fill();

    // Trophy icon circle
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(width / 2, 140, 50, 0, Math.PI * 2);
    ctx.fill();

    // Trophy emoji
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏆', width / 2, 155);

    // Certificate title
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 42px Georgia, serif';
    ctx.fillText("teste", width / 2, 550);

    // Decorative line
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 150, 280);
    ctx.lineTo(width / 2 + 150, 280);
    ctx.stroke();

    // "This certifies that"
    ctx.fillStyle = '#6b7280';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(t('certificate.certifies'), width / 2, 340);

    // User name
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 48px Georgia, serif';
    ctx.fillText(certificate.user_full_name || t('dashboard.student'), width / 2, 210);

    // Decorative line under name
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2 - 200, 440);
    ctx.lineTo(width / 2 + 200, 440);
    ctx.stroke();

    // "Successfully completed"
    ctx.fillStyle = '#6b7280';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText(t('certificate.completed'), width / 2, 500);

    // Challenge name
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 32px Georgia, serif';
    const challengeName = certificate.challenges?.name || certificate.tool_slug;
    ctx.fillText(challengeName, width / 2, 555);

    // "28 days of learning"
    ctx.fillStyle = '#10b981';
    ctx.font = '22px Arial, sans-serif';
    ctx.fillText(t('certificate.daysLearning', { days: 28 }), width / 2, 600);

    // Date
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px Arial, sans-serif';
    const date = new Date(certificate.earned_at).toLocaleDateString();
    ctx.fillText(`${t('certificate.earnedOn')} ${date}`, width / 2, 680);

    // Educy signature
    ctx.fillStyle = '#111827';
    ctx.font = 'italic bold 28px Georgia, serif';
    ctx.fillText('Educy', width / 2, 750);

    // Certificate ID
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Arial, sans-serif';
    ctx.fillText(`ID: ${certificate.id}`, width / 2, 790);

    // Convert to image URL
    setImageUrl(canvas.toDataURL('image/png'));
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
        {/* Header */}
        <header className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
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

        {/* Certificate Display */}
        <div className="bg-card rounded-2xl shadow-lg overflow-hidden mb-6">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt={t('certificate.title')}
              className="w-full h-auto"
            />
          ) : (
            <div className="aspect-[1200/850] flex items-center justify-center">
              <div className="animate-pulse text-muted-foreground">{t('certificate.generating')}</div>
            </div>
          )}
        </div>

        {/* Hidden canvas for generation */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={handleDownload}
            className="flex-1 h-14 text-lg font-semibold"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            {t('certificate.download')}
          </Button>
          {navigator.share && (
            <Button 
              onClick={handleShare}
              variant="outline"
              className="h-14 px-6"
              size="lg"
            >
              <Share2 className="w-5 h-5" />
            </Button>
          )}
        </div>

        {/* Celebration message */}
        <div className="mt-8 text-center">
          <p className="text-2xl mb-2">🎉</p>
          <p className="text-muted-foreground">
            {t('certificate.congratsMessage')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
