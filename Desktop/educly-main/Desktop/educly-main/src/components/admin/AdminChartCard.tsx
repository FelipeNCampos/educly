import { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminChartCardProps {
  title: string;
  emoji?: string;
  tooltip?: string;
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
  action?: ReactNode;
}

export const AdminChartCard = ({
  title,
  emoji,
  tooltip,
  children,
  isLoading,
  className,
  action,
}: AdminChartCardProps) => {
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-2xl border border-border/50 bg-card p-5 shadow-sm",
        className
      )}>
        <Skeleton className="h-5 w-40 mb-4" />
        <Skeleton className="h-[250px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className={cn(
      "group rounded-2xl border border-border/50 bg-card p-5 shadow-sm",
      "hover:shadow-md hover:border-border/80 transition-all duration-300",
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {emoji && (
            <span className="text-lg">{emoji}</span>
          )}
          <h4 className="text-sm font-semibold text-foreground">
            {title}
          </h4>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm" side="top">
                  <p className="text-xs leading-relaxed">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      
      <div className="relative">
        {children}
      </div>
    </div>
  );
};
