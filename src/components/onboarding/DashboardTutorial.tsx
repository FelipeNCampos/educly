import { useEffect, useState, useLayoutEffect } from "react";
import { X, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

import mascoteImg from "@/assets/mascote-atividade.png";

const STEPS = [
  {
    targetId: "weekly-streak",
    title: "Sequência Semanal 🔥",
    description: "Mantenha o ritmo! Estude todos os dias para aumentar seu fogo e ganhar bônus.",
  },
  {
    targetId: "active-challenge",
    title: "Seu Desafio Atual 🚀",
    description: "Continue sua jornada exatamente de onde parou. Clique aqui para a próxima aula.",
  },
  {
    targetId: "card-0",
    title: "Missões Diárias 🎯",
    description: "Tarefas rápidas para você ganhar XP e subir de nível na plataforma.",
  },
  {
    targetId: "card-1",
    title: "Assistentes de IA 🤖",
    description: "Precisa de ajuda? Nossos tutores virtuais tiram suas dúvidas 24h por dia.",
  },
  {
    targetId: "card-2",
    title: "Hub Freelancer 💼",
    description: "Encontre oportunidades reais de trabalho e aplique seu conhecimento.",
  },
  {
    targetId: "card-3",
    title: "Trilha Personalizada 🗺️",
    description: "Um mapa de aprendizado criado exclusivamente para seus objetivos.",
  },
];

export const DashboardTutorial = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  // Estado para controlar se a imagem deu erro ao carregar
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const currentStep = STEPS[currentStepIndex];

  // Tutorial aparece apenas no primeiro acesso
  useEffect(() => {
    const hasSeen = localStorage.getItem("has_seen_dashboard_tutorial_v12");
    if (hasSeen) return;

    const timer = setTimeout(() => setIsVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Bloqueia scroll durante o tutorial
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  useLayoutEffect(() => {
    if (!isVisible) return;

    const updatePosition = () => {
      const element = document.getElementById(currentStep.targetId);

      if (element) {
        // Scroll suave para centralizar o elemento
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "center",
        });

        const rect = element.getBoundingClientRect();
        setTargetRect({
          x: rect.x,
          y: rect.y,
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
          bottom: rect.bottom + 4,
          right: rect.right + 4,
        } as DOMRect);
      }
    };

    const timer = setTimeout(updatePosition, 400);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      clearTimeout(timer);
    };
  }, [isVisible, currentStepIndex, currentStep.targetId]);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      handleClose();
      toast({
        title: "Tutorial Concluído! 🎓",
        description: "Agora é com você. Bons estudos!",
      });
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("has_seen_dashboard_tutorial_v12", "true");
  };

  if (!isVisible || !targetRect) return null;

  const isMobile = window.innerWidth < 768;
  const isLastStep = currentStepIndex === STEPS.length - 1;

  // Estilos do Balão (Fixo no mobile, Flutuante no desktop)
  const popoverStyle: React.CSSProperties = isMobile
    ? {
        position: "fixed",
        bottom: "24px",
        left: "16px",
        right: "16px",
        width: "auto",
        zIndex: 9999,
        maxWidth: "100%",
      }
    : {
        position: "absolute",
        top: targetRect.top,
        left: targetRect.left + targetRect.width + 24,
        width: "380px",
        zIndex: 9999,
      };

  if (!isMobile && targetRect.left + targetRect.width + 400 > window.innerWidth) {
    popoverStyle.left = targetRect.left - 400;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden font-sans pointer-events-none">
      {/* MÁSCARA ESCURA (Fundo) */}
      <div
        className="absolute inset-0 transition-all duration-500 ease-in-out pointer-events-auto"
        style={{
          top: targetRect.top,
          left: targetRect.left,
          width: targetRect.width,
          height: targetRect.height,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.8)",
          borderRadius: "24px",
        }}
      >
        <div className="absolute inset-0 rounded-3xl border-[3px] border-orange-500 animate-pulse" />
      </div>

      <div className="absolute inset-0 pointer-events-auto" onClick={handleClose} />

      {/* BALÃO DE CONTEÚDO */}
      <div
        // 'overflow-visible' é importante para a imagem poder "sair" do balão no desktop
        className="bg-white text-gray-900 rounded-[24px] shadow-2xl p-5 border border-white/20 animate-in fade-in slide-in-from-bottom-6 duration-500 pointer-events-auto overflow-visible"
        style={popoverStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 p-1 bg-gray-100 rounded-full z-20"
        >
          <X size={18} />
        </button>

        <div className="flex gap-4 items-start relative">
          {/* --- ÁREA DA IMAGEM DO MASCOTE --- */}
          <div
            className={`flex-shrink-0 relative z-10 transition-all ${isMobile ? "w-14 h-14" : "w-20 h-20 -mt-8 -ml-6"}`}
          >
            {!imageError ? (
              <img
                src={mascoteImg}
                alt="Mascote"
                className="w-full h-full object-contain filter drop-shadow-lg"
                onError={(e) => {
                  console.error("Erro ao carregar imagem do mascote:", e);
                  setImageError(true);
                }}
              />
            ) : (
              // Fallback elegante: Ícone do Robô se a imagem falhar
              <div className="w-full h-full bg-orange-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm">
                <Bot className={`${isMobile ? "w-6 h-6" : "w-8 h-8"} text-orange-600`} />
              </div>
            )}
          </div>

          <div className="flex-1 pt-1">
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 leading-tight">{currentStep.title}</h3>
              <p className="text-sm font-medium text-gray-600 leading-relaxed mt-1.5">{currentStep.description}</p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4">
              <div className="flex gap-1">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStepIndex ? "w-6 bg-orange-500" : "w-1.5 bg-gray-200"}`}
                  />
                ))}
              </div>

              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-5 h-9 font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                onClick={handleNext}
              >
                {isLastStep ? "Concluir" : "Próximo"}
                {!isLastStep && <ArrowRight size={14} className="ml-1.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
