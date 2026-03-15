import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Mail, Lock, ArrowLeft, User, Eye, EyeOff, KeyRound } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { LanguageSelector } from "@/components/LanguageSelector";

// 1. Importações do Dialog para o modal de recuperação
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Password Visibility States
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 2. Novos estados para Recuperação de Senha
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetLoading, setIsResetLoading] = useState(false);

  const defaultTab = searchParams.get("tab") === "signup" ? "signup" : "login";

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkUser();
  }, [navigate]);

  // 3. Função para disparar o e-mail de recuperação
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({
        title: t("common.error"),
        description: t("auth.emailRequired", "Por favor, digite seu e-mail."),
        variant: "destructive",
      });
      return;
    }

    setIsResetLoading(true);

    try {
      // Use custom Edge Function to send password reset via SMTP (no-reply@educly.app)
      const { error } = await supabase.functions.invoke("send-password-reset", {
        body: { email: resetEmail },
      });

      if (error) throw error;

      toast({
        title: t("auth.emailSent", "E-mail enviado!"),
        description: t("auth.checkEmailReset", "Verifique sua caixa de entrada para redefinir a senha."),
      });
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error: any) {
      toast({
        title: t("auth.error"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (!rememberMe) {
      localStorage.setItem("clearSessionOnLogout", "true");
    } else {
      localStorage.removeItem("clearSessionOnLogout");
    }

    if (error) {
      toast({
        title: t("auth.loginError"),
        description: error.message === "Invalid login credentials" ? t("auth.passwordMismatch") : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t("auth.loginSuccess"),
        description: t("dashboard.title"),
      });
      navigate("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast({
        title: t("auth.signupError"),
        description: t("auth.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: t("auth.loginError"),
        description: t("auth.passwordMismatch"),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t("auth.loginError"),
        description: t("auth.passwordTooShort"),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      setIsLoading(false);
      toast({
        title: t("auth.signupError"),
        description: error.message === "User already registered" ? t("auth.signupError") : error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.user) {
      const currentLanguage = i18n.language || "en";
      
      // Update preferred language
      try {
        await supabase.from("profiles").update({ preferred_language: currentLanguage }).eq("id", data.user.id);
      } catch (langErr) {
        console.error("Error updating language preference:", langErr);
      }

      // Process pending billing events (reconciliation for users who paid before registering)
      try {
        const { error: rpcError } = await supabase.rpc("process_pending_billing_events", {
          p_user_id: data.user.id,
          p_email: email,
        });
        
        if (rpcError) {
          console.error("Error processing billing events:", rpcError);
        } else {
          console.log("Billing events reconciliation completed for:", email);
        }
      } catch (rpcErr) {
        console.error("Exception in billing reconciliation:", rpcErr);
      }

      // Send welcome email
      try {
        const { error: emailError } = await supabase.functions.invoke("send-welcome-email", {
          body: {
            email: email,
            userName: fullName.trim(),
            language: currentLanguage,
          },
        });
        if (emailError) {
          console.error("Error sending welcome email:", emailError);
        }
      } catch (emailErr) {
        console.error("Error calling send-welcome-email:", emailErr);
      }

      setIsLoading(false);

      toast({
        title: t("auth.signupSuccess"),
        description: t("common.loading"),
      });

      navigate("/dashboard", { replace: true });
      return;
    }

    setIsLoading(false);

    toast({
      title: t("auth.signupSuccess"),
      description: t("common.loading"),
    });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background safe-area-inset">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 pt-safe">
        <LanguageSelector />
      </div>

      <div className="w-full max-w-md space-y-4 sm:space-y-6 animate-fade-in-up">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t("common.back")}
        </Button>

        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">{t("auth.title")}</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            {t("thankYou.title")} <span className="text-primary">{t("landing.subtitle")}</span>
          </h1>
          <p className="text-muted-foreground">{t("auth.title")}</p>
        </div>

        <Card className="p-6 shadow-card border border-border">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-surface">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.loginTab")}
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t("auth.signupTab")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4 mt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  {/* 4. MODIFICAÇÃO: Flex container para Label e Link de Esqueci a Senha */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                      {t("auth.password")}
                    </Label>
                    <Button
                      variant="link"
                      size="sm"
                      className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                      onClick={() => {
                        setResetEmail(email); // Preenche automaticamente se o usuário já digitou o email
                        setIsResetDialogOpen(true);
                      }}
                      type="button"
                    >
                      {t("auth.forgotPassword", "Esqueceu a senha?")}
                    </Button>
                  </div>

                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal text-muted-foreground cursor-pointer">
                    {t("auth.rememberMe", "Mantenha conectado")}
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("common.loading") : t("auth.loginButton")}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4 mt-4">
              <form onSubmit={handleSignup} className="space-y-4">
                {/* ... (Código de Signup permanece igual) ... */}
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {t("auth.fullName")}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t("auth.fullNamePlaceholder")}
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    {t("auth.confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-confirm"
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
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t("common.loading") : t("auth.signupButton")}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <p className="text-center text-sm text-muted-foreground">{t("landing.description")}</p>
      </div>

      {/* 5. Componente do Modal de Recuperação de Senha */}
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("auth.resetPasswordTitle", "Recuperar Senha")}</DialogTitle>
            <DialogDescription>
              {t("auth.resetPasswordDesc", "Digite seu e-mail abaixo e enviaremos um link para redefinir sua senha.")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {t("auth.email")}
              </Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="nome@exemplo.com"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button type="button" variant="outline" onClick={() => setIsResetDialogOpen(false)}>
                {t("common.cancel", "Cancelar")}
              </Button>
              <Button type="submit" disabled={isResetLoading}>
                {isResetLoading ? (
                  t("common.sending", "Enviando...")
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 mr-2" />
                    {t("auth.sendResetLink", "Enviar Link")}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
