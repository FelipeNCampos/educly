import { useEffect, useState } from "react";
import { TutorialSpotlight, TutorialStep } from "./TutorialSpotlight";

const FREELANCER_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    messageKey: "tutorial.freelancer.welcome",
  },
  {
    id: "modules",
    messageKey: "tutorial.freelancer.modules",
    targetId: "freelancer-modules",
    mascotPosition: "bottom",
  },
  {
    id: "module-click",
    messageKey: "tutorial.freelancer.moduleClick",
    targetId: "freelancer-module-1",
    mascotPosition: "right",
    allowClick: true,
  },
  {
    id: "finish",
    messageKey: "tutorial.freelancer.finish",
  },
];

export const FreelancerTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const dashboardDone = localStorage.getItem("tutorial_dashboard");
    const freelancerDone = localStorage.getItem("tutorial_freelancer");
    
    if (dashboardDone === "true" && freelancerDone !== "true") {
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  return (
    <TutorialSpotlight
      steps={FREELANCER_STEPS}
      storageKey="freelancer"
      onComplete={() => setShowTutorial(false)}
      isVisible={showTutorial}
    />
  );
};
