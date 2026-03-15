import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DashboardHeader } from "@/components/DashboardHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { ProductGuard } from "@/components/ProductGuard";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { FreelancerTutorial } from "@/components/onboarding";
import { useFreelancerContent } from "@/hooks/useFreelancerContent";
import { FreelancerCandyCrushPath } from "@/components/FreelancerCandyCrushPath";
import { MedalHolder } from "@/components/freelancer/MedalHolder";

const FreelancerContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { toast } = useToast();
  const { getAllModules, isLoading } = useFreelancerContent();
  const [moduleProgress, setModuleProgress] = useState<Record<number, { stepIndex: number; completed: boolean }>>({});

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: t("common.logout") });
    navigate("/auth");
  };

  const isModuleUnlocked = (moduleNumber: number): boolean => {
    if (moduleNumber === 1) return true;
    const previousModule = moduleProgress[moduleNumber - 1];
    return previousModule?.completed === true;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#313338] flex items-center justify-center">
        <div className="animate-pulse text-orange-500">
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <FreelancerTutorial />
      <div className="min-h-screen bg-slate-50 dark:bg-[#313338] text-slate-900 dark:text-[#dbdee1] antialiased font-sans transition-colors duration-300">
        {/* pb-40 no mobile para dar espaço ao botão fixo, lg:pb-24 no desktop */}
        <div className="max-w-[700px] mx-auto px-6 pt-6 pb-40 lg:pb-24">
          <DashboardHeader onLogout={handleLogout} />

          <div className="mt-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="pl-0 text-slate-400 hover:bg-transparent hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </div>

          <div className="mt-8 mb-12">
            <div className="flex items-center mb-6">
              <span className="bg-orange-100 dark:bg-orange-500/10 text-orange-700 dark:text-orange-500 px-3 py-1.5 rounded-lg text-[11px] font-extrabold tracking-widest flex items-center gap-2 uppercase">
                <span className="text-sm">📚</span> APRENDER
              </span>
            </div>

            <h1 className="text-[36px] font-[900] text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-6">
              {t("freelancer.title")}
            </h1>

            <div className="space-y-6">
              <p className="text-[18px] text-slate-600 dark:text-[#b5bac1] leading-relaxed font-medium">
                {t("freelancer.subtitle")}
              </p>
            </div>
          </div>

          <div className="mb-12">
            <MedalHolder />
          </div>

          <div id="freelancer-modules" className="space-y-10">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t("freelancer.modules")}</h3>
              <Badge variant="secondary" className="bg-slate-100 dark:bg-[#2b2d31] text-slate-500 dark:text-[#949ba4] border-none font-semibold">
                {modules.length} {t("freelancer.modulesCount")}
              </Badge>
            </div>

            <div className="relative">
              <FreelancerCandyCrushPath
                modules={modules}
                moduleProgress={moduleProgress}
                onModuleClick={handleModuleClick}
              />
            </div>
          </div>

          {/* Botão de rodapé Laranja - Ajustado para mobile e z-index */}
          <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/90 dark:bg-[#313338]/90 backdrop-blur-md border-t border-slate-100 dark:border-white/5 z-50 lg:static lg:bg-transparent lg:border-none lg:p-0 lg:mt-16">
            <Button
              onClick={() => handleModuleClick(1, true)}
              className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-[900] py-8 rounded-2xl text-[17px] uppercase tracking-widest shadow-xl shadow-orange-100 dark:shadow-none transition-all active:scale-[0.98]"
            >
              {t("common.continue", "CONTINUAR")}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

const Freelancer = () => {
  return (
    <ProductGuard productType="freelancer">
      <FreelancerContent />
    </ProductGuard>
  );
};

export default Freelancer;
