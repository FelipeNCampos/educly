import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreditCardLogos } from "@/components/landing/CreditCardLogos";
import { RecurringBillingDisclosure } from "@/components/checkout/RecurringBillingDisclosure";

export const PricingSection = () => {
  const { t } = useTranslation();
  const [termsAccepted, setTermsAccepted] = useState(false);

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

          {/* Checkbox de Aceite + Botão de Checkout */}
          <div className="space-y-4">
            <div className="flex items-start gap-3 px-2">
              <Checkbox
                id="terms-accept"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked === true)}
                className="mt-0.5"
              />
              <label htmlFor="terms-accept" className="text-sm text-slate-600 leading-relaxed cursor-pointer">
                {t("checkout.termsCheckbox")}{" "}
                <Link to="/termos" className="text-orange-600 underline hover:text-orange-700 font-semibold" target="_blank">
                  {t("checkout.termsCheckboxTerms")}
                </Link>{" "}
                {t("checkout.termsCheckboxAnd")}{" "}
                <Link to="/cancelamento" className="text-orange-600 underline hover:text-orange-700 font-semibold" target="_blank">
                  {t("checkout.termsCheckboxRefund")}
                </Link>
              </label>
            </div>

            <Button
              onClick={handleCheckout}
              disabled={!termsAccepted}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-9 rounded-[24px] text-sm sm:text-lg md:text-2xl shadow-2xl shadow-orange-200 transition-all active:scale-[0.98] uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("landing.pricing.ctaButton")}
            </Button>

            {/* Credit Card Logos + Security Badges */}
            <CreditCardLogos size="md" className="py-2" />

            {/* Recurring Billing Disclosure - Nuvei/Visa/MC Compliance */}
            <RecurringBillingDisclosure price="29.90" frequency="monthly" />
          </div>

          {/* Divisor de Oferta Especial - Linha removida aqui */}
          <div className="relative py-6">
            <div className="relative flex justify-center">
              <button
                onClick={() => window.open("https://start.educly.app/quiz-esp-hot01", "_blank")}
                className="bg-orange-50 border-2 border-orange-400 px-8 py-3 rounded-full flex items-center gap-3 animate-bounce shadow-lg"
              >
                <Sparkles size={20} className="text-orange-500 animate-pulse" />
                <span className="text-orange-800 font-black text-sm md:text-base uppercase tracking-tight">
                  {t("landing.pricing.quizDiscountNotice")}
                </span>
              </button>
            </div>
          </div>
          {/* Card do Quiz */}
        </div>
      </div>
    </section>
  );
};
