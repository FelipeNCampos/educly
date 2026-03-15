import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppUpdate } from '@/hooks/useAppUpdate';
import { cn } from '@/lib/utils';


interface UpdateNotificationProps {
  autoReloadSeconds?: number;
}

export const UpdateNotification = ({ autoReloadSeconds }: UpdateNotificationProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { needRefresh, updateApp } = useAppUpdate();
  const [countdown, setCountdown] = useState(autoReloadSeconds || 0);
  const [dismissed, setDismissed] = useState(false);

  const shouldAutoReload = Boolean(autoReloadSeconds) && needRefresh;
  const shouldShow = needRefresh && !dismissed;

  const titleText = t("update.newVersionAvailable", "Nova versao disponivel!");
  const descriptionText = t("update.clickToUpdate", "Clique para obter as ultimas melhorias.");
  const buttonLabel = t("update.updateNow", "Atualizar Agora");

  const handleUpdateClick = () => {
    updateApp();
  };

  useEffect(() => {
    if (!shouldAutoReload || dismissed) return;

    setCountdown(autoReloadSeconds);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          updateApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [shouldAutoReload, autoReloadSeconds, updateApp, dismissed]);

  if (!shouldShow) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50",
        "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
        "rounded-xl shadow-2xl border border-primary/20",
        "animate-in slide-in-from-bottom-4 fade-in duration-300"
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="p-2 bg-primary-foreground/20 rounded-full animate-pulse">
              <RefreshCw className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm md:text-base">
              {titleText}
            </h4>
            <p className="text-xs md:text-sm opacity-90 mt-0.5">
              {descriptionText}
            </p>
            
            {shouldAutoReload && countdown > 0 && (
              <p className="text-xs opacity-75 mt-1">
                {t('update.autoReloadIn', 'Atualizando automaticamente em {{seconds}}s...', { seconds: countdown })}
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            onClick={handleUpdateClick}
            className="flex-1 bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
