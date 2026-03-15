import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/DashboardHeader";
import { WeeklyStreakBar } from "@/components/WeeklyStreakBar";
import { usePremiumAccess } from "@/hooks/usePremiumAccess";
import { useTranslation } from "react-i18next";
import { DashboardTutorial } from "@/components/onboarding";
import { FloatingEdiChat } from "@/components/chat/FloatingEdiChat";
import { Lock, Play, Target, Route, Shield, Medal, Star, Zap, Bookmark, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

// --- IMPORTAÇÃO DAS IMAGENS ---
import challengeInicianteImg from "@/assets/Edi-dashboard.png";
import corujaAssistenteImg from "@/assets/IA.png"; 
import corujaFreelancerImg from "@/assets/coruja-freelancer.png"; 

const MASTER_ADMIN_EMAIL = "ferramentasdigitais1000@gmail.com";
const CHALLENGE_28_DAYS_ID = "dfb76f1b-d272-4e4d-96b2-0bc4d3392489";

const MOCK_ACTIVE_SESSION = {
  current_day: 1,
  challenges: {
    id: "1",
    name: "Desafio Iniciante de IA",
    slug: "chatgpt",
    description: "Aprenda tudo sobre as 8 principais IAs do mercado em 28 dias de aprendizado intensivo e prático.",
    duration_days: 28,
  },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isPremium } = usePremiumAccess();
  const [userId, setUserId] = useState<string | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const isMasterAdmin = user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
        if (isMasterAdmin) {
          const { data: adminCheck } = await supabase.rpc('is_admin');
          setIsAdmin(isMasterAdmin && adminCheck === true);
        }
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("common.logout") });
    navigate("/auth");
  };

  const { data: userChallengeProgress } = useQuery({
    queryKey: ["user-active-challenge"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from("user_challenge_progress").select("*, challenges(*)").eq("user_id", user.id).eq("is_active", true).maybeSingle();
      return data;
    },
  });

  const { data: completedDaysCount = 0 } = useQuery({
    queryKey: ["completed-days-count", CHALLENGE_28_DAYS_ID],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;
      const { data: challengeDays } = await supabase.from("challenge_days").select("id").eq("challenge_id", CHALLENGE_28_DAYS_ID);
      if (!challengeDays || challengeDays.length === 0) return 0;
      const dayIds = challengeDays.map((d) => d.id);
      const { count } = await supabase.from("user_day_progress").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("completed", true).in("challenge_day_id", dayIds);
      return count || 0;
    },
  });

  const displaySession = userChallengeProgress || MOCK_ACTIVE_SESSION;
  const activeChallenge = displaySession?.challenges;
  const totalDays = 28;
  const isCompleted = completedDaysCount >= totalDays;
  const hasProgress = completedDaysCount > 0;
  const progressPercentage = Math.round((completedDaysCount / totalDays) * 100);

  const bookmarkLabel = isCompleted
    ? t("challenge.review", "Revisar")
    : hasProgress
      ? t("common.continue", "Continuar")
      : t("challenge.start", "Iniciar");

  const featuredCards = [
    {
      img: corujaAssistenteImg,
      title: t("assistants.title"),
      subtitle: t("assistants.dashboardDesc"),
      bgClass: "bg-blue-100 dark:bg-blue-900/40", // AZUL MAIS FORTE
      link: "/assistentes",
      ledColor: "#3b82f6",
      badgeColor: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
      isLocked: !isPremium,
      isPremium: true,
    },
    {
      img: corujaFreelancerImg,
      title: t("freelancer.title"),
      subtitle: t("freelancer.subtitle"),
      bgClass: "bg-purple-100 dark:bg-purple-900/40", // ROXO MAIS FORTE
      link: "/freelancer",
      isPremiumLock: !isPremium,
      isPremium: true,
      ledColor: "#a855f7",
      badgeColor: "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600",
      isLocked: !isPremium,
    },
  ];

  const secondaryCards = [
    { icon: Target, title: t("dailyMissions.title"), colorClass: "text-red-500", bgClass: "bg-red-100 dark:bg-red-900/20", link: "/dashboard" },
    { icon: Route, title: t("personalizedBrief.title"), colorClass: "text-orange-500", bgClass: "bg-orange-100 dark:bg-orange-900/20", link: "/trilha-personalizada" },
    { icon: Medal, title: t("medals.title", "Medalhas"), colorClass: "text-amber-500", bgClass: "bg-amber-100 dark:bg-amber-900/20", link: "/medalhas" },
  ];

  return (
    <div className="min-h-screen bg-background safe-area-inset pb-20">
      <style>{`
        @keyframes pulse-led {
          0%, 100% { 
            opacity: 0.8;
            box-shadow: 0 0 10px var(--led-color), 0 0 20px var(--led-color);
          }
          50% { 
            opacity: 1;
            box-shadow: 0 0 15px var(--led-color), 0 0 30px var(--led-color), 0 0 40px var(--led-color);
          }
        }
        @keyframes pulse-premium {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        .led-border-wrapper {
          position: relative;
          padding: 2px;
          overflow: hidden;
          display: flex;
          border-radius: 2.5rem;
          z-index: 0;
        }
        .led-border-wrapper::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: var(--led-color);
          animation: pulse-led 2s ease-in-out infinite;
          border-radius: 2.5rem;
          opacity: 0.8;
          z-index: -1;
        }
        .led-content {
          width: 100%;
          height: 100%;
          border-radius: calc(2.5rem - 2px);
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          position: relative;
          background-clip: padding-box;
        }
        .premium-badge-pulse {
          animation: pulse-premium 2s infinite ease-in-out;
          transform: translateZ(0);
        }
      `}</style>

      <DashboardTutorial />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 pt-4">
        <DashboardHeader onLogout={handleLogout} />

        <div className="space-y-4 mt-3">
          <div id="weekly-streak">
            <WeeklyStreakBar />
          </div>

          {activeChallenge && (
            <div className="relative bg-orange-50/80 dark:bg-orange-900/10 border border-orange-100 rounded-3xl p-6 md:p-8 cursor-pointer hover:shadow-md transition-all group" onClick={() => navigate(`/desafio/${activeChallenge.slug}`)}>
              {/* Bookmark badge */}
              <div
                className="absolute top-0 right-6 z-20 flex flex-col items-center cursor-pointer"
                onClick={(e) => { e.stopPropagation(); navigate(`/desafio/${activeChallenge.slug}`); }}
              >
                <div className="bg-primary text-primary-foreground px-3 pt-2 pb-4 rounded-b-lg shadow-md flex flex-col items-center gap-1 relative"
                  style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), 50% 100%, 0 calc(100% - 10px))' }}
                >
                  {isCompleted ? (
                    <RotateCcw className="w-3.5 h-3.5" />
                  ) : hasProgress ? (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  ) : (
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">{bookmarkLabel}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/3 aspect-video md:h-56 rounded-2xl overflow-hidden relative shadow-sm">
                  <img src={challengeInicianteImg} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="Challenge" />
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <p className="text-xs font-bold text-primary tracking-wider uppercase mb-2">{t("challenge.continueFromWhere")}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground">{t("challenges.iniciante-ia.name")}</h3>
                    <p className="text-muted-foreground mt-2 line-clamp-2">{t("challenges.iniciante-ia.description")}</p>
                  </div>
                  <div className="pt-2 space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground"><span>{completedDaysCount}/{totalDays} {t("challenge.days")}</span><span>{progressPercentage}%</span></div>
                    <Progress value={progressPercentage} className="h-2.5 rounded-full" />
                  </div>
                  <Button className="rounded-xl px-6 h-11"><Play className="w-4 h-4 mr-2 fill-current" />{t("common.continue")}</Button>
                </div>
              </div>
            </div>
          )}

          {/* CARDS COM LED PULSANTE E SELOS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredCards.map((card, index) => (
              <div
                key={index}
                className="led-border-wrapper group cursor-pointer"
                style={{ '--led-color': card.ledColor } as React.CSSProperties}
                onClick={() => navigate(card.link)}
              >
                {/* SELOS POSICIONADOS NO TOPO - FORA DO FLUXO DE ESCALA */}
                <div className="absolute top-6 right-6 flex flex-col items-end gap-2 z-[100] pointer-events-none">
                  
                  {/* Badge IDÊNTICO para ambos os cards */}
                  <div className={`premium-badge-pulse ${card.badgeColor} text-white text-[10px] font-black px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20`}>
                    <Lock className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2.5} />
                    EDUCLY PREMIUM
                    {card.isLocked && (
                      <Lock className="w-3.5 h-3.5 text-yellow-400" strokeWidth={2.5} />
                    )}
                  </div>
                </div>

                <div className={`led-content ${card.bgClass} p-8 shadow-xl transition-all group-hover:shadow-2xl`}>
                  <div className="w-24 h-24 mb-6 relative z-10 drop-shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src={card.img} 
                      className="w-full h-full object-contain" 
                      alt={card.title} 
                    />
                  </div>
                  
                  <h3 className="text-2xl font-black text-foreground">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground font-medium text-sm mt-2 leading-relaxed max-w-[80%]">
                    {card.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {secondaryCards.map((card, index) => (
              <div key={index} className="bg-card/40 border border-border/40 rounded-2xl p-4 flex flex-col items-center text-center cursor-pointer hover:bg-card transition-all" onClick={() => navigate(card.link)}>
                <div className={`w-10 h-10 rounded-xl ${card.bgClass} flex items-center justify-center mb-2`}><card.icon className={`w-5 h-5 ${card.colorClass}`} /></div>
                <h3 className="font-bold text-xs text-foreground">{card.title}</h3>
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