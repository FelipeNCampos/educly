import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  Camera,
  Loader2,
  ArrowLeft,
  LogOut,
  Trophy,
  Target,
  Flame,
  Settings,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Lock,
  Medal as MedalIcon,
  Calendar,
  Footprints,
  Compass,
  Crown,
  Zap,
  Rocket,
  Timer,
  CheckCircle,
  MessageSquare,
  Bot,
  Sparkles,
  Sunrise,
  Moon,
  Star,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useAllMedals } from "@/hooks/useAllMedals";
import { useUserLevel } from "@/hooks/useUserLevel";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";

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

const colorMap: Record<string, { bg: string; border: string; icon: string }> = {
  emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-500" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-500/20", icon: "text-purple-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-500" },
  orange: { bg: "bg-orange-500/10", border: "border-orange-500/20", icon: "text-orange-500" },
  yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "text-yellow-500" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-500" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/20", icon: "text-cyan-500" },
  green: { bg: "bg-green-500/10", border: "border-green-500/20", icon: "text-green-500" },
};

const profileSchema = z.object({
  full_name: z.string().min(2, "Nome muito curto"),
});

const Profile = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { getMedalsWithStatus, earnedCount } = useAllMedals();
  const medalsWithStatus = getMedalsWithStatus();
  const { currentLevel, progressPercent, totalXP, currentXPInLevel, xpNeededForNext } = useUserLevel();

  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  const { data: coursesCount = 0 } = useQuery({
    queryKey: ["user-courses-count", userId],
    queryFn: async () => {
      const { count } = await supabase
        .from("user_challenge_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      return count || 0;
    },
    enabled: !!userId,
  });

  const { register, handleSubmit, setValue } = useForm({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
          if (profile) {
            setUserData({ ...profile, email: user.email });
            setAvatarUrl(profile.avatar_url || "");
            setCoverUrl((profile as any).cover_url || "");
            setValue("full_name", profile.full_name || "");
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [setValue]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    try {
      type === "avatar" ? setUploadingAvatar(true) : setUploadingCover(true);
      const file = event.target.files?.[0];
      if (!file) return;
      const filePath = `${userId}/${type}-${Math.random()}.${file.name.split(".").pop()}`;
      await supabase.storage.from("avatars").upload(filePath, file);
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      await supabase
        .from("profiles")
        .update(type === "avatar" ? { avatar_url: publicUrl } : { cover_url: publicUrl })
        .eq("id", userId);
      type === "avatar" ? setAvatarUrl(publicUrl) : setCoverUrl(publicUrl);
      toast({ title: "Sucesso!", description: "Imagem salva com sucesso." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Erro", description: e.message });
    } finally {
      type === "avatar" ? setUploadingAvatar(false) : setUploadingCover(false);
    }
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-10 h-10" />
      </div>
    );

  return (
    <div className="min-h-screen bg-muted/40 text-foreground font-sans transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-4 h-16 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)} className="font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t("common.back", "Voltar")}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => supabase.auth.signOut().then(() => navigate("/auth"))}
          className="hover:text-destructive"
        >
          <LogOut className="w-5 h-5" />
        </Button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN - SIDEBAR */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Card */}
          <Card className="p-0 rounded-3xl border-border bg-card overflow-hidden relative text-center pb-8 shadow-sm">
            <div className="relative h-32 w-full bg-muted group/cover">
              {coverUrl ? (
                <img src={coverUrl} className="w-full h-full object-cover" alt="Capa" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600" />
              )}
              <label className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 p-2 rounded-full cursor-pointer transition-all opacity-0 group-hover/cover:opacity-100">
                {uploadingCover ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-white" />
                )}
                <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "cover")} />
              </label>
            </div>

            <div className="relative -mt-14 mb-3 flex justify-center">
              <div className="relative">
                <Avatar className="h-28 w-28 border-[5px] border-card shadow-lg">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="font-bold text-2xl bg-muted">
                    {userData?.full_name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-1 right-1 bg-card p-2 rounded-full shadow-md cursor-pointer border border-border hover:bg-muted transition-colors text-foreground">
                  {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                  <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, "avatar")} />
                </label>
              </div>
            </div>

            <div className="px-6 flex flex-col items-center">
              <h2 className="text-2xl font-bold text-foreground">
                {userData?.full_name || t("profile.student", "Estudante")}
              </h2>
              <p className="text-emerald-500 font-medium text-sm mb-3">
                @{userData?.full_name?.toLowerCase().replace(/\s/g, "") || "usuario"}
              </p>

              <div className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-6 flex items-center gap-1 border border-orange-500/20">
                <Star className="w-3 h-3 fill-orange-600" /> Aprendiz
              </div>

              <div className="w-full space-y-2 text-left mb-6">
                <div className="flex justify-between text-[10px] font-black uppercase text-muted-foreground tracking-wider">
                  <span>
                    {t("profile.level", "Nível")} {currentLevel}
                  </span>
                  <span className="text-orange-500">
                    {Math.round(progressPercent)}% PARA O NV. {currentLevel + 1}
                  </span>
                </div>
                <Progress value={progressPercent} className="h-3 bg-muted [&>div]:bg-orange-500" />
                <p className="text-[10px] text-muted-foreground text-center font-medium mt-2">
                  {currentXPInLevel} / {xpNeededForNext} XP • {totalXP} XP total
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-foreground">{earnedCount}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("profile.medals", "Medalhas")}
                  </div>
                </div>
                <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col items-center justify-center">
                  <div className="text-2xl font-black text-foreground">{String(coursesCount).padStart(2, "0")}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("profile.courses", "Cursos")}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Security & Financial Section (SIDEBAR) */}
          <div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-4 tracking-wider px-2">
              Segurança & Financeiro
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 flex justify-between items-center bg-card border-border hover:bg-accent hover:text-accent-foreground rounded-2xl shadow-sm group transition-all"
                onClick={() => navigate("/settings/password")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-muted rounded-xl group-hover:bg-background group-hover:shadow-sm transition-all">
                    <ShieldCheck className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="font-bold text-foreground">Alterar Senha</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>

              <Button
                variant="outline"
                className="w-full h-auto py-4 px-4 flex justify-between items-center bg-card border-border hover:bg-accent hover:text-accent-foreground rounded-2xl shadow-sm group transition-all"
                onClick={() => navigate("/settings/billing")}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-xl group-hover:bg-background group-hover:shadow-sm transition-all">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="font-bold text-foreground">Histórico de Cobrança</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          {/* Account Details Card */}
          <Card className="p-8 rounded-3xl border-border bg-card shadow-sm">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-foreground">
              <Settings className="w-5 h-5 text-orange-500" /> {t("profile.accountDetails", "Detalhes da Conta")}
            </h3>
            <form
              onSubmit={handleSubmit(async (data) => {
                await supabase.from("profiles").update({ full_name: data.full_name }).eq("id", userId);
                toast({ title: t("profile.updateSuccess", "Perfil atualizado!") });
              })}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("profile.email", "E-mail")}
                  </label>
                  <Input
                    value={userData?.email}
                    disabled
                    className="bg-muted border-border h-11 font-medium text-muted-foreground"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    {t("profile.fullName", "Nome Completo")}
                  </label>
                  <Input
                    {...register("full_name")}
                    className="bg-background border-border h-11 font-medium focus:ring-orange-500 focus:border-orange-500 text-foreground"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  className="font-bold px-8 h-11 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20"
                >
                  {t("profile.saveChanges", "Salvar Alterações")}
                </Button>
              </div>
            </form>
          </Card>

          {/* Achievements Card */}
          <Card className="p-8 rounded-3xl border-border bg-card shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <Trophy className="w-5 h-5 text-yellow-500" /> {t("profile.achievements", "Conquistas")}
              </h3>
              <Button
                variant="ghost"
                onClick={() => navigate("/medalhas")}
                className="text-orange-500 hover:text-orange-600 hover:bg-orange-500/10 font-bold text-sm"
              >
                {t("profile.viewAll", "Ver todas")}
              </Button>
            </div>
            <TooltipProvider delayDuration={0}>
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-4">
                {medalsWithStatus.slice(0, 16).map((medal) => {
                  const IconComponent = iconMap[medal.icon_name] || MedalIcon;
                  const colors = colorMap[medal.color] || colorMap.amber;
                  return (
                    <Tooltip key={medal.id}>
                      <TooltipTrigger asChild>
                        <div className="flex flex-col items-center group cursor-help">
                          <div
                            className={cn(
                              "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                              medal.isEarned
                                ? cn(colors.bg, colors.border, "shadow-sm group-hover:scale-110")
                                : "bg-muted border-border grayscale opacity-40",
                            )}
                          >
                            {medal.isEarned ? (
                              <IconComponent className={cn("w-5 h-5", colors.icon)} />
                            ) : (
                              <Lock className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="font-bold text-xs bg-foreground text-background border-none">
                        {medal.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </Card>

          {/* NEW: Payment Statement Card */}
          <Card className="p-8 rounded-3xl border-border bg-card shadow-sm min-h-[200px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                <CreditCard className="w-5 h-5 text-blue-600" /> Extrato de Pagamento
              </h3>
              <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide border border-emerald-500/20">
                Ativo
              </span>
            </div>

            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm font-medium text-muted-foreground">Nenhum pagamento encontrado.</p>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
