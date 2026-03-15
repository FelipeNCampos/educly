import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Rocket, 
  Brain, 
  MessageSquare, 
  Award,
  ArrowLeft,
  LogOut
} from "lucide-react";

const Upgrade = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Landing page URL
  const landingUrl = "https://educly.lovable.app";

  const features = [
    {
      icon: Brain,
      title: t('upgrade.feature1Title', 'Trilha Personalizada com IA'),
      description: t('upgrade.feature1Desc', 'Plano de estudos 100% adaptado aos seus objetivos'),
    },
    {
      icon: MessageSquare,
      title: t('upgrade.feature2Title', 'Assistentes de IA Ilimitados'),
      description: t('upgrade.feature2Desc', 'Acesso a todos os assistentes especializados'),
    },
    {
      icon: Rocket,
      title: t('upgrade.feature3Title', 'Desafios Práticos'),
      description: t('upgrade.feature3Desc', 'Aprenda fazendo com projetos reais'),
    },
    {
      icon: Award,
      title: t('upgrade.feature4Title', 'Certificados Reconhecidos'),
      description: t('upgrade.feature4Desc', 'Comprove suas habilidades com certificados'),
    },
  ];

  const handleLogout = async () => {
    // Limpar TODOS os tokens de sessão do Supabase
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  };

  const handleUpgrade = () => {
    window.open(landingUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('common.back', 'Voltar')}
        </Button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('upgrade.title', 'Acesso Premium Necessário')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('upgrade.subtitle', 'Desbloqueie todo o potencial da plataforma')}
          </p>
        </div>

        {/* Features */}
        <Card className="p-6 mb-8 bg-card border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {t('upgrade.whatYouGet', 'O que você terá acesso')}
          </h2>
          
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* CTA */}
        <div className="space-y-4">
          <Button 
            onClick={handleUpgrade}
            className="w-full py-6 text-lg gap-2"
            size="lg"
          >
            <CheckCircle2 className="w-5 h-5" />
            {t('upgrade.ctaButton', 'Desbloquear Acesso Premium')}
          </Button>
          
          <p className="text-center text-sm text-muted-foreground">
            {t('upgrade.guarantee', 'Garantia de 7 dias ou seu dinheiro de volta')}
          </p>

          {/* Botão de Logout */}
          <Button 
            variant="outline"
            onClick={handleLogout}
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            {t('common.logout', 'Sair')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
