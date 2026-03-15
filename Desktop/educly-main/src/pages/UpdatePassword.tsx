import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, KeyRound, CheckCircle2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

const UpdatePassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Form States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password Visibility States
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    const handlePasswordRecovery = async () => {
      try {
        // First, check if there's a hash fragment with tokens (from email link)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('UpdatePassword: Checking for recovery tokens...', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        // If we have tokens in the URL hash, set the session manually
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('UpdatePassword: Found recovery tokens, setting session...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('UpdatePassword: Error setting session:', error);
            if (mounted) {
              setIsValidSession(false);
              setIsCheckingSession(false);
            }
            return;
          }

          if (data.session && mounted) {
            console.log('UpdatePassword: Session set successfully');
            setIsValidSession(true);
            setIsCheckingSession(false);
            // Clear the hash from URL for cleaner look
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }
        }

        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && mounted) {
          console.log('UpdatePassword: Existing session found');
          setIsValidSession(true);
          setIsCheckingSession(false);
          return;
        }

        // No session and no tokens - invalid
        if (mounted) {
          console.log('UpdatePassword: No valid session or tokens found');
          setIsValidSession(false);
          setIsCheckingSession(false);
        }
      } catch (error) {
        console.error('UpdatePassword: Error during session check:', error);
        if (mounted) {
          setIsValidSession(false);
          setIsCheckingSession(false);
        }
      }
    };

    // Listen for auth state changes (password recovery event)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('UpdatePassword: Auth state changed:', event);
      
      if (event === "PASSWORD_RECOVERY" && mounted) {
        console.log('UpdatePassword: PASSWORD_RECOVERY event received');
        setIsValidSession(true);
        setIsCheckingSession(false);
      } else if (event === "SIGNED_IN" && session && mounted) {
        console.log('UpdatePassword: SIGNED_IN event received');
        setIsValidSession(true);
        setIsCheckingSession(false);
      }
    });

    // Small delay to allow auth state change to fire first
    const timer = setTimeout(() => {
      handlePasswordRecovery();
    }, 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: t("auth.error"),
        description: t("auth.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: t("auth.passwordUpdated", "Senha atualizada!"),
        description: t("auth.passwordUpdatedDesc", "Sua senha foi alterada com sucesso."),
      });

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error: any) {
      console.error('UpdatePassword: Error updating password:', error);
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking session
  if (isCheckingSession || isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="animate-pulse text-muted-foreground flex flex-col items-center gap-2">
          <KeyRound className="w-8 h-8 animate-spin" />
          {t("common.loading")}
        </div>
      </div>
    );
  }

  // Invalid session - no access
  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background safe-area-inset">
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 pt-safe">
          <LanguageSelector />
        </div>

        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {t("auth.invalidResetLink", "Link inválido ou expirado")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.invalidResetLinkDesc", "O link de recuperação de senha expirou ou é inválido. Por favor, solicite um novo link.")}
          </p>
          <Button onClick={() => navigate("/auth")} className="w-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("auth.backToLogin", "Voltar para o login")}
          </Button>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background safe-area-inset">
        <Card className="w-full max-w-md p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            {t("auth.passwordUpdated", "Senha atualizada!")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.redirectingDashboard", "Redirecionando para o dashboard...")}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background safe-area-inset">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 pt-safe">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-fade-in-up">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <KeyRound className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {t("auth.resetPasswordTitle", "Recuperar Senha")}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("auth.createNewPassword", "Crie sua nova senha")}
          </h1>
          <p className="text-muted-foreground">
            {t("auth.createNewPasswordDesc", "Digite sua nova senha abaixo.")}
          </p>
        </div>

        <Card className="p-6 shadow-card border border-border">
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                {t("auth.newPassword", "Nova senha")}
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder={t("auth.passwordPlaceholder")}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                {t("auth.confirmPassword")}
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("auth.confirmPasswordPlaceholder")}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {t("auth.passwordMinLength", "Mínimo de 6 caracteres")}
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("common.loading") : t("auth.updatePasswordButton", "Atualizar senha")}
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          <Button variant="link" onClick={() => navigate("/auth")} className="p-0 h-auto">
            <ArrowLeft className="w-3 h-3 mr-1" />
            {t("auth.backToLogin", "Voltar para o login")}
          </Button>
        </p>
      </div>
    </div>
  );
};

export default UpdatePassword;