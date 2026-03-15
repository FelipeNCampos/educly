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

  // ------------------------------------------------------------------
  // NOVA LÓGICA DE CORES: Baseada no STATUS, não na posição fixa
  // ------------------------------------------------------------------
  const getStatusColor = (status: string, isNextStep: boolean) => {
    if (status === "locked") return { start: "#6b7280", end: "#4b5563" }; // Cinza
    if (isNextStep) return { start: "#8b5cf6", end: "#7c3aed" }; // Roxo (Apenas a atual)
    return { start: "#10b981", end: "#059669" }; // Verde (Completas)
  };

  const generatePathPositions = () => {
    const positions: { x: number; y: number; curvePoints: string }[] = [];
    const spacing = 160; // Reduzi um pouco para caber melhor na tela

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
    <div className="py-8">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex-1 w-full relative">
          <svg viewBox={`-150 -50 300 ${svgHeight}`} className="w-full mx-auto" style={{ maxHeight: `${svgHeight}px` }}>
            {/* 1. Renderiza o Caminho (Linhas) */}
            {positions.map((pos, index) => {
              if (index === 0) return null;
              const prevPhase = phases[index - 1];
              const currentPhase = phases[index];
              const currentStatus = getPhaseStatus(currentPhase);

              // Define se essa fase é a "Próxima a fazer"
              const isNextStep = currentStatus === "unlocked" && !isPhaseCompleted(currentPhase.id);

              // Cor da linha: Se a fase está completa, linha verde. Se é a atual ou futura, cinza/roxo.
              let strokeColor = "#64748b"; // Locked (Cinza)
              if (isPhaseCompleted(currentPhase.id))
                strokeColor = "#10b981"; // Caminho percorrido (Verde)
              else if (isNextStep) strokeColor = "#8b5cf6"; // Caminho atual (Roxo)

              return (
                <path
                  key={`path-${index}`}
                  d={pos.curvePoints}
                  stroke={strokeColor}
                  strokeWidth="8"
                  fill="none"
                  opacity={currentStatus === "locked" ? 0.3 : 0.6}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              );
            })}

            {/* 2. Renderiza as Bolinhas (Fases) */}
            {phases.map((phase, index) => {
              const status = getPhaseStatus(phase);
              const pos = positions[index];
              const isLocked = status === "locked";
              const isCompleted = status === "completed";
              const isUnlocked = status === "unlocked";

              // Esta é a variável chave: Só é "NextStep" se estiver desbloqueada E não concluída
              const isNextStep = isUnlocked && !isCompleted;

              const isHovered = hoveredPhase === index;
              const colors = getStatusColor(status, isNextStep);

              return (
                <g
                  key={phase.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  className={`${isLocked ? "cursor-not-allowed" : "cursor-pointer"} transition-all duration-300`}
                  onClick={() => !isLocked && onPhaseClick(phase)}
                  onMouseEnter={() => setHoveredPhase(index)}
                  onMouseLeave={() => setHoveredPhase(null)}
                >
                  {/* Anel pulsante APENAS na fase atual (NextStep) */}
                  {isNextStep && (
                    <>
                      <circle
                        cx="0"
                        cy="0"
                        r="45"
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="3"
                        opacity="0.3"
                        className="animate-ping"
                      />
                      <circle cx="0" cy="0" r="42" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" />
                    </>
                  )}

                  {/* Sombra */}
                  <circle cx="0" cy="3" r="38" fill="rgba(0,0,0,0.3)" filter="blur(8px)" />

                  {/* Bolinha Principal */}
                  <circle
                    cx="0"
                    cy="0"
                    r="38"
                    fill={`url(#gradient-${phase.id})`} // Uso ID único para evitar conflitos
                    className={`transition-all duration-300 ${isHovered ? "scale-110" : ""}`}
                  />

                  {/* Brilho Superior */}
                  <ellipse cx="-8" cy="-12" rx="15" ry="10" fill="white" opacity="0.4" />

                  {/* Definição do Gradiente com a NOVA Lógica */}
                  <defs>
                    <linearGradient id={`gradient-${phase.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={colors.start} />
                      <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                  </defs>

                  {/* Ícone: Cadeado (Bloqueado) */}
                  {isLocked && <Lock x="-12" y="-12" width="24" height="24" className="text-white" />}

                  {/* Ícone: Estrela (Somente na fase Atual) */}
                  {isNextStep && (
                    <Star
                      x="-14"
                      y="-14"
                      width="28"
                      height="28"
                      fill="#fbbf24"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      className="animate-pulse-slow"
                    />
                  )}

                  {/* Número da fase (Se completado ou se for futuro desbloqueado) */}
                  {isCompleted && <Check x="-14" y="-14" width="28" height="28" stroke="white" strokeWidth="3" />}

                  {/* Se não for nem check nem estrela, mostra número */}
                  {!isCompleted && !isNextStep && !isLocked && (
                    <text
                      x="0"
                      y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="24"
                      fontWeight="bold"
                      fill="white"
                    >
                      {phase.phase_number}
                    </text>
                  )}

                  {/* Texto "Fase X" abaixo */}
                  {!isLocked && (
                    <text
                      x="0"
                      y="55"
                      textAnchor="middle"
                      fontSize="12"
                      fill={isNextStep ? "#8b5cf6" : isCompleted ? "#10b981" : "#9ca3af"}
                      fontWeight="600"
                    >
                      Fase {phase.phase_number}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Card Lateral */}
        {activePhase && (
          <div className="w-full lg:w-96 lg:sticky lg:top-8">
            <div className="glass rounded-2xl p-6 neon-border border-primary neon-box-glow animate-fade-in bg-card/50 backdrop-blur-sm border border-border/50">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 rounded-full bg-primary/20 animate-glow-pulse">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-foreground mb-1">
                    Fase {activePhase.phase_number}: {activePhase.title}
                  </h3>
                  <span className="text-sm text-primary font-semibold">Fase Atual</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">{activePhase.description}</p>
              <button
                onClick={() => onPhaseClick(activePhase)}
                className="w-full py-3 px-6 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-300 hover-glow flex items-center justify-center gap-2 group"
              >
                Continuar Jornada
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
