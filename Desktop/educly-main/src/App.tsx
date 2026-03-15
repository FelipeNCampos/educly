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
import Profile from "./pages/Profile"; 

// Inicialização do Query Client para cache de requisições
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="educly-theme">
      <TooltipProvider>
        <SoundSettingsProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <UpdateNotification autoReloadSeconds={15} />
          
          <BrowserRouter>
            <PWARedirect />
            <Routes>
              {/* --- ROTAS PÚBLICAS --- */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/update-password" element={<UpdatePassword />} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/obrigado" element={<ThankYou />} />
              <Route path="/termos" element={<TermsOfUse />} />
              <Route path="/privacidade" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiesPolicy />} />
              <Route path="/contato" element={<Contact />} />
              
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
              
              {/* --- REDIRECIONAMENTO DE ERRO --- */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </SoundSettingsProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
