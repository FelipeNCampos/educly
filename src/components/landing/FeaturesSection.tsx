import { Smartphone, Bot, BarChart3, BadgeCheck, WifiOff, Gamepad2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FeaturesSection = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: Smartphone,
      titleKey: "landing.features.curriculum.title",
      descriptionKey: "landing.features.curriculum.description",
    },
    {
      icon: Bot,
      titleKey: "landing.features.mentoring.title",
      descriptionKey: "landing.features.mentoring.description",
    },
    {
      icon: BarChart3,
      titleKey: "landing.features.community.title",
      descriptionKey: "landing.features.community.description",
    },
    {
      icon: BadgeCheck,
      titleKey: "landing.features.certification.title",
      descriptionKey: "landing.features.certification.description",
    },
    {
      icon: WifiOff,
      titleKey: "landing.features.practical.title",
      descriptionKey: "landing.features.practical.description",
    },
    {
      icon: Gamepad2,
      titleKey: "landing.features.career.title",
      descriptionKey: "landing.features.career.description",
    },
  ];

  return (
    <section id="sobre" className="py-16 md:py-24 bg-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {t('landing.features.sectionLabel')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.titleKey}
              className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-soft card-hover animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{t(feature.titleKey)}</h3>
              <p className="text-muted-foreground">{t(feature.descriptionKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
