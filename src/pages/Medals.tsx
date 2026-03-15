import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAllMedals } from "@/hooks/useAllMedals";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Footprints,
  Compass,
  Target,
  Crown,
  Flame,
  Zap,
  Rocket,
  Timer,
  CheckCircle,
  Medal,
  Lock,
  Calendar,
  Trophy,
  MessageSquare,
  Bot,
  Sparkles,
  Sunrise,
  Moon,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  Compass,
  Target,
  Crown,
  Flame,
  Zap,
  Rocket,
  Timer,
  CheckCircle,
  Calendar,
  Trophy,
  MessageSquare,
  Bot,
  Sparkles,
  Sunrise,
  Moon,
};

const colorMap: Record<string, { bg: string; border: string; icon: string; glow: string }> = {
  emerald: {
    bg: "bg-emerald-100 dark:bg-emerald-900/30",
    border: "border-emerald-300 dark:border-emerald-700",
    icon: "text-emerald-600 dark:text-emerald-400",
    glow: "shadow-emerald-400/50",
  },
  blue: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
    icon: "text-blue-600 dark:text-blue-400",
    glow: "shadow-blue-400/50",
  },
  purple: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
    icon: "text-purple-600 dark:text-purple-400",
    glow: "shadow-purple-400/50",
  },
  amber: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    icon: "text-amber-600 dark:text-amber-400",
    glow: "shadow-amber-400/50",
  },
  orange: {
    bg: "bg-orange-100 dark:bg-orange-900/30",
    border: "border-orange-300 dark:border-orange-700",
    icon: "text-orange-600 dark:text-orange-400",
    glow: "shadow-orange-400/50",
  },
  yellow: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    border: "border-yellow-300 dark:border-yellow-700",
    icon: "text-yellow-600 dark:text-yellow-400",
    glow: "shadow-yellow-400/50",
  },
  red: {
    bg: "bg-red-100 dark:bg-red-900/30",
    border: "border-red-300 dark:border-red-700",
    icon: "text-red-600 dark:text-red-400",
    glow: "shadow-red-400/50",
  },
  cyan: {
    bg: "bg-cyan-100 dark:bg-cyan-900/30",
    border: "border-cyan-300 dark:border-cyan-700",
    icon: "text-cyan-600 dark:text-cyan-400",
    glow: "shadow-cyan-400/50",
  },
  green: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700",
    icon: "text-green-600 dark:text-green-400",
    glow: "shadow-green-400/50",
  },
};

const tierBorder: Record<string, string> = {
  bronze: "ring-2 ring-amber-600/50",
  silver: "ring-2 ring-slate-400/50",
  gold: "ring-2 ring-yellow-500/50",
  platinum: "ring-2 ring-purple-500/50 ring-offset-2 ring-offset-background",
};

const Medals = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getMedalsByCategory, isLoading, earnedCount, totalCount } = useAllMedals();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("common.logout") });
    navigate("/auth");
  };

  const { freelancerMedals, trailMedals } = getMedalsByCategory();

  const renderMedalGrid = (medals: ReturnType<typeof getMedalsByCategory>["freelancerMedals"]) => (
    <TooltipProvider delayDuration={100}>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-4">
        {medals.map((medal) => {
          const IconComponent = iconMap[medal.icon_name] || Medal;
          const colors = colorMap[medal.color] || colorMap.amber;

          return (
            <Tooltip key={medal.id}>
              <TooltipTrigger asChild>
                <div className="flex flex-col items-center gap-2">
                  <button
                    className={cn(
                      "relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
                      "border-2",
                      medal.isEarned
                        ? cn(
                            colors.bg,
                            colors.border,
                            tierBorder[medal.tier],
                            "shadow-lg",
                            colors.glow,
                            "hover:scale-110 cursor-pointer"
                          )
                        : "bg-slate-200/50 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 opacity-40 cursor-default"
                    )}
                  >
                    {medal.isEarned ? (
                      <IconComponent className={cn("w-7 h-7", colors.icon)} />
                    ) : (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    )}

                    {medal.isEarned && (
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
                    )}
                  </button>
                  <span className={cn(
                    "text-xs text-center font-medium max-w-[80px] truncate",
                    medal.isEarned ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {medal.name}
                  </span>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className={cn(
                  "max-w-xs",
                  medal.isEarned
                    ? "bg-background border-border"
                    : "bg-muted border-border"
                )}
              >
                <div className="text-center">
                  <p className="font-semibold text-foreground">{medal.name}</p>
                  <p className="text-sm text-muted-foreground">{medal.description}</p>
                  {medal.isEarned && medal.earnedAt && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Conquistada em{" "}
                      {new Date(medal.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                  {!medal.isEarned && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Bloqueada
                    </p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse">
          <Medal className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background safe-area-inset">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-8 pt-4">
        <DashboardHeader onLogout={handleLogout} />

        {/* Header */}
        <div className="mt-6 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="pl-0 hover:bg-transparent hover:text-primary mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Medal className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t("medals.title", "Minhas Medalhas")}</h1>
              <p className="text-muted-foreground mt-1">
                {t("medals.earnedCount", "{{earned}} de {{total}} conquistadas", {
                  earned: earnedCount,
                  total: totalCount,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Freelancer Medals Section */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-emerald-200 dark:bg-emerald-800/50">
              <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {t("medals.freelancerSection", "Trilha Freelancer")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("medals.freelancerDesc", "Medalhas conquistadas na trilha freelancer")}
              </p>
            </div>
          </div>
          {renderMedalGrid(freelancerMedals)}
        </div>

        {/* Trail 28 Days Medals Section */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-full bg-blue-200 dark:bg-blue-800/50">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-foreground">
                {t("medals.trailSection", "Desafio 28 Dias")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("medals.trailDesc", "Medalhas conquistadas no desafio de 28 dias")}
              </p>
            </div>
          </div>
          {renderMedalGrid(trailMedals)}
        </div>
      </div>
    </div>
  );
};

export default Medals;
