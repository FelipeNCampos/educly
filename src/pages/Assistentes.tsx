import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { ArrowLeft, GraduationCap, Wand2, Target, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AICard } from "@/components/assistentes/AICard";
import { AssistantsTutorial } from "@/components/onboarding";
import { ProductGuard } from "@/components/ProductGuard";
import { MobileNav } from "@/components/MobileNav";
const AI_TYPES = [
  {
    id: "specialist",
    icon: GraduationCap,
    gradient: { from: "#3b82f6", to: "#1d4ed8" },
    color: "#3b82f6",
  },
  {
    id: "prompt-creator",
    icon: Wand2,
    gradient: { from: "#8b5cf6", to: "#7c3aed" },
    color: "#8b5cf6",
  },
  {
    id: "planner",
    icon: Target,
    gradient: { from: "#10b981", to: "#059669" },
    color: "#10b981",
  },
  {
    id: "creative",
    icon: Palette,
    gradient: { from: "#ec4899", to: "#db2777" },
    color: "#ec4899",
  },
];

const AssistentesContent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      }
    };
    checkAuth();
  }, [navigate]);


  return (
    <div className="min-h-screen bg-background safe-area-inset pb-24">
      <AssistantsTutorial />
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              {t("assistants.title")}
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h1>
            <p className="text-muted-foreground text-sm">
              {t("assistants.subtitle")}
            </p>
          </div>
        </div>

        {/* AI Cards Grid */}
        <div id="assistants-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AI_TYPES.map((ai, index) => (
            <AICard
              key={ai.id}
              id={ai.id}
              cardId={`assistant-card-${index}`}
              icon={ai.icon}
              gradient={ai.gradient}
              color={ai.color}
              onClick={() => navigate(`/assistentes/${ai.id}`)}
              delay={index}
            />
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold text-foreground mb-2">
            🧠 {t("assistants.info.title")}
          </h3>
          <p className="text-muted-foreground text-sm">
            {t("assistants.info.description")}
          </p>
        </div>
      </div>
      <MobileNav />
    </div>
  );
};

const Assistentes = () => {
  return (
    <ProductGuard productType="ai_hub" mode="overlay">
      <AssistentesContent />
    </ProductGuard>
  );
};

export default Assistentes;
