import { Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
interface CompletedStepCardProps {
  title: string;
  description?: string;
  stepNumber: number;
  onRepeat?: () => void;
  isQuiz?: boolean;
  answer?: string;
}

export const CompletedStepCard = ({
  title,
  description,
  stepNumber,
  onRepeat,
  isQuiz,
  answer
}: CompletedStepCardProps) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-card border border-border rounded-2xl p-5 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="bg-success/20 text-success text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            {t('lessonUI.taskCompleted')}
          </span>
          <span className="text-xs text-muted-foreground">#{stepNumber}</span>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-bold text-lg text-foreground mb-1">{title}</h3>
      {description && (
        <div className="text-muted-foreground text-sm line-clamp-2 mb-3 [&_p]:mb-1 [&_strong]:font-semibold">
          <ReactMarkdown>
            {description.replace(/\\n/g, '\n').replace(/\\"/g, '"')}
          </ReactMarkdown>
        </div>
      )}

      {/* Quiz answer display */}
      {isQuiz && answer && (
        <div className="bg-success/10 border border-success/20 rounded-lg px-3 py-2 mb-3">
          <p className="text-sm text-success">
            <span className="font-medium">{t('lessonUI.yourAnswer')}</span> {answer}
          </p>
        </div>
      )}

      {/* Repeat button */}
      {onRepeat && (
        <button 
          onClick={onRepeat}
          className={cn(
            "w-full bg-primary/10 text-primary font-medium py-3 rounded-xl",
            "flex items-center justify-center gap-2 transition-colors",
            "hover:bg-primary/20"
          )}
        >
          <Play className="w-4 h-4" />
          {t('lessonUI.repeatTask')}
        </button>
      )}
    </div>
  );
};
