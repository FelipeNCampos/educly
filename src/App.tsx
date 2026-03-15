import { Component, ErrorInfo, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWARedirect } from "@/components/PWARedirect";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import { PremiumGuard } from "@/components/PremiumGuard";
import { UpdateNotification } from "@/components/UpdateNotification";
import { ThemeProvider } from "@/components/theme-provider";
import { supabase } from "@/integrations/supabase/client";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import i18n from "i18next";

// Componente invisível que rastreia sessões de usuários autenticados
const SessionTracker = () => {
  useSessionTracking();
  return null;
};

class GlobalErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    Promise.resolve(supabase.from("user_bugs").insert({
      platform: `${navigator.platform} - ${navigator.userAgent.split(" ")[0]}`,
      error_message: `[UI CRASH] ${error.message}`,
      component_stack: errorInfo.componentStack || "Render Error",
    })).catch(() => {});
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily: "system-ui, sans-serif",
          padding: "20px",
          textAlign: "center",
        }}>
          <h2 style={{ marginBottom: "12px" }}>{i18n.t('errorBoundary.title')}</h2>
          <p style={{ marginBottom: "20px", opacity: 0.7 }}>
            {i18n.t('errorBoundary.message')}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 24px",
              background: "#6366f1",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            {i18n.t('errorBoundary.button')}
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Importações das Páginas
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import Dashboard from "./pages/Dashboard";
import Plan from "./pages/Plan";
import Challenge from "./pages/Challenge";
import DayLesson from "./pages/DayLesson";
import Chat from "./pages/Chat";
import Auth from "./pages/Auth";
import UpdatePassword from "./pages/UpdatePassword";
import ThankYou from "./pages/ThankYou";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiesPolicy from "./pages/CookiesPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import Certificate from "./pages/Certificate";
import PersonalizedBrief from "./pages/PersonalizedBrief";
import SubscriptionTerms from "./pages/SubscriptionTerms";
import PersonalizedTrail from "./pages/PersonalizedTrail";
import PersonalizedLesson from "./pages/PersonalizedLesson";
import Assistentes from "./pages/Assistentes";
import AssistantChat from "./pages/AssistantChat";
import Freelancer from "./pages/Freelancer";
import FreelancerLesson from "./pages/FreelancerLesson";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminEmails from "./pages/AdminEmails";
import Medals from "./pages/Medals";
import Profile from "./pages/Profile";
import UpsellEsp from "./pages/UpsellEsp";
import UpsellEspDois from "./pages/UpsellEspDois";
import DownsellEsp from "./pages/DownsellEsp";
import ResetCache from "./pages/ResetCache";

// Inicialização do Query Client para cache de requisições
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Efeito para aplicar o tema no HTML root
  const applyThemeToHTML = () => {
    // Esta função será chamada pelo ThemeProvider quando o tema mudar
    const handleThemeChange = (theme: string) => {
      const html = document.documentElement;

      if (theme === 'dark') {
        html.classList.add('dark');
        html.style.backgroundColor = '#0f172a'; // slate-900
        document.body.style.backgroundColor = '#0f172a';
      } else {
        html.classList.remove('dark');
        html.style.backgroundColor = '#ffffff';
        document.body.style.backgroundColor = '#ffffff';
      }
    };

    // Configurar listener para mudanças de tema
    const themeStore = localStorage.getItem('educly-theme') || 'dark';
    handleThemeChange(themeStore);

    // Observar mudanças no localStorage (para sincronização entre tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === 'educly-theme') {
        handleThemeChange(e.newValue || 'dark');
      }
    });
  };

  // Aplicar tema na inicialização
  applyThemeToHTML();

  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
            defaultTheme="dark"
            storageKey="educly-theme">
          <TooltipProvider>
            <SoundSettingsProvider>
              <Toaster />
              <Sonner />
          
              <BrowserRouter>
                <SessionTracker />
                <UpdateNotification autoReloadSeconds={15} />
                <PWARedirect />
                <PWAInstallPrompt />
                <Routes>
                  {/* --- ROTAS PÚBLICAS --- */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  <Route path="/obrigado" element={<ThankYou />} />
                  <Route path="/termos" element={<TermsOfUse />} />
                  <Route path="/privacidade" element={<PrivacyPolicy />} />
                  <Route path="/cookies" element={<CookiesPolicy />} />
                  <Route path="/cancelamento" element={<RefundPolicy />} />
                  <Route path="/refund" element={<RefundPolicy />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/termos-assinatura" element={<SubscriptionTerms />} />
              <Route path="/reset-cache" element={<ResetCache />} />

                  {/* Rotas de Upsell e Downsell Específicas */}
                  <Route path="/upsell-1-esp" element={<UpsellEsp />} />
                  <Route path="/upsell-2-esp" element={<UpsellEspDois />} />
                  <Route path="/downsell-esp" element={<DownsellEsp />} />

                  {/* Quiz - Acesso Geral */}
                  <Route path="/quiz" element={<Quiz />} />

                  {/* --- ROTAS PROTEGIDAS (PREMIUM) --- */}
                  <Route path="/dashboard" element={<PremiumGuard><Dashboard /></PremiumGuard>} />
                  <Route path="/plan" element={<PremiumGuard><Plan /></PremiumGuard>} />
                  <Route path="/desafio/:slug" element={<PremiumGuard><Challenge /></PremiumGuard>} />
                  <Route path="/aula/:dayId" element={<PremiumGuard><DayLesson /></PremiumGuard>} />
                  <Route path="/chat" element={<PremiumGuard><Chat /></PremiumGuard>} />
                  <Route path="/certificado/:id" element={<PremiumGuard><Certificate /></PremiumGuard>} />
                  <Route path="/trilha-personalizada" element={<PremiumGuard><PersonalizedBrief /></PremiumGuard>} />
                  <Route path="/trilha-personalizada/:planId" element={<PremiumGuard><PersonalizedTrail /></PremiumGuard>} />
                  <Route path="/aula-personalizada/:planId/:day" element={<PremiumGuard><PersonalizedLesson /></PremiumGuard>} />
                  <Route path="/assistentes" element={<PremiumGuard><Assistentes /></PremiumGuard>} />
                  <Route path="/assistentes/:aiType" element={<PremiumGuard><AssistantChat /></PremiumGuard>} />
                  <Route path="/freelancer" element={<PremiumGuard><Freelancer /></PremiumGuard>} />
                  <Route path="/freelancer/:moduleId" element={<PremiumGuard><FreelancerLesson /></PremiumGuard>} />
                  <Route path="/medalhas" element={<PremiumGuard><Medals /></PremiumGuard>} />
                  <Route path="/profile" element={<PremiumGuard><Profile /></PremiumGuard>} />

                  {/* --- ADMINISTRAÇÃO --- */}
                  <Route path="/admin/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/emails" element={<AdminEmails />} />

                  {/* --- REDIRECIONAMENTO DE ERRO --- */}
                  <Route path="/404" element={<NotFound />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </BrowserRouter>
            </SoundSettingsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;