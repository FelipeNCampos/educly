import { Link } from "react-router-dom";
import { ArrowRight, Check, Shield, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export const CTASection = () => {
  const { t } = useTranslation();
  const benefits = [
    t('landing.cta.benefits.0'),
    t('landing.cta.benefits.1'),
    t('landing.cta.benefits.2'),
    t('landing.cta.benefits.3'),
    t('landing.cta.benefits.4'),
    t('landing.cta.benefits.5')
  ];

  return (
      <section className="py-16 md:py-24 bg-white dark:bg-slate-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-slate-100 dark:bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-100 dark:bg-white/5 rounded-full translate-x-1/2 translate-y-1/2" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Title */}
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-6">
              {t('landing.cta.title')}
            </h2>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 max-w-xl mx-auto text-left">
              {benefits.map(benefit => (
                  <div key={benefit} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                    <span className="text-sm md:text-base">{benefit}</span>
                  </div>
              ))}
            </div>

            {/* CTAs */}
            {/* Se houver botões aqui, adicione também */}

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-6 text-slate-600 dark:text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{t('landing.cta.guarantee')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                <span>{t('landing.cta.installments')}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};