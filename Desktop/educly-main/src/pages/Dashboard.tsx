import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/DashboardHeader";
import { WeeklyStreakBar } from "@/components/WeeklyStreakBar";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useTranslation } from "react-i18next";
import { FloatingEdiChat } from "@/components/chat/FloatingEdiChat";
import { Lock, LockOpen, Play, Target, Route, Medal, Zap, Sparkles, ChevronRight, Brain, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyLoginXP } from "@/hooks/useDailyLoginXP";
import { Badge } from "@/components/ui/badge";

import challengeInicianteImg from "@/assets/Edi-dashboard.png";
import corujaIA from "@/assets/IA.png";
import corujaFreelancerImg from "@/assets/coruja-freelancer.png";

const CHALLENGE_28_DAYS_ID = "dfb76f1b-d272-4e4d-96b2-0bc4d3392489";

const MOCK_ACTIVE_SESSION = {
  current_day: 1,
  challenges: {
    id: "1",
    name: "Desafio Iniciante de IA",
    slug: "chatgpt",
    description: "Aprenda tudo sobre as 8 principais IAs do mercado...",
    duration_days: 28,
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPremium } = usePremiumAccess();
  const [userId, setUserId] = useState<string | undefined>();

  useDailyLoginXP();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("common.logout") });
    navigate("/auth");
  };

  const { data: completedDaysCount = 0 } = useQuery({
    queryKey: ["completed-days-count", CHALLENGE_28_DAYS_ID],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data: challengeDays } = await supabase
        .from("challenge_days")
        .select("id")
        .eq("challenge_id", CHALLENGE_28_DAYS_ID);
      if (!challengeDays || challengeDays.length === 0) return 0;
      const dayIds = challengeDays.map((d) => d.id);
      const { count } = await supabase
        .from("user_day_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("completed", true)
        .in("challenge_day_id", dayIds);
      return count || 0;
    },
  });

  const activeChallenge = MOCK_ACTIVE_SESSION.challenges;
  const totalDays = 28;
  const progressPercentage = Math.round((completedDaysCount / totalDays) * 100);

  // --- CORREÇÃO DE SEGURANÇA AQUI ---
  // Verifica se o retorno é realmente um array antes de tentar usar.
  // Se o JSON não tiver carregado, usa um array vazio [] para não quebrar a tela.
  const getFeaturesArray = (key: string) => {
    const result = t(key, { returnObjects: true });
    return Array.isArray(result) ? result : [];
  };

  const featuredCards = [
    {
      img: corujaIA,
      title: t("dashboard.featured.assistants.title"),
      subtitle: t("dashboard.featured.assistants.subtitle"),
      link: "/assistentes",
      gradient: "from-violet-500/20 to-purple-500/10",
      icon: Brain,
      stats: t("dashboard.featured.assistants.stats"),
      buttonText: t("dashboard.featured.assistants.button"),
      features: getFeaturesArray("dashboard.featured.assistants.features"), // Uso da função segura
    },
    {
      img: corujaFreelancerImg,
      title: t("dashboard.featured.projects.title"),
      subtitle: t("dashboard.featured.projects.subtitle"),
      link: "/projetos",
      gradient: "from-emerald-500/20 to-teal-500/10",
      icon: Code,
      stats: t("dashboard.featured.projects.stats"),
      buttonText: t("dashboard.featured.projects.button"),
      features: getFeaturesArray("dashboard.featured.projects.features"), // Uso da função segura
    },
  ];

  const secondaryCards = [
    {
      icon: Target,
      title: t("dashboard.missions.title"),
      subtitle: t("dashboard.missions.subtitle"),
      colorClass: "text-rose-500",
      link: "/dashboard",
      showFooter: false,
      gradient: "from-rose-500/20 to-pink-500/10",
      cta: t("dashboard.missions.cta"),
      iconBg: "bg-rose-500/10",
    },
    {
      icon: Route,
      title: t("dashboard.trail.title"),
      subtitle: t("dashboard.trail.subtitle"),
      colorClass: "text-blue-500 dark:text-blue-400",
      link: "/trilha-personalizada",
      showFooter: true,
      gradient: "from-blue-500/20 to-cyan-500/10",
      cta: t("dashboard.trail.cta"),
      iconBg: "bg-blue-500/10",
    },
    {
      icon: Medal,
      title: t("dashboard.medals.title"),
      subtitle: t("dashboard.medals.subtitle"),
      colorClass: "text-amber-500 dark:text-amber-400",
      link: "/medalhas",
      showFooter: false,
      gradient: "from-amber-500/20 to-yellow-500/10",
      cta: t("dashboard.medals.cta"),
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/50 dark:from-background dark:to-slate-950 text-foreground safe-area-inset pb-20 transition-colors duration-300">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .shimmer-effect {
          background: linear-gradient(90deg, 
            transparent 0%, 
            rgba(255,255,255,0.1) 50%, 
            transparent 100%);
          background-size: 200% 100%;
          animation: shimmer 3s infinite;
        }

        .card-3d-container {
          perspective: 1200px;
          position: relative;
        }

        .card-surface-3d {
          position: relative;
          z-index: 1;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
          background: linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--card)/0.95) 100%);
          border: 1px solid rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .dark .card-surface-3d {
          background: linear-gradient(135deg, hsla(var(--card)/0.9) 0%, hsla(var(--card)/0.7) 100%);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-3d-container:hover .card-surface-3d {
          transform: rotateX(5deg) rotateY(-3deg) translateY(-12px);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .card-surface-3d::before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .card-3d-container:hover .card-surface-3d::before {
          opacity: 1;
        }

        .card-surface-3d::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.6) 0%, 
            rgba(255,255,255,0.2) 50%, 
            transparent 100%);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .dark .card-surface-3d::after {
          background: linear-gradient(135deg, 
            rgba(255,255,255,0.2) 0%, 
            rgba(255,255,255,0.1) 50%, 
            transparent 100%);
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 pt-4">
        <DashboardHeader onLogout={handleLogout} />

        {/* Welcome Banner */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t("dashboard.welcome_title")}
          </h1>
          <p className="text-slate-600 dark:text-muted-foreground">
            {t("dashboard.welcome_subtitle", { completed: completedDaysCount, total: totalDays })}
          </p>
        </div>

        <div className="space-y-10 mt-6">
          <WeeklyStreakBar />

          {/* CARD PRINCIPAL */}
          <div className="card-3d-container">
            <div
              onClick={() => navigate(`/desafio/${activeChallenge.slug}`)}
              className="card-surface-3d relative group overflow-hidden rounded-3xl p-6 md:p-8 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

              <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="w-full md:w-2/5 relative">
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-black/5 dark:border-white/10 group-hover:shadow-3xl transition-all duration-500">
                    <img
                      src={challengeInicianteImg}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      alt="Challenge"
                    />
                  </div>
                  <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-primary to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Zap className="w-3 h-3" /> {t("dashboard.status_in_progress")}
                  </div>
                </div>
                <div className="flex-1 w-full space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {completedDaysCount}/{totalDays} {t("dashboard.days_label")}
                      </Badge>
                      <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                        <Sparkles className="w-3 h-3 mr-1" /> {t("dashboard.status_active")}
                      </Badge>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                      {t("challenges.iniciante-ia.name")}
                    </h3>
                    <p className="text-slate-600 dark:text-muted-foreground text-base leading-relaxed">
                      {t("challenges.iniciante-ia.description")}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm font-medium text-slate-500 dark:text-muted-foreground/80">
                      <span className="flex items-center gap-2">
                        <Play className="w-4 h-4 fill-current text-primary" />
                        {t("dashboard.challenge_progress")}
                      </span>
                      <span className="font-bold">{progressPercentage}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={progressPercentage} className="h-3 bg-slate-100 dark:bg-secondary/50" />
                      <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent shimmer-effect" />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <Button className="rounded-xl px-8 h-12 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white font-bold shadow-lg shadow-primary/25 transition-all active:scale-95 group/btn">
                      <span>{t("dashboard.continue_button")}</span>
                      <ChevronRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl px-6 h-12 border-2"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {t("dashboard.view_content")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID DE CARDS DESTAQUE */}
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredCards.map((card, index) => (
                <div key={index} className="card-3d-container h-full">
                  <div
                    onClick={() => navigate(card.link)}
                    className="card-surface-3d group p-6 rounded-3xl h-full flex flex-col cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="relative">
                        <div
                          className={`absolute -inset-4 ${card.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity`}
                        />
                        <div className="relative w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
                          <img src={card.img} className="w-12 h-12 object-contain" alt={card.title} />
                        </div>
                      </div>
                      <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                        {isPremium ? (
                          <>
                            <LockOpen className="w-3 h-3 text-emerald-500" />
                            {t("dashboard.premium_label")}
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-amber-500" />
                            {t("dashboard.premium_label")}
                          </>
                        )}
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-slate-600 dark:text-muted-foreground text-sm mb-4 flex-1">{card.subtitle}</p>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {/* Verificação extra aqui dentro para garantir que não quebre */}
                        {Array.isArray(card.features) &&
                          card.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300"
                            >
                              {feature}
                            </span>
                          ))}
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <card.icon className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{card.stats}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GRID DE CARDS SECUNDÁRIOS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {secondaryCards.map((card, index) => (
              <div key={index} className="card-3d-container h-full">
                <div
                  onClick={() => navigate(card.link)}
                  className={`card-surface-3d group p-6 rounded-3xl h-full flex flex-col justify-between cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 transition-colors relative overflow-hidden`}
                >
                  <div
                    className={`absolute -inset-4 ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`}
                  />

                  <div className="relative z-10">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${card.iconBg}`}>
                      <card.icon className={`w-6 h-6 ${card.colorClass}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{card.title}</h3>
                    <p className="text-slate-600 dark:text-muted-foreground text-sm leading-relaxed mb-4">
                      {card.subtitle}
                    </p>
                  </div>

                  {card.showFooter && (
                    <div className="relative z-10 mt-auto pt-4 flex items-center text-sm font-medium text-primary">
                      {card.cta} <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FloatingEdiChat />
    </div>
  );
};

export default Dashboard;
