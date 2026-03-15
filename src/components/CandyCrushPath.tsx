import { Star, Lock, Check } from "lucide-react";
import { useState } from "react";

interface Phase {
  id: string;
  phase_number: number;
  title: string;
  description: string;
  video_url: string | null;
  task_description: string;
}

interface CandyCrushPathProps {
  phases: Phase[];
  isPhaseUnlocked: (phaseNumber: number) => boolean;
  isPhaseCompleted: (phaseId: string) => boolean;
  onPhaseClick: (phase: Phase) => void;
}

export const CandyCrushPath = ({ phases, isPhaseUnlocked, isPhaseCompleted, onPhaseClick }: CandyCrushPathProps) => {
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);

  const getPhaseStatus = (phase: Phase) => {
    if (isPhaseCompleted(phase.id)) return "completed";
    if (isPhaseUnlocked(phase.phase_number)) return "unlocked";
    return "locked";
  };

  const getStatusColor = (status: string, isNextStep: boolean) => {
    if (status === "locked") return "#334155";
    if (isNextStep) return "#8b5cf6";
    return "#10b981";
  };

  const generatePathPositions = () => {
    const positions: { x: number; y: number; curvePoints: string }[] = [];
    const spacing = 160;
    phases.forEach((_, index) => {
      const y = index * spacing;
      const x = Math.sin(index * 0.8) * 80;
      let curvePoints = "";
      if (index > 0) {
        const prevY = (index - 1) * spacing;
        const prevX = Math.sin((index - 1) * 0.8) * 80;
        const midY = (y + prevY) / 2;
        curvePoints = `M ${prevX} ${prevY} Q ${prevX} ${midY}, ${x} ${y}`;
      }
      positions.push({ x, y, curvePoints });
    });
    return positions;
  };

  const positions = generatePathPositions();
  const activePhase = phases.find((p) => isPhaseUnlocked(p.phase_number) && !isPhaseCompleted(p.id));
  const svgHeight = (phases.length - 1) * 160 + 100;

  return (
    <div className="py-8 w-full overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-8 items-start max-w-6xl mx-auto px-4">
        <div className="flex-1 w-full relative">
          <svg viewBox={`-150 -50 300 ${svgHeight}`} className="w-full h-auto mx-auto" style={{ maxWidth: '600px' }}>
            
            {/* 1. Conectores (Linhas do caminho) */}
            {positions.map((pos, index) => {
              if (index === 0) return null;
              const isComp = isPhaseCompleted(phases[index].id);
              return (
                <path
                  key={`path-${index}`}
                  d={pos.curvePoints}
                  stroke={isComp ? "#10b981" : "#334155"}
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  opacity={isComp ? 0.8 : 0.3}
                />
              );
            })}

            {/* 2. Bolinhas das Fases - USANDO PATH EM VEZ DE CIRCLE */}
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase);
              const pos = positions[index];
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isNextStep = status === "unlocked" && !isCompleted;
              const isHovered = hoveredPhase === index;
              const color = getStatusColor(status, isNextStep);

              return (
                <g
                  key={phase.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className={`${isLocked ? "cursor-not-allowed" : "cursor-pointer"} transition-all duration-300`}
                  onClick={() => !isLocked && onPhaseClick(phase)}
                  onMouseEnter={() => setHoveredPhase(index)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  {/* Sombra de fundo */}
                  <path 
                    d="M -38, 0 A 38,38 0 1,0 38,0 A 38,38 0 1,0 -38,0" 
                    fill="black" 
                    transform="translate(0, 5)"
                    opacity="0.3" 
                  />

                  {/* BOLINHA PRINCIPAL: Desenhada com Path para ignorar regras globais de círculo */}
                  <path
                    d="M -38, 0 A 38,38 0 1,0 38,0 A 38,38 0 1,0 -38,0"
                    style={{ 
                      fill: color,
                      fillOpacity: 1,
                      stroke: "white",
                      strokeWidth: isHovered ? 4 : 2,
                      strokeOpacity: isLocked ? 0.3 : 1 
                    }}
                  />

                  {/* Reflexo 3D superior */}
                  <ellipse cx="-10" cy="-15" rx="12" ry="8" fill="white" opacity="0.2" />

                  {/* Ícones centrais */}
                  <g transform="translate(-14, -14)">
                    {isLocked && <Lock size={28} className="text-white/40" />}
                    {isNextStep && <Star size={28} fill="#fbbf24" stroke="#f59e0b" strokeWidth={2} />}
                    {isCompleted && <Check size={28} stroke="white" strokeWidth={4} />}
                  </g>

                  {/* Etiqueta inferior JOUR X */}
                  <g transform="translate(0, 55)">
                    <rect x="-45" y="-10" width="90" height="20" rx="10" fill="rgba(0,0,0,0.5)" />
                    <text textAnchor="middle" dominantBaseline="central" fontSize="11" fill="white" fontWeight="bold">
                      JOUR {phase.phase_number}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
