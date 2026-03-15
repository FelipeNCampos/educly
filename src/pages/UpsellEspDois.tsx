import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { useHotmartCheckout } from "@/hooks/useHotmartCheckout";
import { useTranslation } from "react-i18next";

const UpsellEspDois = () => {
    const { theme, setTheme } = useTheme();
    const previousThemeRef = useRef(theme);
    const { t } = useTranslation();

    // Força o tema claro para a página de vendas
    useEffect(() => {
        previousThemeRef.current = theme;
        if (theme !== "light") setTheme("light");
        return () => {
            if (previousThemeRef.current !== "light") setTheme(previousThemeRef.current);
        };
    }, []);

    // Script do Player Vturb - UPSELL 2
    useEffect(() => {
        const script = document.createElement("script");
        // URL específica do Upsell 2
        script.src = "https://scripts.converteai.net/36124149-fb5f-4577-852d-90288afff251/players/697a74a9a3ec0f5fa32af5da/v4/player.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // Hotmart checkout widget
    useHotmartCheckout();


    // Lógica de Delay - 170 segundos para o Upsell 2
    useEffect(() => {
        const delaySeconds = 170;
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

    return (
        <div className="min-h-screen bg-white flex flex-col items-center px-4 py-6">
            <div className="w-full max-w-[400px] flex flex-col items-center">

                {/* Espaçamento para o topo */}
                <div className="mb-8" />

                {/* Título de Atenção */}
                <h2 className="text-xl font-bold text-black text-center mb-4">
                    {t("downsell.upsellPage2.title")}
                </h2>

                {/* Vturb Player - ID do Upsell 2 */}
                <div className="w-full mb-6">
                    {/* @ts-ignore */}
                    <vturb-smartplayer
                        id="vid-697a74a9a3ec0f5fa32af5da"
                        style={{
                            display: "block",
                            margin: "0 auto",
                            width: "100%",
                            maxWidth: "400px"
                        }}
                    />
                </div>

                {/* Widget da Hotmart (Aparece após 170s) */}
                <div
                    id="hotmart-sales-funnel"
                    className="w-full esconder"
                    style={{ display: "none" }}
                />
            </div>
        </div>
    );
};

export default UpsellEspDois;