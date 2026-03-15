import { ReactNode } from "react";
import { Info, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminDataTableProps {
  title: string;
  emoji?: string;
  description?: string;
  tooltip?: string;
  children: ReactNode;
  isLoading?: boolean;
  onRefresh?: () => void;
  className?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
}

export const AdminDataTable = ({
  title,
  emoji,
  description,
  tooltip,
  children,
  isLoading,
  onRefresh,
  className,
  emptyMessage = "Nenhum dado disponível",
  isEmpty,
}: AdminDataTableProps) => {
  if (isLoading) {
    return (
      <div className={cn(
        "rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden",
        className
      )}>
        <div className="p-5 border-b border-border/30">
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="p-5">
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden",
      "hover:shadow-md hover:border-border/80 transition-all duration-300",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-border/30 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="flex items-center gap-2">
          {emoji && (
            <span className="text-lg">{emoji}</span>
          )}
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-semibold text-foreground">
                {title}
              </h4>
              {tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-sm">
                      <p className="text-xs">{tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
        
        {onRefresh && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="p-5">
        {isEmpty ? (
          <div className="py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <span className="text-2xl opacity-50">📊</span>
            </div>
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};
