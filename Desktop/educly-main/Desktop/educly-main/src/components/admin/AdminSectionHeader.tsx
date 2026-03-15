import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AdminSectionHeaderProps {
  emoji: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const AdminSectionHeader = ({
  emoji,
  title,
  description,
  action,
  className,
}: AdminSectionHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-xl">
          {emoji}
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};
