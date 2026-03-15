import { Globe, Languages, Headphones, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

export const GlobalReachSection = () => {
  const { t } = useTranslation();
  
  // CORREÇÃO AQUI: Adicionado o prefixo 'landing.' em todas as chaves
  const regions = [
    { name: t('landing.globalReach.regions.latinAmerica'), students: "25.000+", flag: "🌎" },
    { name: t('landing.globalReach.regions.europe'), students: "12.000+", flag: "🌍" },
    { name: t('landing.globalReach.regions.northAmerica'), students: "8.000+", flag: "🌎" },
    { name: t('landing.globalReach.regions.asiaOceania'), students: "5.000+", flag: "🌏" },
  ];

  const features = [
    {
      icon: Languages,
      // CORREÇÃO AQUI: Adicionado 'landing.'
      title: t('landing.globalReach.features.languages.title'),
      description: t('landing.globalReach.features.languages.description'),
    },
    {
      icon: Headphones,
      // CORREÇÃO AQUI: Adicionado 'landing.'
      title: t('landing.globalReach.features.support.title'),
      description: t('landing.globalReach.features.support.description'),
    },
    {
      icon: Users,
      // CORREÇÃO AQUI: Adicionado 'landing.'
      title: t('landing.globalReach.features.community.title'),
      description: t('landing.globalReach.features.community.description'),
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            {/* CORREÇÃO AQUI: Adicionado 'landing.' */}
            {t('landing.globalReach.sectionLabel')}
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-4">
            {t('landing.globalReach.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t('landing.globalReach.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Globe Visual */}
          <div className="relative">
            <div className="aspect-square max-w-md mx-auto relative">
              {/* Background Circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-primary/20 animate-pulse-soft" />
              </div>
              <div className="absolute inset-8 flex items-center justify-center">
                <div className="w-full h-full rounded-full border-2 border-dashed border-accent/20" />
              </div>
              <div className="absolute inset-16 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-accent/10" />
              </div>
              
              {/* Center Globe */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <Globe className="w-16 h-16 md:w-20 md:h-20 text-white" />
                </div>
              </div>

              {/* Region Dots */}
              {regions.map((region, i) => {
                const positions = [
                  { top: "10%", left: "60%" },
                  { top: "30%", right: "5%" },
                  { bottom: "20%", left: "15%" },
                  { bottom: "30%", right: "20%" },
                ];
                return (
                  <div
                    key={region.name}
                    className="absolute bg-card rounded-lg p-3 shadow-md border border-border animate-float"
                    style={{ 
                      ...positions[i],
                      animationDelay: `${i * 0.5}s` 
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{region.flag}</span>
                      <div>
                        <div className="text-xs font-semibold">{region.name}</div>
                        <div className="text-xs text-primary">{region.students}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="flex gap-4 p-4 rounded-xl hover:bg-muted transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}

            {/* Region Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {regions.map((region) => (
                <div key={region.name} className="p-4 bg-card border border-border rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{region.flag}</span>
                    <span className="text-sm font-medium">{region.name}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">{region.students}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};