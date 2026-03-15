import { Lock, Sparkles, MessageSquare, Zap, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface ChatPremiumGateProps {
  checkoutUrl?: string;
}

export const ChatPremiumGate = ({ checkoutUrl }: ChatPremiumGateProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const features = [
    {
      icon: MessageSquare,
      title: t('chat.premium.features.unlimitedChat.title'),
      description: t('chat.premium.features.unlimitedChat.description')
    },
    {
      icon: Brain,
      title: t('chat.premium.features.guidedPractice.title'),
      description: t('chat.premium.features.guidedPractice.description')
    },
    {
      icon: Zap,
      title: t('chat.premium.features.instantResponses.title'),
      description: t('chat.premium.features.instantResponses.description')
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      {/* Lock Icon */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Lock className="w-7 h-7 text-white" />
          </div>
        </div>
        <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-amber-400 animate-pulse" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-foreground mb-2">
        {t('chat.premium.title')}
      </h2>
      <p className="text-muted-foreground mb-8 max-w-sm">
        {t('chat.premium.description')}
      </p>

      {/* Features */}
      <div className="grid gap-4 mb-8 w-full max-w-sm">
        {features.map((feature, i) => (
          <div 
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center">
              <feature.icon className="w-5 h-5 text-violet-500" />
            </div>
            <div className="text-left">
              <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3 w-full max-w-sm">
        <Button
          onClick={() => checkoutUrl && window.open(checkoutUrl, '_blank')}
          className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          {t('chat.premium.unlock')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="w-full text-muted-foreground"
        >
          {t('chat.premium.backToDashboard')}
        </Button>
      </div>
    </div>
  );
};
