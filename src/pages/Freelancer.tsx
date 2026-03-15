import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState, useMemo } from "react";
import { ProductGuard } from "@/components/ProductGuard";
import { ArrowLeft, Trophy, Loader2, MoreVertical, X } from "lucide-react";
import { FreelancerTutorial } from "@/components/onboarding";
import { useFreelancerContent } from "@/hooks/useFreelancerContent";
import { FreelancerCandyCrushPath } from "@/components/FreelancerCandyCrushPath";
import { MedalHolder } from "@/components/freelancer/MedalHolder";
import { FreelancerStepsBar } from "@/components/lesson/FreelancerStepsBar";
import type { StepProgress } from "@/components/lesson/FreelancerStepsBar";
import { MobileNav } from "@/components/MobileNav";

// Componente separado para o conteúdo da barra lateral (Card + Medalhas)
const SidebarContent = ({
  allCompleted,
  completedCount,
  totalModules,
  progressPercentage,
  t
}: {
  allCompleted: boolean;
  completedCount: number;
  totalModules: number;
  progressPercentage: number;
  t: any;
}) => (
  <div className="flex flex-col gap-6">
    {/* Card de Conquista com suporte a Dark Mode */}
    <div className="bg-card rounded-3xl p-8 shadow-sm border border-border flex flex-col items-center text-center">
      <div className="w-24 h-24 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-6 relative">
        <Trophy className="w-12 h-12 text-orange-500" />
        <div className="absolute top-0 right-0 text-orange-400 text-xl">✨</div>
      </div>

      <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
        Certificado de Elite
      </div>

      <h2 className="text-2xl font-black text-foreground mb-2">
        {allCompleted ? t("trail.congratulations", "Conquistado!") : t("freelancer.inProgress", "Em Progresso")}
      </h2>
      <p className="text-muted-foreground mb-6 font-medium">Trilha Freelancer Pro</p>

      {/* Barra de Progresso interna */}
      <div className="w-full bg-secondary h-3 rounded-full overflow-hidden mb-3">
        <div
          className="bg-orange-500 h-full rounded-full transition-all duration-1000"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground font-semibold">
        {completedCount} de {totalModules} módulos completados ({progressPercentage}%)
      </p>
    </div>

    {/* Container de Medalhas com suporte a Dark Mode */}
    <div className="bg-card rounded-3xl p-6 shadow-sm border border-border">
      <MedalHolder />
    </div>
  </div>
);

const FreelancerContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getAllModules, isLoading } = useFreelancerContent();
  const [moduleProgress, setModuleProgress] = useState<Record<number, { stepIndex: number; completed: boolean }>>({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const modules = getAllModules();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: progress } = await supabase
        .from("freelancer_module_progress")
        .select("module_number, step_index, completed")
        .eq("user_id", user.id);

      if (progress) {
        const progressMap = progress.reduce(
          (acc, p) => {
            acc[p.module_number] = { stepIndex: p.step_index, completed: p.completed };
            return acc;
          },
          {} as Record<number, { stepIndex: number; completed: boolean }>,
        );
        setModuleProgress(progressMap);
      }
    };
    checkAuth();
  }, [navigate]);

  const isModuleUnlocked = (moduleNumber: number): boolean => {
    if (moduleNumber === 1) return true;
    const previousModule = moduleProgress[moduleNumber - 1];
    return previousModule?.completed === true;
  };

  const isModuleCompleted = (moduleNumber: number): boolean => {
    return moduleProgress[moduleNumber]?.completed === true;
  };

  const handleModuleClick = (moduleNumber: number, hasContent: boolean) => {
    if (!isModuleUnlocked(moduleNumber)) {
      toast({
        title: t("freelancer.moduleLocked", "Módulo Bloqueado"),
        description: t("freelancer.completePreview", "Complete o módulo anterior primeiro"),
        variant: "destructive",
      });
      return;
    }
    if (hasContent) {
      navigate(`/freelancer/${moduleNumber}`);
    } else {
      toast({
        title: t("freelancer.comingSoon"),
        description: t("freelancer.moduleInDevelopment"),
      });
    }
  };

  const completedCount = useMemo(
    () => modules.filter((m) => isModuleCompleted(m.moduleNumber)).length,
    [modules, moduleProgress]
  );

  const currentModuleNumber = useMemo(() => {
    const current = modules.find(
      (m) => isModuleUnlocked(m.moduleNumber) && !isModuleCompleted(m.moduleNumber)
    );
    return current?.moduleNumber || 1;
  }, [modules, moduleProgress]);

  const totalModules = modules.length;
  const allCompleted = completedCount === totalModules;
  const progressPercentage = Math.round((completedCount / totalModules) * 100) || 0;

  const stepsForBar: StepProgress[] = useMemo(
    () =>
      modules.map((m) => ({
        stepNumber: m.moduleNumber,
        status: isModuleCompleted(m.moduleNumber)
          ? "completed" as const
          : m.moduleNumber === currentModuleNumber
            ? "current" as const
            : "locked" as const,
      })),
    [modules, moduleProgress, currentModuleNumber]
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t("trail.loading", "Carregando...")}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <FreelancerTutorial />

      {/* === MENU MOBILE OVERLAY (Drawer) === */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Fundo escuro (Backdrop) */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Conteúdo da Gaveta com cores dinâmicas */}
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-[350px] bg-background shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col h-full border-l border-border">

            {/* Cabeçalho da Gaveta */}
            <div className="p-4 flex justify-end border-b border-border bg-card">
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                <X className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>

            {/* Corpo da Gaveta */}
            <div className="p-6 overflow-y-auto flex-1 bg-background">
              <SidebarContent
                allCompleted={allCompleted}
                completedCount={completedCount}
                totalModules={totalModules}
                progressPercentage={progressPercentage}
                t={t}
              />
            </div>
          </div>
        </div>
      )}

      {/* Container Principal adaptado para Dark Mode (bg-background) */}
      <div className="min-h-screen bg-background p-4 md:p-8 font-sans safe-area-inset relative pb-24">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8 relative z-20">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="hover:bg-accent rounded-full transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-muted-foreground hover:text-foreground" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t("freelancer.title")}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedCount}/{totalModules} {t("freelancer.modulesCount", "módulos")}
                </p>
              </div>
            </div>

            {/* === BOTÃO 3 PONTINHOS (Só mobile) === */}
            <div className="lg:hidden relative">
              <Button
                variant="outline"
                size="icon"
                // Ajustado para usar bg-card e bordas que funcionam no dark mode
                className="bg-card text-orange-500 border-orange-200 dark:border-orange-800 shadow-sm hover:bg-orange-50 dark:hover:bg-orange-900/20 relative overflow-visible active:scale-95 transition-transform"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <MoreVertical className="w-6 h-6" />

                {/* NOTIFICAÇÃO */}
                <span className="absolute -top-1 -right-1 flex h-4 w-4 pointer-events-none">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-background dark:border-card"></span>
                </span>
              </Button>
            </div>
          </div>

          {/* GRID LAYOUT PRINCIPAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">

            {/* COLUNA ESQUERDA (Desktop apenas) */}
            <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-8">
              <SidebarContent
                allCompleted={allCompleted}
                completedCount={completedCount}
                totalModules={totalModules}
                progressPercentage={progressPercentage}
                t={t}
              />
            </div>

            {/* COLUNA DIREITA (Conteúdo da Trilha) */}
            <div className="col-span-1 lg:col-span-8 flex flex-col gap-8">

              {/* Barra Horizontal (Módulos) */}
              <div className="bg-card rounded-2xl p-4 shadow-sm border border-border relative z-20">
                <FreelancerStepsBar
                  steps={stepsForBar}
                  currentStep={currentModuleNumber}
                  onStepClick={(step) => {
                    const mod = modules.find((m) => m.moduleNumber === step);
                    if (mod) handleModuleClick(mod.moduleNumber, mod.hasContent);
                  }}
                />
              </div>

              {/* Trilha Vertical (Candy Crush) */}
              <div id="freelancer-modules" className="bg-card rounded-3xl p-6 shadow-sm border border-border min-h-[500px] z-10">
                <FreelancerCandyCrushPath
                  modules={modules}
                  moduleProgress={moduleProgress}
                  onModuleClick={handleModuleClick}
                />
              </div>

            </div>
          </div>
        </div>
      </div>
      <MobileNav />
    </>
  );
};

const Freelancer = () => {
  return (
    <ProductGuard productType="freelancer" mode="overlay">
      <FreelancerContent />
    </ProductGuard>
  );
};

export default Freelancer;