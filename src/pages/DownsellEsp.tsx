import { useEffect, useRef } from "react";
import { useTheme } from "@/components/theme-provider";
import { useHotmartCheckout } from "@/hooks/useHotmartCheckout";
import { useTranslation } from "react-i18next";

const DownsellEsp = () => {
    const {
        theme,
        setTheme
    } = useTheme();
    const { t } = useTranslation();
    const previousThemeRef = useRef(theme);

    // Forçar tema claro (Light Mode) ao entrar na página
    useEffect(() => {
        previousThemeRef.current = theme;
        if (theme !== "light") setTheme("light");
        return () => {
            // Restaura o tema anterior ao sair
            if (previousThemeRef.current !== "light") setTheme(previousThemeRef.current);
        };
    }, []);

    // Script do Player Vturb (ID ATUALIZADO PARA DOWNSELL)
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://scripts.converteai.net/36124149-fb5f-4577-852d-90288afff251/players/6985081cd5ae9a7c5fda0649/v4/player.js";
        script.async = true;
        document.head.appendChild(script);
        return () => {
            document.head.removeChild(script);
        };
    }, []);

    // Hotmart checkout widget
    useHotmartCheckout();


    // Delay: ocultar funil até 150s (ATUALIZADO)
    useEffect(() => {
        const delaySeconds = 150;
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

                {/* Espaçamento de Topo */}
                <div className="mb-4"></div>

                {/* Título Principal */}
                <h2 className="text-xl font-bold text-black text-center mb-2">
                    <span>{t("downsell.title")}</span>
                </h2>

                {/* Subtítulo / Instrução */}
                <p className="text-gray-700 text-center text-sm mb-6 px-2">

                </p>

                {/* Vturb Player (ID ATUALIZADO) */}
                <div className="w-full mb-6">
                    {/* @ts-ignore */}
                    <vturb-smartplayer
                        id="vid-6985081cd5ae9a7c5fda0649"
                        style={{
                            display: "block",
                            margin: "0 auto",
                            width: "100%",
                            maxWidth: "400px"
                        }}
                    />
                </div>

                {/* Hotmart Sales Funnel Widget */}
                <div
                    id="hotmart-sales-funnel"
                    className="w-full esconder"
                    style={{ display: "none" }}
                />
            </div>
        </div>
    );
};

export default DownsellEsp;