import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from 'react-i18next';
import challengeInicianteImg from "@/assets/challenge-iniciante-ia.png";

interface ChallengeCardProps {
  name: string;
  description: string;
  difficulty: string;
  duration: number;
  progress?: number;
  imageUrl?: string;
  gradientFrom?: string;
  gradientTo?: string;
  onClick: () => void;
  delay?: number;
  illustration?: 'challenge-1' | 'challenge-2' | 'challenge-3';
}

// Simple SVG illustrations matching Coursiv style
const ChallengeIllustration = ({ type }: { type: string }) => {
  if (type === 'challenge-1') {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-full">
        {/* Background shapes */}
        <rect x="20" y="30" width="160" height="80" rx="8" fill="#EEF2FF" />
        {/* Abstract elements - circles, lines */}
        <circle cx="60" cy="70" r="25" fill="#C7D2FE" />
        <circle cx="100" cy="55" r="15" fill="#A5B4FC" />
        <circle cx="140" cy="75" r="20" fill="#818CF8" opacity="0.6" />
        {/* Decorative lines */}
        <path d="M30 100 Q70 80 110 90 T180 85" stroke="#6366F1" strokeWidth="2" fill="none" strokeDasharray="4 4" />
        {/* Stars */}
        <path d="M150 40 l2 5 5 0 -4 3 2 5 -5 -3 -5 3 2 -5 -4 -3 5 0z" fill="#A5B4FC" />
        <path d="M45 95 l1.5 3.5 3.5 0 -3 2.5 1.5 3.5 -3.5 -2.5 -3.5 2.5 1.5 -3.5 -3 -2.5 3.5 0z" fill="#C7D2FE" />
        {/* Robot/AI face */}
        <rect x="85" y="58" width="30" height="24" rx="4" fill="#6366F1" />
        <circle cx="93" cy="68" r="3" fill="white" />
        <circle cx="107" cy="68" r="3" fill="white" />
        <rect x="92" y="75" width="16" height="2" rx="1" fill="white" />
      </svg>
    );
  }

  if (type === 'challenge-2') {
    return (
      <svg viewBox="0 0 200 140" className="w-full h-full">
        {/* Background */}
        <rect x="20" y="30" width="160" height="80" rx="8" fill="#F3E8FF" />
        {/* Person silhouette */}
        <ellipse cx="70" cy="90" rx="20" ry="25" fill="#E9D5FF" />
        <circle cx="70" cy="55" r="15" fill="#D8B4FE" />
        {/* Chat bubbles */}
        <rect x="100" y="40" width="60" height="25" rx="12" fill="#A855F7" />
        <rect x="110" y="75" width="50" height="20" rx="10" fill="#C084FC" />
        {/* Sparkles */}
        <path d="M170 50 l2 4 4 0 -3 3 2 4 -4 -2 -4 2 2 -4 -3 -3 4 0z" fill="#A855F7" />
        <path d="M40 45 l1.5 3 3 0 -2.5 2.5 1.5 3 -3 -2 -3 2 1.5 -3 -2.5 -2.5 3 0z" fill="#D8B4FE" />
        {/* Connection dots */}
        <circle cx="135" cy="52" r="3" fill="white" />
        <circle cx="145" cy="52" r="2" fill="white" opacity="0.7" />
        <circle cx="153" cy="52" r="1.5" fill="white" opacity="0.5" />
      </svg>
    );
  }

  // Default: challenge-3 (money/freelance themed)
  return (
    <svg viewBox="0 0 200 140" className="w-full h-full">
      {/* Background */}
      <rect x="20" y="30" width="160" height="80" rx="8" fill="#ECFDF5" />
      {/* Laptop */}
      <rect x="60" y="55" width="80" height="50" rx="4" fill="#D1FAE5" />
      <rect x="65" y="60" width="70" height="35" rx="2" fill="#6EE7B7" />
      {/* Screen content - lines */}
      <rect x="72" y="68" width="30" height="3" rx="1" fill="white" />
      <rect x="72" y="75" width="45" height="3" rx="1" fill="white" />
      <rect x="72" y="82" width="25" height="3" rx="1" fill="white" />
      {/* Money symbols */}
      <circle cx="45" cy="50" r="12" fill="#34D399" />
      <text x="45" y="55" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">$</text>
      <circle cx="155" cy="60" r="10" fill="#10B981" />
      <text x="155" y="64" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">$</text>
      {/* Arrow up */}
      <path d="M160 85 L160 100 M155 90 L160 85 L165 90" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Stars */}
      <path d="M50 90 l1 2.5 2.5 0 -2 2 1 2.5 -2.5 -1.5 -2.5 1.5 1 -2.5 -2 -2 2.5 0z" fill="#6EE7B7" />
    </svg>
  );
};

const getIllustration = (slug: string): 'challenge-1' | 'challenge-2' | 'challenge-3' => {
  if (slug?.includes('iniciante') || slug?.includes('chatgpt') || slug?.includes('claude')) {
    return 'challenge-1';
  }
  if (slug?.includes('sistema') || slug?.includes('personalizado') || slug?.includes('lovable')) {
    return 'challenge-2';
  }
  return 'challenge-3';
};

export const ChallengeCard = ({
  name,
  description,
  difficulty,
  duration,
  progress = 0,
  onClick,
  delay = 0
}: ChallengeCardProps) => {
  const { t } = useTranslation();
  const isStarted = progress > 0;

  // Determine illustration based on name
  const illustrationType = name.toLowerCase().includes('iniciante') || name.toLowerCase().includes('chatgpt') 
    ? 'challenge-1' 
    : name.toLowerCase().includes('sistema') || name.toLowerCase().includes('trilha')
    ? 'challenge-2'
    : 'challenge-3';

  return (
    <div
      onClick={onClick}
      className={cn(
        "group bg-card border border-border rounded-xl overflow-hidden cursor-pointer",
        "transition-all duration-200 hover:shadow-lg hover:border-primary/20",
        "animate-fade-in-up"
      )}
      style={{ animationDelay: `${delay * 100}ms` }}
    >
      {/* Illustration Area */}
      <div className="h-32 bg-muted overflow-hidden">
        {illustrationType === 'challenge-1' ? (
          <img 
            src={challengeInicianteImg} 
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ChallengeIllustration type={illustrationType} />
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-3 text-muted-foreground text-sm">
          <span>{duration} {t('challenge.days')}</span>
          <span>•</span>
          <span className="capitalize">
            {difficulty === 'iniciante' ? t('difficulty.iniciante') : 
             difficulty === 'intermediario' ? t('difficulty.intermediario') : t('difficulty.avancado')}
          </span>
        </div>

        {/* Progress Bar (only if started) */}
        {isStarted && (
          <div className="mt-3">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};