import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { VideoPlaceholder } from "./VideoPlaceholder";
import { CustomYouTubePlayer } from "./CustomYouTubePlayer";
import { CheckCircle, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  phase: {
    id: string;
    phase_number: number;
    title: string;
    description: string;
    video_url: string | null;
    task_description: string;
  };
  isCompleted: boolean;
  onComplete: (phaseId: string) => void;
  isCompletingPhase: boolean;
}

export const PhaseModal = ({
  isOpen,
  onClose,
  phase,
  isCompleted,
  onComplete,
  isCompletingPhase
}: PhaseModalProps) => {
  const { t } = useTranslation();
  const [taskChecked, setTaskChecked] = useState(false);

  const handleComplete = () => {
    if (!isCompleted && taskChecked) {
      onComplete(phase.id);
      setTaskChecked(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass neon-border">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold neon-glow flex items-center gap-3">
            {t('phase.phaseTitle', { number: phase.phase_number })}: {phase.title}
            {isCompleted && <CheckCircle className="w-8 h-8 text-primary" />}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="glass rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3 text-primary">{phase.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{phase.description}</p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-3 text-primary">{t('common.continue')}</h3>
            {phase.video_url ? (
              <CustomYouTubePlayer videoUrl={phase.video_url} />
            ) : (
              <VideoPlaceholder />
            )}
          </div>

          <div className="glass rounded-lg p-6 neon-border">
            <h3 className="text-xl font-semibold mb-3 text-primary">✨ {t('phase.taskTitle')}</h3>
            <p className="text-foreground leading-relaxed mb-4">{phase.task_description}</p>
            
            {!isCompleted && (
              <div className="flex items-center space-x-3 mt-6 p-4 bg-card/50 rounded-lg">
                <Checkbox
                  id="task-complete"
                  checked={taskChecked}
                  onCheckedChange={(checked) => setTaskChecked(checked as boolean)}
                />
                <label
                  htmlFor="task-complete"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  {t('phase.taskCheckbox')}
                </label>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              {t('common.back')}
            </Button>
            {!isCompleted && (
              <Button
                onClick={handleComplete}
                disabled={!taskChecked || isCompletingPhase}
                className="neon-border hover-glow"
              >
                {isCompletingPhase ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {t('phase.completeButton')}
                  </>
                )}
              </Button>
            )}
            {isCompleted && (
              <div className="flex items-center gap-2 text-primary font-semibold">
                <CheckCircle className="w-5 h-5" />
                {t('phase.congratsMessage', { number: phase.phase_number })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
