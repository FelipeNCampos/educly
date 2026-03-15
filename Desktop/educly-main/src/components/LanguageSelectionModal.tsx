import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'es', flag: '🇪🇸', name: 'Español' },
];

interface LanguageSelectionModalProps {
  forceOpen?: boolean;
}

export const LanguageSelectionModal = ({ forceOpen = false }: LanguageSelectionModalProps) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSelectedLanguage = localStorage.getItem('i18nextLng');
    if (forceOpen || !hasSelectedLanguage) {
      // Don't force any language - let browser detection work
      setIsOpen(true);
    }
  }, [forceOpen]);

  const handleSelectLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-xl">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center py-6">
          {/* Icon */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 w-20 h-20 rounded-full bg-primary/20 animate-ping" />
            <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/40">
              <Globe className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
            Escolha seu idioma
          </h2>
          <p className="text-muted-foreground text-sm mb-8 text-center">
            Choose your language • Choisissez votre langue
          </p>

          {/* Language Options */}
          <div className="flex gap-4">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelectLanguage(lang.code)}
                className="group flex flex-col items-center p-4 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/20"
              >
                <span className="text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {lang.flag}
                </span>
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {lang.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
