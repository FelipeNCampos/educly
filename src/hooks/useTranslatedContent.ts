import { useTranslation } from 'react-i18next';

export const useTranslatedContent = () => {
  const { t } = useTranslation();

  const getToolName = (slug: string): string => {
    return t(`aiTools.${slug}.name`, { defaultValue: slug });
  };

  const getToolDescription = (slug: string): string => {
    return t(`aiTools.${slug}.description`, { defaultValue: '' });
  };

  const getPhaseTitle = (slug: string, phaseNumber: number): string => {
    return t(`aiTools.${slug}.phases.${phaseNumber}.title`, { defaultValue: '' });
  };

  const getPhaseDescription = (slug: string, phaseNumber: number): string => {
    return t(`aiTools.${slug}.phases.${phaseNumber}.description`, { defaultValue: '' });
  };

  const getPhaseTask = (slug: string, phaseNumber: number): string => {
    return t(`aiTools.${slug}.phases.${phaseNumber}.task`, { defaultValue: '' });
  };

  const getPhaseContent = (slug: string, phaseNumber: number) => ({
    title: getPhaseTitle(slug, phaseNumber),
    description: getPhaseDescription(slug, phaseNumber),
    task: getPhaseTask(slug, phaseNumber)
  });

  const getTranslatedPhases = (slug: string, phases: Array<{
    id: string;
    phase_number: number;
    title: string;
    description: string;
    video_url: string | null;
    task_description: string;
  }>) => {
    return phases.map(phase => ({
      ...phase,
      title: getPhaseTitle(slug, phase.phase_number) || phase.title,
      description: getPhaseDescription(slug, phase.phase_number) || phase.description,
      task_description: getPhaseTask(slug, phase.phase_number) || phase.task_description
    }));
  };

  return {
    getToolName,
    getToolDescription,
    getPhaseTitle,
    getPhaseDescription,
    getPhaseTask,
    getPhaseContent,
    getTranslatedPhases
  };
};
