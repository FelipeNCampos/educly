import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/StreakBadge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { InstallButton } from "@/components/InstallButton";
import { SoundControl } from "@/components/SoundControl";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  onLogout: () => void;
}

// A CORREÇÃO ESTÁ AQUI: 'export const' define o nome exato para a importação funcionar
export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { t } = useTranslation();

  // Fetch user profile with full_name
  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profileData } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle();

      return {
        fullName:
          profileData?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          t("dashboard.student"),
      };
    },
  });

  const userName = profile?.fullName || t("dashboard.student");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 py-3 sm:py-4">
      {/* Left - Greeting */}
      <div className="min-w-0 flex-1">
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground flex items-center">
          <span className="whitespace-nowrap mr-1">{t("dashboard.greeting")},</span>

          {/* Correção visual do nome longo (Truncate) */}
          <span
            className="truncate max-w-[150px] sm:max-w-[300px] md:max-w-[400px] inline-block align-bottom"
            title={userName}
          >
            {userName}
          </span>

          <span className="whitespace-nowrap ml-1">! 👋</span>
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm">{t("dashboard.welcomeBack")}</p>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
        <InstallButton variant="outline" size="sm" className="hidden sm:flex" />
        <StreakBadge />
        <SoundControl />
        <LanguageSelector />
        <Button
          variant="ghost"
          size="icon"
          onClick={onLogout}
          className="text-muted-foreground hover:text-foreground h-8 w-8 sm:h-9 sm:w-9"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </div>
    </header>
  );
};
