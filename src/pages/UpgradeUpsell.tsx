import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Briefcase, Bot, Sparkles, Lock, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProductType } from "@/hooks/useProductAccess";

interface UpgradeUpsellProps {
  productType: ProductType;
}

const productConfig = {
  freelancer: {
    icon: Briefcase,
    gradient: "from-emerald-500 to-teal-600",
    checkoutUrl: "https://pay.hotmart.com/F103975080O?off=dcrrw2vo",
    features: [
      "freelancer.feature1",
      "freelancer.feature2",
      "freelancer.feature3",
      "freelancer.feature4",
    ],
  },
  ai_hub: {
    icon: Bot,
    gradient: "from-violet-500 to-purple-600",
    checkoutUrl: "https://pay.hotmart.com/P104360708Q?off=nnp1mth1",
    features: [
      "ai_hub.feature1",
      "ai_hub.feature2",
      "ai_hub.feature3",
      "ai_hub.feature4",
    ],
  },
  base: {
    icon: Sparkles,
    gradient: "from-primary to-primary/80",
    checkoutUrl: "https://hotmart.com/checkout/placeholder",
    features: [],
  },
};

export const UpgradeUpsell = ({ productType }: UpgradeUpsellProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  const config = productConfig[productType];
  const Icon = config.icon;

  const handleCheckout = () => {
    window.open(config.checkoutUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">
            {t(`upsell.${productType}.title`, productType === 'freelancer' ? 'Área Freelancer' : 'Hub de IA')}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-2xl mx-auto px-4 py-8">
        <Card className="overflow-hidden border-0 shadow-2xl">
          {/* Hero Section */}
          <div className={`bg-gradient-to-br ${config.gradient} p-8 text-white text-center`}>
            <div className="w-20 h-20 mx-auto bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
              <Lock className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              {t(`upsell.${productType}.headline`, 'Conteúdo Exclusivo')}
            </h2>
            <p className="text-white/90 text-lg">
              {t(`upsell.${productType}.subtitle`, 'Desbloqueie recursos avançados')}
            </p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Description */}
            <div className="text-center">
              <p className="text-muted-foreground">
                {productType === 'freelancer' 
                  ? t('upsell.freelancer.description', 'Acesse vagas exclusivas de trabalho em IA e aplique o que você aprendeu nas trilhas.')
                  : t('upsell.ai_hub.description', 'Desbloqueie o Hub de IA com assistentes especializados para criar imagens, prompts e tirar dúvidas.')
                }
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">
                {t('upsell.features', 'O que você terá acesso:')}
              </h3>
              <ul className="space-y-2">
                {productType === 'freelancer' ? (
                  <>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.freelancer.feature1', 'Vagas de trabalho remoto em IA')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.freelancer.feature2', 'Filtro por categoria e experiência')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.freelancer.feature3', 'Novas vagas adicionadas semanalmente')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.freelancer.feature4', 'Link direto para candidatura')}</span>
                    </li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.ai_hub.feature1', 'IA para criar imagens profissionais')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.ai_hub.feature2', 'Assistente de criação de prompts')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.ai_hub.feature3', 'Tire dúvidas com IA especializada')}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                      <span>{t('upsell.ai_hub.feature4', 'Acesso ilimitado aos assistentes')}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="upsell-terms-accept"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="upsell-terms-accept" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                {t("checkout.termsCheckbox")}{" "}
                <Link to="/termos" className="text-primary underline hover:opacity-80 font-semibold" target="_blank">
                  {t("checkout.termsCheckboxTerms")}
                </Link>{" "}
                {t("checkout.termsCheckboxAnd")}{" "}
                <Link to="/cancelamento" className="text-primary underline hover:opacity-80 font-semibold" target="_blank">
                  {t("checkout.termsCheckboxRefund")}
                </Link>
              </label>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleCheckout}
              disabled={!termsAccepted}
              className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${config.gradient} hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{t('upsell.cta', 'Desbloquear Agora')}</span>
              <ExternalLink className="w-5 h-5 ml-2" />
            </Button>

            {/* Back to Dashboard */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate("/dashboard")}
            >
              {t('upsell.back', 'Voltar para o Dashboard')}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};
