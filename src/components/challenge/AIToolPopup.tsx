import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Award, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { aiToolsConfig } from "@/components/lesson/AIToolSelector";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AIToolPopupProps {
  toolSlug: string | null;
  progress: number;
  completedDays: number;
  totalDays: number;
  challengeId: string | null;
  overallProgress: number;
  isOpen: boolean;
  onClose: () => void;
}

const toolAdvantages: Record<string, string[]> = {
  chatgpt: ["advantages.chatgpt.1", "advantages.chatgpt.2", "advantages.chatgpt.3"],
  claude: ["advantages.claude.1", "advantages.claude.2", "advantages.claude.3"],
  deepseek: ["advantages.deepseek.1", "advantages.deepseek.2", "advantages.deepseek.3"],
  gemini: ["advantages.gemini.1", "advantages.gemini.2", "advantages.gemini.3"],
  nanobanana: ["advantages.nanobanana.1", "advantages.nanobanana.2", "advantages.nanobanana.3"],
  lovable: ["advantages.lovable.1", "advantages.lovable.2", "advantages.lovable.3"],
  "captions-ai": ["advantages.captions-ai.1", "advantages.captions-ai.2", "advantages.captions-ai.3"],
  elevenlabs: ["advantages.elevenlabs.1", "advantages.elevenlabs.2", "advantages.elevenlabs.3"],
};

export const AIToolPopup = ({
  toolSlug,
  progress,
  completedDays,
  totalDays,
  challengeId,
  overallProgress,
  isOpen,
  onClose,
}: AIToolPopupProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!toolSlug) return null;

  const config = aiToolsConfig[toolSlug] || aiToolsConfig["chatgpt"];
  const advantages = toolAdvantages[toolSlug] || toolAdvantages["chatgpt"];
  const canGenerateCertificate = progress === 100;

  const handleGenerateCertificate = async () => {
    if (!challengeId || !toolSlug) return;

    setIsGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if certificate already exists for this tool + challenge
      const { data: existing } = await supabase
        .from("user_certificates")
        .select("id")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .eq("tool_slug", toolSlug)
        .maybeSingle();

      if (existing) {
        onClose();
        navigate(`/certificado/${existing.id}`);
        return;
      }

      // Get user name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();

      const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Student";

      // Generate certificate via RPC for this specific tool
      const { data: certId, error } = await supabase.rpc("generate_tool_certificate" as any, {
        p_challenge_id: challengeId,
        p_tool_slug: toolSlug,
        p_user_full_name: fullName,
      });

      if (error) {
        console.error("Certificate generation error:", error);
        toast({
          title: t("challenge.certificateError", "Erro ao gerar certificado"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      if (certId) {
        onClose();
        navigate(`/certificado/${certId}`);
      } else {
        toast({
          title: t("challenge.certificateError", "Erro ao gerar certificado"),
          description: t("challenge.certificateIncomplete", "Complete todos os dias desta ferramenta primeiro."),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Certificate generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl border-border bg-card p-0 overflow-hidden">
        {/* Header with gradient */}
        <div
          className="relative px-6 pt-8 pb-6 flex flex-col items-center text-center"
          style={{
            background: `linear-gradient(135deg, ${config.color}15, ${config.color}05)`,
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 ring-4 ring-offset-2 ring-offset-card"
            style={{
              backgroundColor: `${config.color}20`,
              boxShadow: `0 0 0 4px ${config.color}30`,
            }}
          >
            <img src={config.logo} alt={config.name} className="w-12 h-12 object-contain" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-foreground">{config.name}</DialogTitle>
          </DialogHeader>
        </div>

        {/* Progress */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">{t("challenge.progress")}</span>
            <span className="font-bold text-foreground">{progress}%</span>
          </div>
          <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                backgroundColor: config.color,
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedDays}/{totalDays} {t("challenge.days")} {t("challenge.completed").toLowerCase()}
          </p>
        </div>

        {/* Advantages */}
        <div className="px-6 pb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">
            {t("challenge.toolAdvantages")}
          </h3>
          <ul className="space-y-2">
            {advantages.map((key, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: config.color }}
                />
                <span className="text-sm text-muted-foreground">{t(`challenge.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Certificate Button */}
        <div className="px-6 pb-6">
        {canGenerateCertificate ? (
            <Button
              className="w-full gap-2"
              onClick={handleGenerateCertificate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              {isGenerating
                ? t("challenge.generatingCertificate", "Gerando...")
                : t("challenge.generateCertificate")}
            </Button>
          ) : (
            <Button className="w-full gap-2" variant="secondary" disabled>
              <Lock className="w-4 h-4" />
              {t("challenge.completeToCertificate")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
