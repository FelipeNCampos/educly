import { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface AICardProps {
  id: string;
  cardId?: string;
  icon: LucideIcon;
  gradient: { from: string; to: string };
  color: string;
  onClick: () => void;
  delay?: number;
}

const AI_TRANSLATIONS: Record<string, { nameKey: string; descKey: string }> = {
  specialist: { nameKey: "assistants.specialist.name", descKey: "assistants.specialist.description" },
  "prompt-creator": { nameKey: "assistants.promptCreator.name", descKey: "assistants.promptCreator.description" },
  planner: { nameKey: "assistants.planner.name", descKey: "assistants.planner.description" },
  creative: { nameKey: "assistants.creative.name", descKey: "assistants.creative.description" },
};

export const AICard = ({ id, cardId, icon: Icon, gradient, color, onClick, delay = 0 }: AICardProps) => {
  const { t } = useTranslation();
  const keys = AI_TRANSLATIONS[id] || AI_TRANSLATIONS.specialist;

  return (
    <div
      id={cardId}
      className={cn(
        "relative overflow-hidden rounded-xl p-5 cursor-pointer",
        "transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]",
        "animate-fade-in"
      )}
      style={{
        background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        animationDelay: `${delay * 100}ms`,
      }}
      onClick={onClick}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white rounded-full blur-2xl" />
      </div>

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white mb-1">
            {t(keys.nameKey)}
          </h3>
          <p className="text-white/80 text-sm line-clamp-2">
            {t(keys.descKey)}
          </p>
        </div>
      </div>

      {/* Arrow indicator */}
      <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <svg 
          className="w-4 h-4 text-white" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
};
