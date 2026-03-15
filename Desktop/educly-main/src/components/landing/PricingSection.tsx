import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const PricingSection = () => {
  const { t } = useTranslation();

  // Redirecionamentos
  const handleGetQuizByLocale = () => window.open(t("landing.quiz.url"), "_blank");

  // Link fixo do Stripe conforme solicitado
  const handleCheckout = () => {
    window.open("https://pay.hotmart.com/Y103941140D?off=mdspiens&checkoutMode=10", "_blank");
  };

  // Movido para dentro do componente para reagir à mudança de idioma (t)
  const plans = [
    {
      name: t("landing.pricing.productName"),
      price: "29,90", // Valor final
      daily: "0,90",
      popular: true,
    },
  ];

  return (
    <section id="plano" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto space-y-10">
          {/* Cabeçalho */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              {t("landing.pricing.title")}
            </h2>
            <p className="text-slate-500 text-lg">{t("landing.pricing.subtitle")}</p>
          </div>

          {/* Card de Valor Único */}
          <div className="grid gap-4">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative flex flex-col md:flex-row items-center justify-between p-8 rounded-[32px] border-2 transition-all duration-300",
                  plan.popular ? "border-orange-500 bg-white shadow-xl scale-[1.02] z-10" : "border-slate-100 bg-white",
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full flex items-center gap-1 shadow-md uppercase tracking-wider">
                    <Zap size={10} fill="currentColor" /> {t("landing.pricing.offerBadge")}
                  </div>
                )}

                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="font-black text-slate-800 text-xl tracking-tight">{plan.name}</h4>
                    <p className="text-base">
                      {/* Removido o valor original riscado aqui */}
                      <span className="font-bold text-orange-600 uppercase">
                        {t("landing.pricing.pricePrefix")} USD {plan.price}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 md:mt-0 bg-orange-50 px-8 py-4 rounded-2xl border border-orange-100 text-center min-w-[140px]">
                  <p className="text-2xl font-black text-orange-700 leading-none">USD {plan.daily}</p>
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">
                    {t("landing.pricing.perDay")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Checkout */}
          <div className="space-y-4">
            <Button
              onClick={handleCheckout}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-9 rounded-[24px] text-2xl shadow-2xl shadow-orange-200 transition-all active:scale-[0.98] uppercase tracking-wider"
            >
              {t("landing.pricing.ctaButton")}
            </Button>
            <div className="flex flex-col items-center gap-2">
              <p className="text-slate-500 text-sm font-bold flex items-center gap-2">
                <Check size={18} className="text-green-500" />
                {t("landing.pricing.securePayment")}
              </p>
            </div>
          </div>

          {/* Divisor de Oferta Especial */}
          <div className="relative py-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t-2 border-dashed border-orange-200" />
            </div>
            <div className="relative flex justify-center">
              <div className="bg-orange-50 border-2 border-orange-400 px-8 py-3 rounded-full flex items-center gap-3 animate-bounce shadow-lg">
                <Sparkles size={20} className="text-orange-500 animate-pulse" />
                <span className="text-orange-800 font-black text-sm md:text-base uppercase tracking-tight">
                  {t("landing.pricing.quizDiscountNotice")}
                </span>
              </div>
            </div>
          </div>

          {/* Card do Quiz */}
          <div className="relative bg-slate-900 rounded-[40px] border border-slate-800 shadow-2xl overflow-hidden p-8 md:p-14 text-white">
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-500/30">
                  <Sparkles size={12} fill="currentColor" /> {t("landing.pricing.quizBadge")}
                </div>

                <h2 className="text-3xl md:text-4xl font-black leading-tight">{t("landing.pricing.quizTitle")}</h2>

                <p className="text-slate-400 text-lg leading-relaxed">{t("landing.pricing.quizSubtitle")}</p>

                <Button
                  onClick={handleGetQuizByLocale}
                  size="lg"
                  className="w-full md:w-auto bg-white text-slate-900 hover:bg-orange-50 font-black py-8 px-12 rounded-2xl shadow-xl transition-all hover:scale-[1.03] uppercase tracking-wide"
                >
                  <Zap className="mr-2 h-6 w-6 text-orange-500" />
                  {t("landing.pricing.quizButton")}
                </Button>
              </div>

              <div className="hidden md:flex w-56 h-56 items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-[48px] rotate-6 shadow-2xl shadow-orange-500/40 relative overflow-hidden">
                <Zap size={100} fill="white" className="text-white -rotate-6" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
