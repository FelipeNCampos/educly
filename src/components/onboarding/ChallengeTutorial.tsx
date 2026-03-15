import { useEffect, useState } from "react";
import { TutorialSpotlight, TutorialStep } from "./TutorialSpotlight";

const CHALLENGE_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    messageKey: "tutorial.challenge.welcome",
  },
  {
    id: "trophy",
    messageKey: "tutorial.challenge.trophy",
    targetId: "trophy-card",
    mascotPosition: "right",
  },
  {
    id: "tools",
    messageKey: "tutorial.challenge.tabs",
    targetId: "challenge-tabs",
    mascotPosition: "bottom",
  },
  {
    id: "days-bar",
    messageKey: "tutorial.challenge.daysBar",
    targetId: "days-progress-bar",
    mascotPosition: "bottom",
  },
  {
    id: "day-card",
    messageKey: "tutorial.challenge.dayCard",
    targetId: "current-day-card",
    mascotPosition: "left",
    allowClick: true,
  },
  {
    id: "finish",
    messageKey: "tutorial.challenge.finish",
  },
];

export const ChallengeTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Only show if main dashboard tutorial is completed
    const dashboardDone = localStorage.getItem("tutorial_dashboard");
    const challengeDone = localStorage.getItem("tutorial_challenge");
    
    if (dashboardDone === "true" && challengeDone !== "true") {
      // Small delay to let the page render
      setTimeout(() => setShowTutorial(true), 500);
    }
  }, []);

  return (
    <TutorialSpotlight
      steps={CHALLENGE_STEPS}
      storageKey="challenge"
      onComplete={() => setShowTutorial(false)}
      isVisible={showTutorial}
    />
  );
};
