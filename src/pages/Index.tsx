import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { LandingHero } from "@/components/LandingHero";

const Index = () => {
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef(theme);

  useEffect(() => {
    previousThemeRef.current = theme;
    if (theme !== "light") {
      setTheme("light");
    }
    return () => {
      if (previousThemeRef.current !== "light") {
        setTheme(previousThemeRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen">
      <LandingHero />
    </div>
  );
};

export default Index;
