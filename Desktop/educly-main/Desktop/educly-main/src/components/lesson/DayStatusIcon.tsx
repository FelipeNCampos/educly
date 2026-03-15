import { Check, Lock, Play, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayStatusIconProps {
  status: 'completed' | 'current' | 'unlocked' | 'locked';
  dayNumber?: number;
  themeColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DayStatusIcon = ({ 
  status, 
  dayNumber, 
  themeColor = '#6366f1', 
  size = 'md' 
}: DayStatusIconProps) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const textSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm'
  };

  return (
    <div className={cn(
      "relative rounded-full flex items-center justify-center transition-all duration-300",
      sizeClasses[size]
    )}>
      {/* Completed - Green with check and glow */}
      {status === 'completed' && (
        <>
          <div className={cn(
            "absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600",
            "shadow-lg shadow-emerald-300/50"
          )} />
          <div className="absolute inset-0 rounded-full bg-white/20 animate-pulse" />
          <Check className={cn(iconSizes[size], "relative z-10 text-white")} />
        </>
      )}

      {/* Current - Theme color with pulse and ping */}
      {status === 'current' && (
        <>
          <div 
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ backgroundColor: themeColor }}
          />
          <div 
            className={cn(
              "absolute inset-0 rounded-full",
              "shadow-lg"
            )}
            style={{ 
              backgroundColor: themeColor,
              boxShadow: `0 4px 14px ${themeColor}60`
            }}
          />
          <Play className={cn(iconSizes[size], "relative z-10 text-white fill-white")} />
          <span 
            className="absolute -top-1 -right-1 flex h-3 w-3"
          >
            <span 
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: themeColor }}
            />
            <span 
              className="relative inline-flex rounded-full h-3 w-3 bg-white border-2"
              style={{ borderColor: themeColor }}
            />
          </span>
        </>
      )}

      {/* Unlocked - Purple with star and dashed border */}
      {status === 'unlocked' && (
        <>
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-violet-100 to-purple-200",
            "border-2 border-dashed border-violet-400"
          )} />
          <Star className={cn(iconSizes[size], "relative z-10 text-violet-500")} />
        </>
      )}

      {/* Locked - Gray with lock and sparkle animation */}
      {status === 'locked' && (
        <>
          <div className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-br from-gray-200 to-gray-300"
          )} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent" />
          <Lock className={cn(iconSizes[size], "relative z-10 text-gray-400")} />
          <Sparkles 
            className={cn(
              "absolute -top-1 -right-1 w-3 h-3 text-amber-400",
              "animate-pulse opacity-60"
            )} 
          />
        </>
      )}
    </div>
  );
};
