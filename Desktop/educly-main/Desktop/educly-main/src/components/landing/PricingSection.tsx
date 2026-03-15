import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    weeks: 4,
    originalPrice: 59.9,
    price: 29.9,
    perDay: 1.07,
    checkoutUrl: "https://pay.hotmart.com/Y103941140D?off=mdspiens&checkoutMode=10",
    popular: true,
  },
];

export const PricingSection = () => {
  // Add id="plano" to the section element below
  const { t, i18n } = useTranslation();
  const [selectedPlan, setSelectedPlan] = useState(1); // Default to 4 weeks (index 1)

  // Check which translation structure to use based on language
  const getPricingKey = (key: string) => {
    // Try landing.pricing first (for pt, fr, es), then landing.programs.pricing (for others)
    const landingPricingKey = `landing.pricing.${key}`;
    const translated = t(landingPricingKey);
    if (translated !== landingPricingKey) return translated;
    return t(key);
  };

  const handleGetPlan = () => {
    const plan = plans[selectedPlan];
    if (plan.checkoutUrl) {
      window.open(plan.checkoutUrl, "_blank");
    } else {
      console.log("Checkout URL not configured yet for plan:", plan.weeks);
    }
  };

  const getWeekLabel = (weeks: number) => {
    const key = `week${weeks}`;
    return getPricingKey(key);
  };

  return (
    <section id="plano" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">{getPricingKey("badge")}</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">{getPricingKey("title")}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{getPricingKey("subtitle")}</p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-lg mx-auto space-y-4">
          {plans.map((plan, index) => (
            <div
              key={plan.weeks}
              onClick={() => setSelectedPlan(index)}
              className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                selectedPlan === index
                  ? "border-primary bg-primary/5 shadow-lg"
                  : "border-border bg-card hover:border-primary/50"
              } ${plan.popular ? "ring-2 ring-primary/20" : ""}`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {getPricingKey("mostPopular")}
                </div>
              )}

              <div className="flex items-center justify-between">
                {/* Radio + Plan Name */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === index ? "border-primary bg-primary" : "border-muted-foreground"
                    }`}
                  >
                    {selectedPlan === index && <Check className="w-3 h-3 text-primary-foreground" />}
                  </div>
                  <div>
                    <p className="font-bold text-foreground">{getWeekLabel(plan.weeks)}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="line-through">USD {plan.originalPrice.toFixed(2)}</span>
                      <span className="ml-2 font-semibold text-foreground">
                        {getPricingKey("for")} USD {plan.price.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Per Day Price */}
                <div
                  className={`px-3 py-2 rounded-lg text-center ${
                    plan.popular ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className={`text-lg font-bold ${plan.popular ? "" : "text-foreground"}`}>
                    USD {plan.perDay.toFixed(2)}
                  </p>
                  <p className={`text-xs ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    {getPricingKey("perDay")}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* CTA Button */}
          <Button
            onClick={handleGetPlan}
            size="lg"
            className="w-full mt-6 gradient-primary text-primary-foreground text-lg font-bold py-6"
          >
            {getPricingKey("getMyPlan")}
          </Button>

          {/* Info Note */}
          <p className="text-center text-sm text-muted-foreground mt-4 px-4">💡 {getPricingKey("note")}</p>
        </div>
      </div>
    </section>
  );
};
