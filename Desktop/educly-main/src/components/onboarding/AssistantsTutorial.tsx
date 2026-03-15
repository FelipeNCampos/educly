import { useEffect, useState } from "react";
import { TutorialSpotlight, TutorialStep } from "./TutorialSpotlight";

const ASSISTANTS_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    messageKey: "tutorial.assistants.welcome",
  },
  {
    id: "cards",
    messageKey: "tutorial.assistants.cards",
    targetId: "assistants-grid",
    mascotPosition: "bottom",
  },
  {
    id: "card-click",
    messageKey: "tutorial.assistants.cardClick",
    targetId: "assistant-card-0",
    mascotPosition: "right",
    allowClick: true,
  },
  {
    id: "finish",
    messageKey: "tutorial.assistants.finish",
  },
];

export const AssistantsTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const dashboardDone = localStorage.getItem("tutorial_dashboard");
    const assistantsDone = localStorage.getItem("tutorial_assistants");
    
    if (dashboardDone === "true" && assistantsDone !== "true") {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  return (
    <TutorialSpotlight
      steps={ASSISTANTS_STEPS}
      storageKey="assistants"
      onComplete={() => setShowTutorial(false)}
      isVisible={showTutorial}
    />
  );
};
