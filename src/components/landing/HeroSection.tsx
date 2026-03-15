import { Star, Users, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export const HeroSection = () => {
    const { t } = useTranslation();

    return (
        <section id="inicio" className="relative pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden bg-white dark:bg-slate-900">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

            {/* Floating Elements */}
            <div className="absolute top-32 right-[15%] w-16 h-16 bg-orange-500/20 rounded-2xl rotate-12 animate-float hidden lg:block" />
            <div className="absolute top-48 left-[10%] w-12 h-12 bg-blue-500/20 rounded-full animate-float-delayed hidden lg:block" />
            <div className="absolute bottom-32 right-[25%] w-10 h-10 bg-slate-500/20 rounded-lg rotate-45 animate-float hidden lg:block" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Title */}
                    <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in-up stagger-1 text-slate-900 dark:text-white">
                        {t('landing.hero.title')}{" "}
                        <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              {t('landing.hero.titleHighlight')}
            </span>
                        {" "}{t('landing.hero.titleEnd')}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto animate-fade-in-up stagger-2">
                        {t('landing.hero.subtitle')}
                    </p>

                    {/* Trust Indicators */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-12 animate-fade-in-up stagger-4">
                        <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-orange-500" />
                            <span className="text-sm md:text-base">
                <strong className="text-slate-900 dark:text-white">50.000+</strong>
                <span className="text-slate-600 dark:text-slate-400 ml-1">{t('landing.hero.students')}</span>
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                ))}
                            </div>
                            <span className="text-sm md:text-base">
                <strong className="text-slate-900 dark:text-white">4.9</strong>
                <span className="text-slate-600 dark:text-slate-400 ml-1">{t('landing.hero.rating')}</span>
              </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-orange-500" />
                            <span className="text-sm md:text-base">
                <strong className="text-slate-900 dark:text-white">150+</strong>
                <span className="text-slate-600 dark:text-slate-400 ml-1">{t('landing.hero.countries')}</span>
              </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};