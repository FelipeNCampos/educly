import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Camera, Loader2, ArrowLeft, LogOut, Trophy, Settings,
  CreditCard, ChevronRight, Medal as MedalIcon,
  Star, Image as ImageIcon, Mail, User, Key,
  Bell, Eye, EyeOff, TrendingUp, CalendarDays,
  Award, FileText, Share2, Lock
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SoundControl } from "@/components/SoundControl";
import { MobileNav } from "@/components/MobileNav";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Trophy, Star
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

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileData {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  cover_url?: string;
  created_at: string;
}

interface Medal {
  id: string;
  name: string;
  icon_name?: string;
  color?: string;
  isEarned?: boolean;
}

interface UserLevelData {
  level: number;
  total_xp: number;
}

const Profile = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [userData, setUserData] = useState<ProfileData | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showEmail, setShowEmail] = useState(false);
  const [originalEmail, setOriginalEmail] = useState("");
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    lessons: true,
    promotions: false,
  });

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { data: coursesCount = 2 } = useQuery({
    queryKey: ["user-courses-count", userId],
    queryFn: async () => {
      if (!userId) return 2;
      return 2;
    },
    enabled: !!userId,
  });

  const { data: userLevelData } = useQuery({
    queryKey: ["user-level", userId],
    queryFn: async (): Promise<UserLevelData> => {
      if (!userId) return { level: 1, total_xp: 0 };

      try {
        const { data, error } = await supabase
            .from("user_levels")
            .select("current_level, total_xp_earned")
            .eq("user_id", userId)
            .maybeSingle();

        if (error) {
          console.error("Error fetching user level:", error);
          return { level: 1, total_xp: 0 };
        }

        const levelData = data as { current_level?: number; total_xp_earned?: number } | null;

        if (!levelData) {
          return { level: 1, total_xp: 0 };
        }

        return {
          level: Number(levelData.current_level) || 1,
          total_xp: Number(levelData.total_xp_earned) || 0
        };
      } catch (error) {
        console.error("Unexpected error in user level query:", error);
        return { level: 1, total_xp: 0 };
      }
    },
    enabled: !!userId,
  });

  const { data: medals = [] } = useQuery({
    queryKey: ["user-medals", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: userMedals } = await supabase
          .from("user_freelancer_medals")
          .select("medal_id, created_at")
          .eq("user_id", userId);

      if (!userMedals) return [];

      const { data: medalDetails } = await supabase
          .from("freelancer_medals")
          .select("id, name, icon_name, color")
          .in("id", userMedals.map(m => m.medal_id));

      if (!medalDetails) return [];

      return medalDetails.map(medal => ({
        ...medal,
        isEarned: true
      } as Medal));
    },
    enabled: !!userId,
  });

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema)
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error("Auth error:", userError);
          navigate("/auth");
          return;
        }

        if (!user) {
          navigate("/auth");
          return;
        }

        setUserId(user.id);
        setOriginalEmail(user.email || "");

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          const newProfile: ProfileData = {
            id: user.id,
            email: user.email,
            full_name: "",
            avatar_url: "",
            cover_url: "",
            created_at: new Date().toISOString()
          };

          setUserData(newProfile);
          setAvatarUrl("");
          setCoverUrl("");
          profileForm.setValue("full_name", "");
        } else if (profile) {
          const userProfile: ProfileData = {
            id: profile.id,
            email: user.email || "",
            full_name: profile.full_name || "",
            avatar_url: profile.avatar_url || "",
            cover_url: profile.cover_url || "",
            created_at: profile.created_at || new Date().toISOString()
          };

          setUserData(userProfile);
          setAvatarUrl(profile.avatar_url || "");
          setCoverUrl(profile.cover_url || "");
          profileForm.setValue("full_name", profile.full_name || "");
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
        toast({
          variant: "destructive",
          title: t('profile.error'),
          description: t('profile.errorLoadDesc')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [profileForm, navigate, toast, t]);

  const getDisplayEmail = () => {
    if (!originalEmail) return "...@....com";

    const [username, domain] = originalEmail.split("@");
    if (!username || !domain) return originalEmail;

    const maskedUsername = username.length > 3
        ? username.substring(0, 3) + "***"
        : username + "***";

    return `${maskedUsername}@${domain}`;
  };

  const getFullEmail = () => {
    return originalEmail;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
      } else {
        setUploadingCover(true);
      }

      const file = event.target.files?.[0];
      if (!file || !userId) return;

      const fileExt = file.name.split('.').pop();
      const filePath = `${userId}/${type}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, {
            upsert: true
          });

      if (uploadError) {
        toast({
          variant: "destructive",
          title: t('profile.uploadError'),
          description: uploadError.message
        });
        return;
      }

      const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);

      const updateField = type === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl };

      const { error: updateError } = await supabase
          .from("profiles")
          .update(updateField)
          .eq("id", userId);

      if (updateError) {
        toast({
          variant: "destructive",
          title: t('profile.saveError'),
          description: updateError.message
        });
        return;
      }

      if (type === 'avatar') {
        setAvatarUrl(publicUrl);
        setUserData(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
      } else {
        setCoverUrl(publicUrl);
        setUserData(prev => prev ? { ...prev, cover_url: publicUrl } : null);
      }

      toast({
        title: t('profile.success'),
        description: t('profile.imageSaved')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.unexpectedError')
      });
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSendResetEmail = async () => {
    try {
      setIsSendingEmail(true);
      const email = getFullEmail();
      if (!email) {
        toast({
          variant: "destructive",
          title: t('profile.error'),
          description: t('profile.emailNotFound')
        });
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });

      if (error) {
        toast({
          variant: "destructive",
          title: t('profile.sendError'),
          description: error.message
        });
        return;
      }

      toast({
        title: t('profile.emailSent'),
        description: t('profile.emailSentDesc', { email: getDisplayEmail() })
      });
      setIsPasswordOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('profile.sendError'),
        description: t('profile.unexpectedError')
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleShareProfile = async () => {
    try {
      if (!userId) return;
      await navigator.clipboard.writeText(`${window.location.origin}/profile/${userId}`);
      toast({
        title: t('profile.linkCopied'),
        description: t('profile.linkCopiedDesc')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('profile.error'),
        description: t('profile.copyError')
      });
    }
  };

  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!userId) return;

    try {
      const { error } = await supabase
          .from("profiles")
          .update({
            full_name: data.full_name,
          })
          .eq("id", userId);

      if (error) {
        toast({
          variant: "destructive",
          title: t('profile.saveError'),
          description: error.message
        });
        return;
      }

      setUserData(prev => prev ? {
        ...prev,
        full_name: data.full_name,
      } : null);

      toast({
        title: t('profile.updated'),
        description: t('profile.updatedDesc')
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('profile.saveError'),
        description: t('profile.updateError')
      });
    }
  };

  const handleSaveNotifications = () => {
    toast({
      title: t('profile.settingsSaved'),
      description: t('profile.notificationsUpdated')
    });
  };

  const currentLevel = userLevelData?.level || 1;
  const totalXP = userLevelData?.total_xp || 0;
  const progressPercent = Math.min(100, (totalXP % 1000) / 10);
  const currentXPInLevel = totalXP % 1000 || 0;
  const xpNeededForNext = 1000;
  const earnedCount = medals.length;

  if (loading) {
    return (
        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="animate-spin text-primary w-10 h-10" />
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-24">

        {/* Header */}
        <header className="sticky top-0 z-50 backdrop-blur-md border-b bg-background/80 px-4 h-16 flex items-center justify-between">
          <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {t('common.back')}
          </Button>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <User className="w-5 h-5" /> {t('profile.title')}
          </h1>
          <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate("/auth");
              }}
              className="text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN - SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">

            {/* Profile Card com bg-card */}
            <div className="card-3d-container">
              <div className="bg-card border relative overflow-hidden rounded-3xl shadow-sm">
                {/* Capa com imagem real */}
                <div
                    className="relative h-32 w-full group/cover bg-gradient-to-r from-primary/20 to-orange-500/20"
                    style={{
                      backgroundImage: coverUrl ? `url(${coverUrl})` : 'linear-gradient(to right, var(--primary)/20, rgb(249, 115, 22)/20)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 via-orange-500/20 to-transparent" />
                  <label className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 p-2 rounded-full cursor-pointer transition-all duration-200 opacity-0 group-hover/cover:opacity-100">
                    {uploadingCover ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                        <ImageIcon className="w-4 h-4 text-white" />
                    )}
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'cover')}
                    />
                  </label>
                </div>

                <div className="relative -mt-14 mb-3 flex justify-center">
                  <div className="relative group/avatar">
                    <Avatar className="h-28 w-28 shadow-2xl border-[6px] border-card transition-transform duration-300 group-hover/avatar:scale-105">
                      <AvatarImage src={avatarUrl} className="object-cover"/>
                      <AvatarFallback className="font-bold text-2xl bg-muted text-foreground">
                        {userData?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label className="absolute bottom-1 right-1 p-2 rounded-full shadow-lg cursor-pointer transition-all duration-200 bg-card border hover:bg-accent text-foreground hover:scale-105">
                      {uploadingAvatar ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                          <Camera className="w-4 h-4" />
                      )}
                      <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, 'avatar')}
                      />
                    </label>
                  </div>
                </div>

                <div className="px-6 pb-8 flex flex-col items-center">
                  <div className="text-center mb-2">
                    <h2 className="text-2xl font-bold text-foreground">
                      {userData?.full_name || t('profile.defaultName')}
                    </h2>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      <p className="text-primary font-medium text-sm">
                        @{userData?.full_name?.toLowerCase().replace(/\s/g, '') || "usuario"}
                      </p>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={handleShareProfile}
                      >
                        <Share2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 mb-6">
                    <Star className="w-3 h-3 mr-1 fill-primary" /> {t('profile.levelLabel', { level: currentLevel })}
                  </Badge>

                  <div className="w-full space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold text-muted-foreground">
                      <span>{t('profile.levelProgress')}</span>
                      <span className="text-primary">{Math.round(progressPercent)}%</span>
                    </div>
                    <Progress
                        value={progressPercent}
                        className="h-2.5 bg-muted [&>div]:bg-gradient-to-r from-primary to-orange-500"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      {currentXPInLevel} / {xpNeededForNext} XP • {totalXP} XP {t('profile.total')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mb-6">
                    <div className="p-4 rounded-2xl flex flex-col items-center justify-center bg-muted/50 backdrop-blur-sm">
                      <div className="text-2xl font-black text-foreground">{earnedCount}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t('profile.medals')}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl flex flex-col items-center justify-center bg-muted/50 backdrop-blur-sm">
                      <div className="text-2xl font-black text-foreground">{String(coursesCount).padStart(2, "0")}</div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t('profile.courses')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Financial Section */}
            <div>
              <h3 className="text-sm font-bold text-muted-foreground mb-4 px-2">
                {t('profile.securitySection')}
              </h3>
              <div className="space-y-3">

                {/* Alterar Senha - Com bg-card */}
                <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                  <DialogTrigger asChild>
                    <div className="card-3d-container group cursor-pointer">
                      <div className="bg-card border p-4 rounded-2xl flex justify-between items-center hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/10 transition-colors duration-200">
                            <Key className="w-5 h-5 text-foreground group-hover:text-primary transition-colors duration-200" />
                          </div>
                          <span className="font-bold text-foreground">{t('profile.changePassword')}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all duration-200" />
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="text-foreground">{t('profile.changePassword')}</DialogTitle>
                      <DialogDescription className="text-muted-foreground">
                        {t('profile.confirmResetDesc')}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="py-4 space-y-4 flex flex-col items-center text-center">
                      <div className="p-4 bg-blue-100 dark:bg-blue-500/10 rounded-full">
                        <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          {t('profile.linkSentTo')}
                        </p>
                        <p className="text-base font-bold text-foreground">
                          {getDisplayEmail()}
                        </p>
                      </div>
                    </div>

                    <DialogFooter className="pt-2">
                      <Button
                          type="button"
                          variant="ghost"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => setIsPasswordOpen(false)}
                      >
                        {t('common.cancel')}
                      </Button>
                      <Button
                          onClick={handleSendResetEmail}
                          disabled={isSendingEmail}
                          className="bg-primary hover:bg-primary/90 text-white"
                      >
                        {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('profile.sendEmail')}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Histórico de Cobrança - Com bg-card */}
                <div
                    className="card-3d-container group cursor-pointer"
                    onClick={() => navigate('/settings/billing')}
                >
                  <div className="bg-card border p-4 rounded-2xl flex justify-between items-center hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors duration-200">
                        <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-bold text-foreground">{t('profile.billingHistory')}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-6">
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="account" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Settings className="w-4 h-4 mr-2" />
                  {t('profile.tabAccount')}
                </TabsTrigger>
                <TabsTrigger value="achievements" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
                  <Trophy className="w-4 h-4 mr-2" />
                  {t('profile.tabAchievements')}
                </TabsTrigger>
                <TabsTrigger value="notifications" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                  <Bell className="w-4 h-4 mr-2" />
                  {t('profile.tabNotifications')}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="account" className="space-y-6">
                {/* Card principal com bg-card */}
                <Card className="p-8 rounded-3xl bg-card border text-card-foreground">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
                    <Settings className="w-5 h-5 text-primary" />
                    {t('profile.accountDetails')}
                  </h3>
                  <form onSubmit={profileForm.handleSubmit(handleSaveProfile)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold text-muted-foreground">
                            {t('profile.emailLabel')}
                          </label>
                          <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowEmail(!showEmail)}
                              className="h-6 px-2"
                          >
                            {showEmail ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                        <Input
                            value={showEmail ? getFullEmail() : getDisplayEmail()}
                            disabled
                            className="h-12 bg-muted/50 border-input text-foreground"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('profile.emailNote')}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-sm font-bold text-muted-foreground">
                          {t('profile.fullNameLabel')}
                        </label>
                        <Input
                            {...profileForm.register("full_name")}
                            className="h-12 bg-muted/50 border-input text-foreground focus:ring-primary focus:border-primary"
                            placeholder={t('profile.fullNamePlaceholder')}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="w-4 h-4" />
                        {t('profile.memberSince')}: {userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : "---"}
                      </div>
                      <Button
                          type="submit"
                          className="font-bold px-8 h-12 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white rounded-xl shadow-lg shadow-primary/20"
                      >
                        {t('profile.saveChanges')}
                      </Button>
                    </div>
                  </form>
                </Card>

                <Card className="p-6 rounded-3xl bg-card border text-card-foreground">
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-foreground">
                        {t("settings.quizSounds")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {t("settings.volume")}
                      </p>
                    </div>
                    <SoundControl />
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                {/* Card conquistas com bg-card */}
                <Card className="p-8 rounded-3xl bg-card border text-card-foreground">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-3 text-foreground mb-2">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        {t('profile.tabAchievements')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t('profile.medalsEarned', { count: earnedCount })}
                      </p>
                    </div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate("/medalhas")}
                        className="text-primary hover:text-primary/80 font-bold text-sm"
                    >
                      {t('profile.viewAll')}
                    </Button>
                  </div>
                  <TooltipProvider>
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
                      {medals.slice(0, 16).map((medal) => {
                        const IconComponent = iconMap[medal.icon_name || ''] || MedalIcon;
                        const colors = colorMap[medal.color || 'amber'] || colorMap.amber;
                        return (
                            <Tooltip key={medal.id}>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center group cursor-help">
                                  <div className={cn(
                                      "w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                      medal.isEarned
                                          ? cn(colors.bg, colors.border, "shadow-sm hover:scale-110 hover:shadow-lg")
                                          : "border-border grayscale opacity-30 bg-muted hover:opacity-50"
                                  )}>
                                    {medal.isEarned ? (
                                        <IconComponent className={cn("w-6 h-6 transition-transform duration-300 hover:scale-110", colors.icon)} />
                                    ) : (
                                        <Lock className="w-5 h-5 text-muted-foreground" />
                                    )}
                                  </div>
                                  <span className="text-xs mt-2 text-muted-foreground text-center font-medium truncate w-full">
                                {medal.isEarned ? medal.name.split(' ')[0] : '???'}
                              </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="font-bold text-sm bg-foreground text-background border-none shadow-lg">
                                <div className="space-y-1">
                                  <p>{medal.name}</p>
                                  {medal.isEarned && (
                                      <p className="text-xs text-muted font-normal">
                                        {t('profile.earned')}
                                      </p>
                                  )}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                        );
                      })}
                    </div>
                  </TooltipProvider>

                  <div className="mt-8 pt-6 border-t border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-foreground mb-1">{t('profile.yourProgress')}</h4>
                        <p className="text-sm text-muted-foreground">
                          {t('profile.progressMotto')}
                        </p>
                      </div>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {t('profile.inProgress')}
                      </Badge>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                {/* Card notificações com bg-card */}
                <Card className="p-8 rounded-3xl bg-card border text-card-foreground">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-3 text-foreground">
                    <Bell className="w-5 h-5 text-blue-500" />
                    {t('profile.notificationSettings')}
                  </h3>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-foreground">{t('profile.notifEmail')}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.notifEmailDesc')}
                          </p>
                        </div>
                        <Switch
                            checked={notifications.email}
                            onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-foreground">{t('profile.notifPush')}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.notifPushDesc')}
                          </p>
                        </div>
                        <Switch
                            checked={notifications.push}
                            onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-foreground">{t('profile.notifLessons')}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.notifLessonsDesc')}
                          </p>
                        </div>
                        <Switch
                            checked={notifications.lessons}
                            onCheckedChange={(checked) => setNotifications({...notifications, lessons: checked})}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-bold text-foreground">{t('profile.notifPromos')}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t('profile.notifPromosDesc')}
                          </p>
                        </div>
                        <Switch
                            checked={notifications.promotions}
                            onCheckedChange={(checked) => setNotifications({...notifications, promotions: checked})}
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <Button
                          onClick={handleSaveNotifications}
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                      >
                        {t('profile.savePreferences')}
                      </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Payment Statement Card com bg-card */}
            <Card className="p-8 rounded-3xl bg-card border text-card-foreground">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold flex items-center gap-3 text-foreground">
                  <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                  {t('profile.paymentStatement')}
                </h3>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 border-emerald-500/20">
                  <Award className="w-3 h-3 mr-1" />
                  {t('profile.statusActive')}
                </Badge>
              </div>

              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t('profile.noPayments')}
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  {t('profile.noPaymentsDesc')}
                </p>
                <div className="flex gap-3">
                  <Button
                      onClick={() => navigate('/settings/billing')}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {t('profile.manageSubscription')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </main>
        <MobileNav />
      </div>
  );
};
export default Profile;