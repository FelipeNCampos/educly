import { Download, Share, Plus, MoreVertical, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InstallButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const InstallButton = ({ variant = 'default', size = 'default', className }: InstallButtonProps) => {
  const { t } = useTranslation();
  const { isInstallable, isInstalled, isIOS, isAndroid, promptInstall } = usePWAInstall();

  if (isInstalled) {
    return (
      <Button variant="ghost" size={size} className={className} disabled>
        <CheckCircle className="w-4 h-4 mr-2 text-success" />
        {t('pwa.installed', 'Instalado')}
      </Button>
    );
  }

  // Direct install for Chrome/Android
  if (isInstallable && !isIOS) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={promptInstall}
      >
        <Download className="w-4 h-4 mr-2" />
        {t('pwa.installApp', 'Instalar App')}
      </Button>
    );
  }

  // Show instructions modal for iOS or when prompt not available
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="w-4 h-4 mr-2" />
          {t('pwa.installApp', 'Instalar App')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {t('pwa.installTitle', 'Instalar IAcademy')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-muted-foreground">
            {t('pwa.installDescription', 'Siga os passos abaixo para instalar o app:')}
          </p>

          {isIOS ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Share className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('pwa.ios.stepTitle1', 'Passo 1')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('pwa.ios.step1', 'Toque no botão de compartilhar')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('pwa.ios.stepTitle2', 'Passo 2')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('pwa.ios.step2', 'Selecione "Adicionar à Tela de Início"')}
                  </p>
                </div>
              </div>
            </div>
          ) : isAndroid ? (
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MoreVertical className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('pwa.android.stepTitle1', 'Passo 1')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('pwa.android.step1', 'Toque no menu (⋮) do navegador')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{t('pwa.android.stepTitle2', 'Passo 2')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('pwa.android.step2', 'Selecione "Instalar aplicativo"')}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Download className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t('pwa.desktop', 'Use o menu do navegador para instalar')}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
