import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useQuizSounds } from "@/hooks/useQuizSounds";
import { useTranslation } from "react-i18next";
import { Check, Link2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchPair {
  left: string;
  right: string;
}

interface MatchWordsProps {
  title: string;
  description?: string;
  pairs: MatchPair[];
  onComplete: () => void;
}

interface RopeConnection {
  leftId: string;
  rightId: string;
  isCorrect: boolean;
}

// Função de shuffle com seed para garantir randomização consistente por sessão
const seededShuffle = <T,>(array: T[], seed: number): T[] => {
  const shuffled = [...array];
  let currentSeed = seed;
  
  // Função de random com seed (Linear Congruential Generator)
  const seededRandom = () => {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const MatchWords = ({ title, description, pairs, onComplete }: MatchWordsProps) => {
  const { t } = useTranslation();
  const { playCorrect, playIncorrect } = useQuizSounds();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Map<string, string>>(new Map());
  const [wrongAttempt, setWrongAttempt] = useState<{left: string, right: string} | null>(null);
  const [ropeConnections, setRopeConnections] = useState<RopeConnection[]>([]);
  const [shuffleSeed, setShuffleSeed] = useState(() => Date.now());
  
  // Shuffle BOTH columns independently with different seeds for maximum difficulty
  // Usa seeds diferentes para esquerda e direita garantindo que NUNCA fiquem alinhados
  const shuffledLeft = useMemo(() => {
    return seededShuffle([...pairs.map(p => p.left)], shuffleSeed);
  }, [pairs, shuffleSeed]);
  
  const shuffledRight = useMemo(() => {
    // Usa seed diferente para a coluna direita (inverso + offset)
    const rightSeed = (shuffleSeed * 31337) ^ 0xDEADBEEF;
    const shuffled = seededShuffle([...pairs.map(p => p.right)], rightSeed);
    
    // Garante que nenhum par fique na mesma posição
    const leftItems = shuffledLeft;
    let attempts = 0;
    while (attempts < 10) {
      let hasAlignment = false;
      for (let i = 0; i < shuffled.length; i++) {
        const leftItem = leftItems[i];
        const rightItem = shuffled[i];
        const pair = pairs.find(p => p.left === leftItem);
        if (pair && pair.right === rightItem) {
          hasAlignment = true;
          // Move este item para outra posição
          const swapIndex = (i + 1 + Math.floor(Math.random() * (shuffled.length - 1))) % shuffled.length;
          [shuffled[i], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[i]];
        }
      }
      if (!hasAlignment) break;
      attempts++;
    }
    
    return shuffled;
  }, [pairs, shuffleSeed, shuffledLeft]);
  
  const isCompleted = matchedPairs.size === pairs.length;
  
  // Calculate rope positions
  const getRopePositions = () => {
    if (!containerRef.current) return [];
    
    const positions: { x1: number; y1: number; x2: number; y2: number; isCorrect: boolean }[] = [];
    
    ropeConnections.forEach(conn => {
      const leftEl = containerRef.current?.querySelector(`[data-left-id="${conn.leftId}"]`);
      const rightEl = containerRef.current?.querySelector(`[data-right-id="${conn.rightId}"]`);
      
      if (leftEl && rightEl) {
        const containerRect = containerRef.current!.getBoundingClientRect();
        const leftRect = leftEl.getBoundingClientRect();
        const rightRect = rightEl.getBoundingClientRect();
        
        positions.push({
          x1: leftRect.right - containerRect.left,
          y1: leftRect.top + leftRect.height / 2 - containerRect.top,
          x2: rightRect.left - containerRect.left,
          y2: rightRect.top + rightRect.height / 2 - containerRect.top,
          isCorrect: conn.isCorrect
        });
      }
    });
    
    return positions;
  };
  
  const [ropePositions, setRopePositions] = useState<ReturnType<typeof getRopePositions>>([]);
  
  useEffect(() => {
    const updatePositions = () => {
      setRopePositions(getRopePositions());
    };
    
    updatePositions();
    window.addEventListener('resize', updatePositions);
    return () => window.removeEventListener('resize', updatePositions);
  }, [ropeConnections]);
  
  const handleLeftClick = (value: string) => {
    if (matchedPairs.has(value)) return;
    setSelectedLeft(value);
    setWrongAttempt(null);
    
    if (selectedRight) {
      checkMatch(value, selectedRight);
    }
  };
  
  const handleRightClick = (value: string) => {
    // Check if this right value is already matched
    const isAlreadyMatched = Array.from(matchedPairs.values()).includes(value);
    if (isAlreadyMatched) return;
    
    setSelectedRight(value);
    setWrongAttempt(null);
    
    if (selectedLeft) {
      checkMatch(selectedLeft, value);
    }
  };
  
  const checkMatch = (left: string, right: string) => {
    const pair = pairs.find(p => p.left === left);
    const isCorrect = pair && pair.right === right;
    
    // Add rope connection
    const newConnection: RopeConnection = {
      leftId: left,
      rightId: right,
      isCorrect: !!isCorrect
    };
    
    if (isCorrect) {
      playCorrect();
      const newMatched = new Map(matchedPairs);
      newMatched.set(left, right);
      setMatchedPairs(newMatched);
      setRopeConnections(prev => [...prev, newConnection]);
      setSelectedLeft(null);
      setSelectedRight(null);
    } else {
      playIncorrect();
      setWrongAttempt({ left, right });
      
      // Show wrong rope briefly
      setRopeConnections(prev => [...prev, newConnection]);
      
      setTimeout(() => {
        setRopeConnections(prev => prev.filter(c => c !== newConnection));
        setSelectedLeft(null);
        setSelectedRight(null);
        setWrongAttempt(null);
      }, 800);
    }
  };
  
  const handleReset = () => {
    setMatchedPairs(new Map());
    setSelectedLeft(null);
    setSelectedRight(null);
    setWrongAttempt(null);
    setRopeConnections([]);
    // Gera novo seed para embaralhar de forma diferente
    setShuffleSeed(Date.now());
  };
  
  const isLeftMatched = (value: string) => matchedPairs.has(value);
  const isRightMatched = (value: string) => Array.from(matchedPairs.values()).includes(value);
  
  return (
    <div className="bg-card rounded-xl p-4 sm:p-6 border border-border">
      <div className="flex items-center gap-2 mb-2">
        <Link2 className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">{title}</h3>
      </div>
      
      {description && (
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
      )}
      
      <p className="text-sm text-muted-foreground mb-4">
        {t('lesson.matchWords.instructions', 'Conecte cada item da esquerda com seu par correto à direita!')}
      </p>
      
      {/* Match Grid with SVG Ropes */}
      <div ref={containerRef} className="relative grid grid-cols-2 gap-6 sm:gap-8">
        {/* SVG Layer for Ropes */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
          style={{ overflow: 'visible' }}
        >
          {ropePositions.map((pos, idx) => (
            <g key={idx}>
              {/* Rope shadow */}
              <path
                d={`M ${pos.x1} ${pos.y1} Q ${(pos.x1 + pos.x2) / 2} ${(pos.y1 + pos.y2) / 2 + 15} ${pos.x2} ${pos.y2}`}
                fill="none"
                stroke="rgba(0,0,0,0.2)"
                strokeWidth="6"
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Main rope */}
              <path
                d={`M ${pos.x1} ${pos.y1} Q ${(pos.x1 + pos.x2) / 2} ${(pos.y1 + pos.y2) / 2 + 12} ${pos.x2} ${pos.y2}`}
                fill="none"
                stroke={pos.isCorrect ? "hsl(var(--success))" : "hsl(var(--destructive))"}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={pos.isCorrect ? "none" : "8 4"}
                className={cn(
                  "transition-all duration-300",
                  !pos.isCorrect && "animate-pulse"
                )}
              />
              {/* Rope texture dots */}
              {pos.isCorrect && (
                <>
                  <circle cx={pos.x1 + 5} cy={pos.y1} r="3" fill="hsl(var(--success))" />
                  <circle cx={pos.x2 - 5} cy={pos.y2} r="3" fill="hsl(var(--success))" />
                </>
              )}
            </g>
          ))}
        </svg>
        
        {/* Left Column - Shuffled */}
        <div className="space-y-2 relative z-20">
          {shuffledLeft.map((value) => (
            <button
              key={value}
              data-left-id={value}
              onClick={() => handleLeftClick(value)}
              disabled={isLeftMatched(value)}
              className={cn(
                "w-full p-3 rounded-lg text-sm font-medium text-left transition-all",
                "border-2 relative",
                isLeftMatched(value)
                  ? "bg-success/20 border-success text-success cursor-default"
                  : selectedLeft === value
                  ? "bg-primary/20 border-primary text-primary scale-105 shadow-lg"
                  : wrongAttempt?.left === value
                  ? "bg-destructive/20 border-destructive text-destructive animate-shake"
                  : "bg-muted/50 border-transparent hover:border-primary/50 hover:bg-muted text-foreground"
              )}
            >
              {value}
              {/* Connection dot */}
              <span className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all",
                isLeftMatched(value) 
                  ? "bg-success border-success" 
                  : selectedLeft === value
                  ? "bg-primary border-primary animate-pulse"
                  : "bg-muted border-muted-foreground/30"
              )} />
            </button>
          ))}
        </div>
        
        {/* Right Column - Shuffled */}
        <div className="space-y-2 relative z-20">
          {shuffledRight.map((value) => (
            <button
              key={value}
              data-right-id={value}
              onClick={() => handleRightClick(value)}
              disabled={isRightMatched(value)}
              className={cn(
                "w-full p-3 rounded-lg text-sm font-medium text-left transition-all",
                "border-2 relative pl-6",
                isRightMatched(value)
                  ? "bg-success/20 border-success text-success cursor-default"
                  : selectedRight === value
                  ? "bg-primary/20 border-primary text-primary scale-105 shadow-lg"
                  : wrongAttempt?.right === value
                  ? "bg-destructive/20 border-destructive text-destructive animate-shake"
                  : "bg-muted/50 border-transparent hover:border-primary/50 hover:bg-muted text-foreground"
              )}
            >
              {/* Connection dot */}
              <span className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 transition-all",
                isRightMatched(value) 
                  ? "bg-success border-success" 
                  : selectedRight === value
                  ? "bg-primary border-primary animate-pulse"
                  : "bg-muted border-muted-foreground/30"
              )} />
              {value}
            </button>
          ))}
        </div>
      </div>
      
      {/* Progress */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {matchedPairs.size} / {pairs.length} {t('lesson.matchWords.matched', 'pares conectados')}
        </span>
        
        <div className="h-2 flex-1 mx-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-success transition-all duration-300"
            style={{ width: `${(matchedPairs.size / pairs.length) * 100}%` }}
          />
        </div>
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-2">
        {isCompleted ? (
          <Button onClick={onComplete} className="w-full h-12">
            <Check className="w-4 h-4 mr-2" />
            {t('common.continue')}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleReset} className="w-full h-12">
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('lesson.matchWords.reset', 'Recomeçar')}
          </Button>
        )}
      </div>
    </div>
  );
};