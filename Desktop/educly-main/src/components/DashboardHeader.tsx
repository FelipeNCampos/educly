import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StreakBadge } from "@/components/StreakBadge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { SoundControl } from "@/components/SoundControl";
import { ModeToggle } from "@/components/ModeToggle";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardHeaderProps {
  onLogout: () => void;
}

export const DashboardHeader = ({ onLogout }: DashboardHeaderProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      return {
        fullName: data?.full_name || user.email?.split("@")[0] || t("dashboard.student"),
        avatarUrl: data?.avatar_url
      };
    },
  });

  const userName = profile?.fullName || t("dashboard.student");

  return (
    <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
      <div className="min-w-0 flex-1">
        <h1 className="text-xl font-bold flex items-center">
          <span className="whitespace-nowrap mr-1">{t("dashboard.greeting")},</span>
          <span className="truncate max-w-[200px] text-foreground">{userName}</span>
          <span className="ml-1">! 👋</span>
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <StreakBadge />
        <SoundControl />
        <ModeToggle />
        <LanguageSelector />
        
        <button 
          onClick={() => navigate("/profile")}
          className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm hover:border-orange-500 transition-all"
        >
          <Avatar className="h-full w-full">
            <AvatarImage src={profile?.avatarUrl || `https://img.freepik.com/vetores-premium/ilustracao-sem-rosto-avatar_573563-12088.jpg?semt=ais_hybrid&w=740&q=80`} />
            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold">
              {userName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>

        <Button variant="ghost" size="icon" onClick={onLogout} className="text-muted-foreground">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};
