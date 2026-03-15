import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { useHotmartCheckout } from "@/hooks/useHotmartCheckout";
import { useTranslation } from "react-i18next";
const UpsellEsp = () => {
  const {
    theme,
    setTheme
  } = useTheme();
  const { t } = useTranslation();
  const previousThemeRef = useRef(theme);
  useEffect(() => {
    previousThemeRef.current = theme;
    if (theme !== "light") setTheme("light");
    return () => {
      if (previousThemeRef.current !== "light") setTheme(previousThemeRef.current);
    };
  }, []);
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://scripts.converteai.net/36124149-fb5f-4577-852d-90288afff251/players/696bb53810d72bdc9f335bde/v4/player.js";
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);
  // Hotmart checkout widget
  useHotmartCheckout();


  // Delay: hide sales funnel until 210s of video playback
  useEffect(() => {
    const delaySeconds = 210;
    const setupDelay = () => {
      const player = document.querySelector("vturb-smartplayer");
      if (player) {
        (player as any).addEventListener("player:ready", function () {
          (player as any).displayHiddenElements(delaySeconds, [".esconder"], {
            persist: true
          });
        });
      }
    };
    const timer = setTimeout(setupDelay, 1000);
    return () => clearTimeout(timer);
  }, []);
  return <div className="min-h-screen bg-white flex flex-col items-center px-4 py-6">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold tracking-tight text-gray-800 mb-4">

        </h1>

        {/* Progress bar - 3 segments */}
        <div className="w-full flex items-center gap-2 mb-8">



        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-black text-center mb-4">
          {t("downsell.upsellPage1.title")}
        </h2>

        {/* Stop icon + warning */}
        <div className="flex items-center gap-2 mb-6">


        </div>

        {/* Vturb Player */}
        <div className="w-full mb-6">
          {/* @ts-ignore */}
          <vturb-smartplayer id="vid-696bb53810d72bdc9f335bde" style={{
          display: "block",
          margin: "0 auto",
          width: "100%",
          maxWidth: "400px"
        }} />
        </div>

        {/* Hotmart Sales Funnel Widget */}
        <div id="hotmart-sales-funnel" className="w-full esconder" style={{
        display: "none"
      }} />
      </div>
    </div>;
};
export default UpsellEsp;