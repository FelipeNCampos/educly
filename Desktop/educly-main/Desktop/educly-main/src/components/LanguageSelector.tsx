import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";

const languages = [
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[60px] sm:w-[140px] bg-background/50 backdrop-blur-sm hover:bg-background/70 transition-all border-border">
        <div className="flex items-center gap-1 sm:gap-2">
          <Globe className="h-4 w-4 text-primary hidden sm:block" />
          <SelectValue>
            <span className="flex items-center gap-1 sm:gap-1.5">
              <span>{currentLanguage.flag}</span>
              <span className="text-sm font-medium hidden sm:inline">{currentLanguage.name}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent 
        className="bg-background/95 backdrop-blur-lg border-border max-h-[300px] max-w-[90vw]"
        position="popper"
        side="bottom"
        align="end"
        sideOffset={4}
      >
        {languages.map((language) => (
          <SelectItem 
            key={language.code} 
            value={language.code}
            className="cursor-pointer hover:bg-primary/10 focus:bg-primary/10"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span className="font-medium">{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
