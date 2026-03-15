import { Play, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayStatusIcon } from "./lesson/DayStatusIcon";

interface DayNode {
  id: string;
  dayNumber: number;
  title: string;
  aiToolName: string;
  aiToolSlug?: string;
  aiToolLogo?: string | null;
  status: "completed" | "current" | "unlocked" | "locked";
  themeColor: string;
}

interface ChallengePathProps {
  days: DayNode[];
  onDayClick: (dayId: string) => void;
}

export const ChallengePath = ({ days, onDayClick }: ChallengePathProps) => {
  return (
    <div className="relative py-4">
      {/* Connection Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2" />

      {/* Days */}
      <div className="relative space-y-4">
        {days.map((day, index) => {
          const isEven = index % 2 === 0;

          return (
            <div
              key={day.id}
              className={cn("relative flex items-center gap-4", isEven ? "flex-row" : "flex-row-reverse")}
            >
              {/* Content Card */}
              <div className={cn("flex-1 max-w-[calc(50%-2rem)]", isEven ? "text-right" : "text-left")}>
                <button
                  onClick={() => day.status !== "locked" && onDayClick(day.id)}
                  disabled={day.status === "locked"}
                  className={cn(
                    "w-full p-4 rounded-xl border transition-all duration-200",
                    "text-left",
                    day.status === "locked"
                      ? "bg-muted/50 border-border cursor-not-allowed opacity-60"
                      : "bg-card border-border hover:shadow-lg hover:scale-[1.02] cursor-pointer",
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Day Status Icon */}
                    <DayStatusIcon
                      status={day.status}
                      dayNumber={day.dayNumber}
                      themeColor={day.themeColor}
                      size="lg"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* AI Tool Logo or Placeholder */}
                        {day.aiToolLogo ? (
                          <img src={day.aiToolLogo} alt={day.aiToolName} className="w-5 h-5 object-contain" />
                        ) : day.aiToolSlug === "elevenlabs" ? (
                          <Mic className="w-4 h-4" style={{ color: day.themeColor }} />
                        ) : null}
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: `${day.themeColor}20`,
                            color: day.themeColor,
                          }}
                        >
                          {day.aiToolName}
                        </span>
                      </div>
                      <h4
                        className={cn(
                          "font-medium truncate",
                          day.status === "locked" ? "text-muted-foreground" : "text-foreground",
                        )}
                      >
                        {day.title}
                      </h4>
                    </div>

                    {/* Status Icon */}
                    {day.status === "current" && (
                      <Play className="w-5 h-5 shrink-0" style={{ color: day.themeColor }} />
                    )}
                  </div>
                </button>
              </div>

              {/* Center Node */}
              <div className="absolute left-1/2 -translate-x-1/2 z-10">
                <DayStatusIcon status={day.status} dayNumber={day.dayNumber} themeColor={day.themeColor} size="sm" />
              </div>

              {/* Spacer for opposite side */}
              <div className="flex-1 max-w-[calc(50%-2rem)]" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
