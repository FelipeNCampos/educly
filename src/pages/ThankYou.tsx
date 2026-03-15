import React, { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import confetti from "canvas-confetti";
import { LanguageSelectionModal } from "@/components/LanguageSelectionModal";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import i18n from "i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Heart, CheckCircle2, Sparkles, PlayCircle,
  Brain, Briefcase, Laptop, Mail, Lock, User, Eye, EyeOff
} from "lucide-react";

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Benefit {
  icon: React.ElementType;
  title: string;
  desc: string;
  color: string;
  lightColor: string;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
  time: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

// ==========================================
// CUSTOM HOOKS
// ==========================================

const useMousePosition = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return position;
};

// ==========================================
// SUB-COMPONENTS
// ==========================================

const CinematicRobotsAndRockets = () => {
  const stations = [
    { id: 1, posClass: 'top-[15%] left-[6%]', animDelay: '0s', animClass: 'animate-rocket-1' },
    { id: 2, posClass: 'top-[35%] right-[8%]', animDelay: '2s', animClass: 'animate-rocket-2' },
    { id: 3, posClass: 'top-[75%] left-[82%]', animDelay: '4.5s', animClass: 'animate-rocket-3' },
  ];

  return (
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden pointer-events-none z-30">
        {stations.map((station) => (
            <div
                key={station.id}
                className={`absolute ${station.posClass} flex flex-col items-center justify-center animate-robot-float`}
                style={{ willChange: 'transform' }}
            >
              <div className="relative">
                <div
                    className={`absolute left-1/2 z-10 ${station.animClass}`}
                    style={{
                      animationDelay: station.animDelay,
                      animationFillMode: 'both',
                      marginLeft: '-2.5rem',
                      willChange: 'transform, opacity'
                    }}
                >
                </div>

                <span className="text-[4rem] sm:text-[6rem] block leading-none opacity-40 drop-shadow-xl z-0">
              🤖
            </span>
              </div>
            </div>
        ))}
      </div>
  );
};

const AmbientBackground = ({ mousePosition }: { mousePosition: { x: number, y: number } }) => {
  return (
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
            className="absolute top-[-20%] left-[20%] w-[1000px] h-[1000px] bg-gradient-to-br from-orange-200/40 via-orange-100/20 to-transparent rounded-full blur-[120px] transition-transform duration-1000 ease-out mix-blend-multiply"
            style={{ transform: `translate3d(${mousePosition.x * -30}px, ${mousePosition.y * -30}px, 0)` }}
        />
        <div
            className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-gradient-to-tl from-rose-200/40 via-pink-100/20 to-transparent rounded-full blur-[100px] transition-transform duration-1000 ease-out mix-blend-multiply"
            style={{ transform: `translate3d(${mousePosition.x * 40}px, ${mousePosition.y * 40}px, 0)` }}
        />
        <div
            className="absolute top-[40%] left-[-10%] w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-[90px] transition-transform duration-1000 ease-out mix-blend-multiply"
            style={{ transform: `translate3d(${mousePosition.x * 20}px, ${mousePosition.y * -20}px, 0)` }}
        />

        <div
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `
            linear-gradient(to right, #000 1px, transparent 1px),
            linear-gradient(to bottom, #000 1px, transparent 1px)
          `,
              backgroundSize: '40px 40px'
            }}
        />
      </div>
  );
};

const TiltCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({});

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const rotateX = (0.5 - y) * 15;
    const rotateY = (x - 0.5) * 15;

    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.1s ease-out'
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  }, []);

  return (
      <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className={`relative rounded-3xl bg-white border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(249,115,22,0.07)] hover:border-orange-100 z-10 ${className}`}
          style={style}
      >
        {children}
      </div>
  );
};
// ==========================================
// MAIN COMPONENT
// ==========================================

const ThankYou = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const { toast } = useToast();
  const mousePosition = useMousePosition();
  const [isReady, setIsReady] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNoPurchaseDialogOpen, setIsNoPurchaseDialogOpen] = useState(false);
  const [skipNoPurchaseCheck, setSkipNoPurchaseCheck] = useState(false);
  const isPurchaseFlow = Boolean(searchParams.get("email"));
  const supportEmail = "contact@educly.app";
  const noPurchaseDescription = t(
    "auth.noPurchaseDescription",
    "Nao localizamos uma compra vinculada a este e-mail. Verifique se voce informou o mesmo e-mail usado na compra. Se ainda nao comprou, acesse o link abaixo."
  );
  const noPurchaseLines = noPurchaseDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  useEffect(() => {
    setTimeout(() => setIsReady(true), 100);
    // Confetes apenas na inicialização
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.5 },
      colors: ['#f97316', '#fbbf24', '#fb7185', '#fdba74', '#ffffff'],
      disableForReducedMotion: true,
      zIndex: 100
    });
  }, []);

  const performSignup = async () => {
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
      const currentLanguage = navigator.language || i18n.language || "en";

      try {
        await supabase.from("profiles").update({ preferred_language: currentLanguage }).eq("id", data.user.id);
      } catch (langErr) {
        console.error("Error updating language preference:", langErr);
      }

      try {
        const { error: rpcError } = await supabase.rpc("process_pending_billing_events", {
          p_user_id: data.user.id,
          p_email: email,
        });

        if (rpcError) {
          console.error("Error processing billing events:", rpcError);
        }
      } catch (rpcErr) {
        console.error("Exception in billing reconciliation:", rpcErr);
      }

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
    navigate("/dashboard", { replace: true });
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

    if (isPurchaseFlow && email !== confirmEmail) {
      toast({
        title: t("auth.signupError", "Erro no cadastro"),
        description: t("auth.emailMismatch", "Os e-mails digitados não coincidem."),
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

    if (!skipNoPurchaseCheck) {
      try {
        const { data: hasPurchase, error: purchaseError } = await supabase
          .rpc("check_purchase_exists", { p_email: email });

        if (purchaseError) {
          console.error("Error checking purchase status:", purchaseError);
        }

        if (!purchaseError && hasPurchase === false) {
          setIsLoading(false);
          setIsNoPurchaseDialogOpen(true);
          return;
        }
      } catch (purchaseErr) {
        console.error("Exception checking purchase status:", purchaseErr);
      }
    }

    await performSignup();
  };

  const handleContinueSignup = async () => {
    setIsNoPurchaseDialogOpen(false);
    setSkipNoPurchaseCheck(true);
    setIsLoading(true);
    await performSignup();
  };

  return (
      <div className="min-h-screen relative overflow-hidden flex flex-col font-sans selection:bg-orange-200 selection:text-orange-900 bg-[#fafafc]">
        <LanguageSelectionModal />

        {/* CENA DO TOPO */}
        <CinematicRobotsAndRockets />

        <AmbientBackground mousePosition={mousePosition} />

        <main className="relative z-10 flex-grow flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">

          <div className={`flex flex-col items-center transition-all duration-1000 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center gap-2 mb-10 px-5 py-2.5 rounded-full bg-green-50/80 backdrop-blur-sm border border-green-200/60 shadow-sm shadow-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-500 animate-[spin_3s_linear_infinite]" style={{ animationIterationCount: 1, animationDuration: '0.6s' }} />
              <span className="text-sm font-medium text-green-700 tracking-wide uppercase">
              {t('thankYou.registrationSuccess', 'Inscrição Confirmada')}
            </span>
            </div>

            <div className="relative mb-12 group cursor-pointer">
              <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-[40px] transform scale-150 animate-pulse group-hover:scale-175 transition-transform duration-500" />
              <div className="relative w-28 h-28 rounded-[2rem] bg-white shadow-2xl shadow-orange-500/10 flex items-center justify-center border border-orange-50/50 transform rotate-3 group-hover:rotate-0 transition-all duration-500 hover:scale-110">
                <Heart className="w-14 h-14 text-orange-500 fill-orange-500 drop-shadow-md group-hover:animate-ping" />
                <Sparkles className="absolute -top-4 -right-4 w-8 h-8 text-amber-400 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          <div className={`text-center space-y-6 mb-16 max-w-4xl transition-all duration-1000 delay-200 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-semibold text-slate-800 tracking-tight leading-[1.1]">
              Sua jornada como <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-orange-400 animate-gradient-x">
              Especialista em IA começa aqui
            </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-500 font-light leading-relaxed px-4 max-w-3xl mx-auto">
              Estamos incrivelmente felizes em ter você aqui. Preparamos o melhor ambiente para o seu crescimento: domine as ferramentas certas e conquiste o mercado freelancer nos próximos 28 dias.
            </p>
          </div>

          {/* CADASTRO DIRETO */}
          <div className={`mb-32 w-full max-w-md mx-auto relative group transition-all duration-1000 delay-300 transform ${isReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-rose-500 rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />

            <div className="bg-white/80 backdrop-blur-xl border border-white/50 p-6 rounded-3xl shadow-xl space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-semibold text-slate-800">
                  {t("thankYou.createAccountTitle", "Crie seu cadastro")}
                </h3>
                <p className="text-sm text-slate-500">
                  {t("thankYou.createAccountDesc", "Informe seus dados para liberar o acesso agora mesmo.")}
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2 text-sm text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    {t("auth.fullName")}
                  </Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={t("auth.fullNamePlaceholder")}
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    required
                    readOnly={isPurchaseFlow}
                    className={`h-11 border-slate-200 focus:border-orange-500 ${isPurchaseFlow ? "bg-slate-100 cursor-not-allowed opacity-80" : "bg-white"}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {isPurchaseFlow && (
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-email" className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400" />
                      {t("auth.confirmEmail", "Confirme seu e-mail")}
                    </Label>
                    <Input
                      id="signup-confirm-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder", "Digite seu e-mail novamente")}
                      required
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-orange-500"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 text-slate-400" />
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-orange-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-confirm" className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4 text-slate-400" />
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
                      className="h-11 bg-white border-slate-200 focus:border-orange-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-slate-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-slate-400" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 text-base font-semibold rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/20 transition-all duration-300"
                >
                  {isLoading ? t("common.loading") : t("thankYou.createAccountButton", "Criar cadastro e acessar")}
                </Button>
              </form>
            </div>
          </div>
    
        </main>

        <Dialog open={isNoPurchaseDialogOpen} onOpenChange={setIsNoPurchaseDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div style={{ height: "15px", width: "100%" }}></div>
              <DialogTitle className="text-base font-semibold leading-snug">
                {t("auth.noPurchaseTitle", "Compra nao identificada")}
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                <ol className="mt-2 space-y-4">
                  {noPurchaseLines.map((line, index) => {
                    const isLast = index === noPurchaseLines.length - 1;
                    const isBreak = index === noPurchaseLines.length - 2;

                    return (
                      <li key={index} className="relative pl-8">
                        <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary">
                          {index + 1}
                        </span>
                        {!isLast && (
                          <span
                            className={`absolute left-3 top-7 h-full w-px ${
                              isBreak
                                ? "border-l-2 border-dashed border-muted-foreground/40"
                                : "border-l-2 border-solid border-muted-foreground/25"
                            }`}
                          />
                        )}
                        {isBreak && (
                          <span className="absolute left-2.5 top-[2.25rem] h-2 w-2 rounded-full border border-muted-foreground/40 bg-background" />
                        )}
                        <p className="text-sm text-muted-foreground">
                          {line.includes(supportEmail) ? (
                            <>
                              {line.split(supportEmail)[0]}
                              <a
                                href={`mailto:${supportEmail}`}
                                className="text-primary underline underline-offset-4"
                              >
                                {supportEmail}
                              </a>
                              {line.split(supportEmail)[1] ?? ""}
                            </>
                          ) : (
                            line
                          )}
                        </p>
                      </li>
                    );
                  })}
                </ol>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleContinueSignup}
                className="w-full"
              >
                {t("auth.noPurchaseContinue", "Continuar cadastro")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <style>{`
        @keyframes shimmer {
          100% { transform: translate3d(100%, 0, 0); }
        }
        @keyframes gradient-x {
          0%, 100% { background-size: 200% 200%; background-position: left center; }
          50% { background-size: 200% 200%; background-position: right center; }
        }
        .animate-gradient-x {
          animation: gradient-x 6s ease infinite;
        }

        /* Robô flutuando com Aceleração de Hardware */
        @keyframes robot-float {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -10px, 0); }
        }
        .animate-robot-float {
          animation: robot-float 5s ease-in-out infinite;
        }

        /* -------------------------------------------------------------
           FOGUETE 1: O Clássico (Pouso inclinado padrão à esquerda)
           ------------------------------------------------------------- */
        @keyframes rocket-1 {
          0%, 3% { transform: translate3d(-150vw, 30vh, 0) scale(3.5) rotate(45deg); opacity: 0; }
          4% { opacity: 1; }
          12% { transform: translate3d(150vw, 5vh, 0) scale(3.5) rotate(45deg); opacity: 1; }
          13% { opacity: 0; } 
          19% { transform: translate3d(50vw, -120vh, 0) scale(1.5) rotate(-135deg); opacity: 0; }
          20% { opacity: 1; } 
          25% { transform: translate3d(0, -200px, 0) scale(1.2) rotate(-135deg); }
          /* Pouso e freada */
          28% { transform: translate3d(0, -80px, 0) scale(1.05) rotate(-45deg); }
          30%, 85% { transform: translate3d(-8px, -42px, 0) scale(1) rotate(-35deg); opacity: 1;}
          /* Decolagem */
          86% { transform: translate3d(-8px, -65px, 0) scale(1) rotate(-45deg); }
          91% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-45deg); opacity: 1; }
          92%, 100% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-45deg); opacity: 0; }
        }
        .animate-rocket-1 {
          animation: rocket-1 40s ease-in-out infinite;
        }

        /* -------------------------------------------------------------
           FOGUETES 2: O Apressado (Pouso torto para a DIREITA)
           ------------------------------------------------------------- */
        @keyframes rocket-2 {
          0%, 3% { transform: translate3d(-150vw, 30vh, 0) scale(3.5) rotate(45deg); opacity: 0; }
          4% { opacity: 1; }
          12% { transform: translate3d(150vw, 5vh, 0) scale(3.5) rotate(45deg); opacity: 1; }
          13% { opacity: 0; } 
          19% { transform: translate3d(50vw, -120vh, 0) scale(1.5) rotate(-135deg); opacity: 0; }
          20% { opacity: 1; } 
          25% { transform: translate3d(0, -200px, 0) scale(1.2) rotate(-135deg); }
          /* Pouso diferente: Freia mais torto e encosta a barriga na cabeça do robô */
          28% { transform: translate3d(0, -80px, 0) scale(1.05) rotate(-10deg); }
          30%, 85% { transform: translate3d(10px, -35px, 0) scale(0.95) rotate(20deg); opacity: 1;}
          /* Decolagem */
          86% { transform: translate3d(10px, -65px, 0) scale(0.95) rotate(0deg); }
          91% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-20deg); opacity: 1; }
          92%, 100% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-20deg); opacity: 0; }
        }
        .animate-rocket-2 {
          animation: rocket-2 40s ease-in-out infinite;
        }

        /* -------------------------------------------------------------
           FOGUETE 3: O Pesadão (Pouso vertical firme)
           ------------------------------------------------------------- */
        @keyframes rocket-3 {
          0%, 3% { transform: translate3d(-150vw, 30vh, 0) scale(3.5) rotate(45deg); opacity: 0; }
          4% { opacity: 1; }
          12% { transform: translate3d(150vw, 5vh, 0) scale(3.5) rotate(45deg); opacity: 1; }
          13% { opacity: 0; } 
          19% { transform: translate3d(50vw, -120vh, 0) scale(1.5) rotate(-135deg); opacity: 0; }
          20% { opacity: 1; } 
          25% { transform: translate3d(0, -200px, 0) scale(1.2) rotate(-135deg); }
          /* Pouso diferente: Vem reto de cima e quase levanta o bico totalmente */
          28% { transform: translate3d(0, -90px, 0) scale(1.1) rotate(-60deg); }
          30%, 85% { transform: translate3d(0, -48px, 0) scale(1.05) rotate(-5deg); opacity: 1;}
          /* Decolagem */
          86% { transform: translate3d(0, -65px, 0) scale(1.05) rotate(-45deg); }
          91% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-45deg); opacity: 1; }
          92%, 100% { transform: translate3d(0, -150vh, 0) scale(1.2) rotate(-45deg); opacity: 0; }
        }
        .animate-rocket-3 {
          animation: rocket-3 40s ease-in-out infinite;
        }
      `}</style>
      </div>
  );
};

export default ThankYou;