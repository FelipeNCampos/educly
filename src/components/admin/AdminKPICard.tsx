import { ReactNode } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface AdminKPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  tooltip?: string;
  className?: string;
}

export const AdminKPICard = ({
  title,
  value,
  icon,
  description,
  color = "default",
  tooltip,
  className,
}: AdminKPICardProps) => {
  const colorConfig = {
    default: {
      bg: "bg-gradient-to-br from-slate-50 to-slate-100/80",
      border: "border-slate-200/60",
      iconBg: "bg-slate-100",
      iconColor: "text-slate-600",
      valueColor: "text-slate-900",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/80",
      border: "border-emerald-200/60",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-50 to-amber-100/80",
      border: "border-amber-200/60",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
    danger: {
      bg: "bg-gradient-to-br from-red-50 to-red-100/80",
      border: "border-red-200/60",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      valueColor: "text-red-700",
    },
    info: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100/80",
      border: "border-blue-200/60",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100/80",
      border: "border-purple-200/60",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      valueColor: "text-purple-700",
    },
  };

  const config = colorConfig[color];

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]",
        config.bg,
        config.border,
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider truncate">
              {title}
            </span>
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help flex-shrink-0 hover:text-muted-foreground transition-colors" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="top">
                    <p className="text-xs leading-relaxed">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <p className={cn(
            "text-3xl font-bold tracking-tight transition-transform group-hover:scale-[1.02]",
            config.valueColor
          )}>
            {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
          </p>
          
          {description && (
            <p className="text-xs text-muted-foreground/80 line-clamp-1">
              {description}
            </p>
          )}
        </div>
        
        <div className={cn(
          "flex-shrink-0 p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110",
          config.iconBg,
          config.iconColor
        )}>
          {icon}
        </div>
      </div>
    </div>
  );
};
