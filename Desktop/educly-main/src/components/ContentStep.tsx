import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import { useQuizSounds } from "@/hooks/useQuizSounds";

interface ContentStepProps {
  title: string;
  content: string;
  imageUrl?: string | null;
  onContinue: () => void;
  currentStep: number;
  totalSteps: number;
}

export const ContentStep = ({
  title,
  content,
  imageUrl,
  onContinue,
  currentStep,
  totalSteps
}: ContentStepProps) => {
  const { t } = useTranslation();
  const { playContinue } = useQuizSounds();

  const handleContinue = () => {
    playContinue();
    onContinue();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Progress bar */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm text-muted-foreground">
            {currentStep} / {totalSteps}
          </span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        <h1 className="text-2xl font-bold text-foreground mb-6">{title}</h1>
        
        {imageUrl && (
          <div className="mb-6 rounded-2xl overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        <div className="prose prose-lg max-w-none">
          <div className="text-foreground/90 leading-relaxed [&_p]:mb-4 [&_strong]:font-bold [&_strong]:text-primary [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:font-bold [&_h1]:text-xl [&_h1]:mt-6 [&_h1]:mb-3 [&_h1]:text-primary [&_h2]:font-bold [&_h2]:text-lg [&_h2]:mt-5 [&_h2]:mb-2 [&_h2]:text-primary [&_h3]:font-bold [&_h3]:text-base [&_h3]:mt-4 [&_h3]:mb-2 [&_h3]:text-primary/90">
            <ReactMarkdown>
              {content.replace(/\\n/g, '\n').replace(/\\"/g, '"')}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Continue button */}
      <div className="p-4 border-t border-border bg-background">
        <Button 
          onClick={handleContinue}
          className="w-full h-14 text-lg font-semibold rounded-xl"
          size="lg"
        >
          {t('common.continue')}
          <ChevronRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
