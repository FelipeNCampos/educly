import { Star, Users, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section id="inicio" className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-background" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      
      {/* Floating Elements */}
      <div className="absolute top-32 right-[15%] w-16 h-16 bg-primary/20 rounded-2xl rotate-12 animate-float hidden lg:block" />
      <div className="absolute top-48 left-[10%] w-12 h-12 bg-accent/20 rounded-full animate-float-delayed hidden lg:block" />
      <div className="absolute bottom-32 right-[25%] w-10 h-10 bg-secondary/20 rounded-lg rotate-45 animate-float hidden lg:block" />
      
      <div className="container mx-auto px-4 relative z-10">
      <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up stagger-1">
            {t('landing.hero.title')}{" "}
            <span className="gradient-text">{t('landing.hero.titleHighlight')}</span>
            {" "}{t('landing.hero.titleEnd')}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-2">
            {t('landing.hero.subtitle')}
          </p>


          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in-up stagger-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-sm md:text-base">
                <strong className="text-foreground">50.000+</strong>
                <span className="text-muted-foreground ml-1">{t('landing.hero.students')}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm md:text-base">
                <strong className="text-foreground">4.9</strong>
                <span className="text-muted-foreground ml-1">{t('landing.hero.rating')}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <span className="text-sm md:text-base">
                <strong className="text-foreground">150+</strong>
                <span className="text-muted-foreground ml-1">{t('landing.hero.countries')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
