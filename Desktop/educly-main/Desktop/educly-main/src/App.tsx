import { useEffect, Component, ErrorInfo, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PWARedirect } from "@/components/PWARedirect";
import { SoundSettingsProvider } from "@/contexts/SoundSettingsContext";
import { PremiumGuard } from "@/components/PremiumGuard";
import { UpdateNotification } from "@/components/UpdateNotification";
import { supabase } from "@/integrations/supabase/client";

// Imports de páginas
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
import Certificate from "./pages/Certificate";
import PersonalizedBrief from "./pages/PersonalizedBrief";
import PersonalizedTrail from "./pages/PersonalizedTrail";
import PersonalizedLesson from "./pages/PersonalizedLesson";
import Assistentes from "./pages/Assistentes";
import AssistantChat from "./pages/AssistantChat";
import Freelancer from "./pages/Freelancer";
import FreelancerLesson from "./pages/FreelancerLesson";
import Contact from "./pages/Contact";
import Upgrade from "./pages/Upgrade";
import NotFound from "./pages/NotFound";
import AdminAnalytics from "./pages/AdminAnalytics";
import Medals from "./pages/Medals";

// --- ESCUDO INVISÍVEL PARA ERROS DE TELA ---
class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    supabase.from('user_bugs').insert({
      platform: navigator.userAgent,
      error_message: `[UI CRASH] ${error.message}`,
      component_stack: errorInfo.componentStack || "Render Error",
    }).then();
  }
  render() {
    if (this.state.hasError) return null; // Silencioso: some se quebrar
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const reportBug = async (message: string, stack?: string) => {
      try {
        const platformInfo = `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`;
        await supabase.from('user_bugs').insert({
          platform: platformInfo,
          error_message: `[SISTEMA] URL: ${window.location.href} | ${message}`,
          component_stack: stack || "Global Logic Error",
        });
      } catch (e) {}
    };

    const handleError = (event: ErrorEvent) => reportBug(event.message, `${event.filename} L:${event.lineno}`);
    const handleRejection = (event: PromiseRejectionEvent) => reportBug(`Erro de API: ${event.reason}`, "Async Rejection");

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GlobalErrorBoundary>
        <TooltipProvider>
          <SoundSettingsProvider>
            <Toaster />
            <Sonner />
            <PWAInstallPrompt />
            <UpdateNotification autoReloadSeconds={15} />
            <BrowserRouter>
              <PWARedirect />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/upgrade" element={<Upgrade />} />
                <Route path="/obrigado" element={<ThankYou />} />
                <Route path="/termos" element={<TermsOfUse />} />
                <Route path="/privacidade" element={<PrivacyPolicy />} />
                <Route path="/cookies" element={<CookiesPolicy />} />
                <Route path="/contato" element={<Contact />} />
                <Route path="/quiz" element={<Quiz />} />
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
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </SoundSettingsProvider>
        </TooltipProvider>
      </GlobalErrorBoundary>
    </QueryClientProvider>
  );
};

export default App;