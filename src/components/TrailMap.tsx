import { useState } from "react";
import { PhaseModal } from "./PhaseModal";
import { CandyCrushPath } from "./CandyCrushPath";

interface TrailMapProps {
  phases: Array<{
    id: string;
    phase_number: number;
    title: string;
    description: string;
    video_url: string | null;
    task_description: string;
  }>;
  iconName: string;
  isPhaseUnlocked: (phaseNumber: number) => boolean;
  isPhaseCompleted: (phaseId: string) => boolean;
  onCompletePhase: (phaseId: string) => void;
  isCompletingPhase: boolean;
}

export const TrailMap = ({
  phases,
  iconName,
  isPhaseUnlocked,
  isPhaseCompleted,
  onCompletePhase,
  isCompletingPhase
}: TrailMapProps) => {
  const [selectedPhase, setSelectedPhase] = useState<typeof phases[0] | null>(null);

  const handlePhaseClick = (phase: typeof phases[0]) => {
    setSelectedPhase(phase);
  };

  return (
    <div className="relative">
      {/* Novo Layout Gamificado Estilo Candy Crush */}
      <CandyCrushPath
        phases={phases}
        isPhaseUnlocked={isPhaseUnlocked}
        isPhaseCompleted={isPhaseCompleted}
        onPhaseClick={handlePhaseClick}
      />

      {/* Modal da Fase */}
      {selectedPhase && (
        <PhaseModal
          isOpen={!!selectedPhase}
          onClose={() => setSelectedPhase(null)}
          phase={selectedPhase}
          isCompleted={isPhaseCompleted(selectedPhase.id)}
          onComplete={onCompletePhase}
          isCompletingPhase={isCompletingPhase}
        />
      )}
    </div>
  );
};
