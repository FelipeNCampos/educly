import { Brain, Briefcase, Home, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/assistentes", label: "Hub IA", icon: Brain },
  { to: "/freelancer", label: "Freelancer", icon: Briefcase },
  { to: "/profile", label: "Perfil", icon: User },
];

export const MobileNav = () => {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/90 backdrop-blur-md md:hidden pb-safe">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex w-full flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs font-medium text-muted-foreground transition-colors"
              activeClassName={cn("text-primary", "bg-primary/10")}
              aria-label={item.label}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
