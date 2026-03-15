import { useState, useEffect } from 'react';
import { Download, X, Share, Plus, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

export const PWAInstallPrompt = () => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();
  const location = useLocation();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Rotas onde o prompt não deve aparecer
  const hiddenRoutes = ['/obrigado'];

  useEffect(() => {
    // Não mostrar em rotas específicas
    if (hiddenRoutes.includes(location.pathname)) {
      return;
    }

    // Check if user dismissed before
    const wasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (wasDismissed) {
      const dismissedDate = new Date(wasDismissed);
      const now = new Date();
      // Show again after 7 days
      if ((now.getTime() - dismissedDate.getTime()) > 7 * 24 * 60 * 60 * 1000) {
        localStorage.removeItem('pwa-install-dismissed');
      } else {
        setDismissed(true);
      }
    }

    // Show prompt after 3 seconds if installable
    const timer = setTimeout(() => {
      if ((isInstallable || isIOS) && !isInstalled && !dismissed) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isInstallable, isInstalled, isIOS, dismissed, location.pathname]);

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString());
  };

  if (!showPrompt || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in-up md:left-auto md:right-4 md:w-96">
      <div className="bg-card border border-border rounded-2xl p-4 shadow-2xl backdrop-blur-sm">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
            <Download className="w-7 h-7 text-primary" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-lg">
              {t('pwa.title', 'Instale o IAcademy')}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {t('pwa.description', 'Acesse mais rápido direto da sua tela inicial!')}
            </p>
          </div>
        </div>

        {isIOS ? (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Share className="w-4 h-4 text-primary" />
              </div>
              <span>{t('pwa.ios.step1', '1. Toque no botão de compartilhar')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <span>{t('pwa.ios.step2', '2. Selecione "Adicionar à Tela de Início"')}</span>
            </div>
          </div>
        ) : isAndroid ? (
          <div className="mt-4 space-y-3">
            {isInstallable ? (
              <Button
                onClick={handleInstall}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('pwa.install', 'Instalar Agora')}
              </Button>
            ) : (
              <>
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MoreVertical className="w-4 h-4 text-primary" />
                  </div>
                  <span>{t('pwa.android.step1', '1. Toque no menu (⋮) do navegador')}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Download className="w-4 h-4 text-primary" />
                  </div>
                  <span>{t('pwa.android.step2', '2. Selecione "Instalar aplicativo"')}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mt-4">
            {isInstallable ? (
              <Button
                onClick={handleInstall}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
              >
                <Download className="w-5 h-5 mr-2" />
                {t('pwa.install', 'Instalar Agora')}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                {t('pwa.desktop', 'Use o menu do navegador para instalar')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
