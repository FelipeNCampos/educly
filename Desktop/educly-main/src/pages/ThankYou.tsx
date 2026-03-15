import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Brain, ArrowRight, Zap, Award, Users } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { LanguageSelectionModal } from "@/components/LanguageSelectionModal";

const ThankYou = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Confetti explosion on load
  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']
      });

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE']
      });
    }, 250);

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#7C3AED', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'],
      zIndex: 9999
    });

    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: Zap,
      titleKey: "thankYou.benefit1Title",
      descKey: "thankYou.benefit1Desc",
    },
    {
      icon: Award,
      titleKey: "thankYou.benefit2Title",
      descKey: "thankYou.benefit2Desc",
    },
    {
      icon: Users,
      titleKey: "thankYou.benefit3Title",
      descKey: "thankYou.benefit3Desc",
    },
  ];

  const stats = [
    { value: "15", labelKey: "thankYou.stat1" },
    { value: "45+", labelKey: "thankYou.stat2" },
    { value: "100%", labelKey: "thankYou.stat3" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12">
      {/* Language Selection Modal */}
      <LanguageSelectionModal />

      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(260,60%,8%)] to-[hsl(var(--background))]" />
      
      {/* Aurora Mesh Blurs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary purple blur */}
        <div 
          className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 animate-float"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
            filter: 'blur(80px)',
            animationDuration: '20s',
          }}
        />
        {/* Secondary pink blur */}
        <div 
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 animate-float"
          style={{
            background: 'radial-gradient(circle, hsl(330, 80%, 50%) 0%, transparent 70%)',
            filter: 'blur(100px)',
            animationDelay: '3s',
            animationDuration: '25s',
          }}
        />
        {/* Tertiary blue blur */}
        <div 
          className="absolute top-1/3 right-1/3 w-[400px] h-[400px] rounded-full opacity-20 animate-float"
          style={{
            background: 'radial-gradient(circle, hsl(220, 80%, 50%) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animationDelay: '6s',
            animationDuration: '18s',
          }}
        />
        {/* Center glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 50%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Holographic Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px),
            linear-gradient(hsl(var(--primary)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float"
            style={{
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              background: `hsl(var(--primary) / ${0.3 + Math.random() * 0.4})`,
              left: `${Math.random() * 100}%`,
              top: `${100 + Math.random() * 20}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
              boxShadow: '0 0 10px hsl(var(--primary) / 0.5)',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 w-28 h-28 rounded-full border-2 border-primary/20 animate-ping" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full glass border-2 border-primary/40 neon-box-glow">
              <Brain className="w-12 h-12 text-primary animate-pulse-slow" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12 space-y-4 animate-fade-in-up">
          <h1 className="text-5xl md:text-7xl font-bold text-white neon-glow drop-shadow-lg">
            {t('thankYou.title')}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            {t('thankYou.subtitle')}
          </p>
          <p className="text-base md:text-lg text-white/80 max-w-xl mx-auto drop-shadow-md">
            {t('thankYou.description')}
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-16 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <Button
            onClick={() => navigate("/auth?tab=signup")}
            size="lg"
            className="group h-16 px-10 text-lg font-semibold neon-border hover-glow shadow-2xl relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              {t('thankYou.ctaButton')}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </Button>
        </div>

        {/* Stats Cards */}
        <div
          className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-black/40 backdrop-blur-xl border border-primary/30 rounded-2xl p-8 hover-lift transition-all duration-300 hover:border-primary/50 hover:scale-105 group"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/80">
                {t(stat.labelKey)}
              </div>
              <div className="mt-4 h-1 w-0 group-hover:w-full transition-all duration-500 bg-gradient-to-r from-primary to-purple-500 rounded-full" />
            </div>
          ))}
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">
            {t('thankYou.whatYouGet')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-black/40 backdrop-blur-xl border border-primary/30 rounded-2xl p-6 hover-lift transition-all duration-300 hover:scale-105 hover:border-primary/50 text-center group"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mb-4 group-hover:bg-primary/30 transition-colors group-hover:rotate-12 transition-transform duration-300">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {t(benefit.titleKey)}
                  </h3>
                  <p className="text-sm text-white/70">
                    {t(benefit.descKey)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
