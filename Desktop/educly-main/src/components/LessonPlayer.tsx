import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ContentStep } from "./ContentStep";
import { QuizStep } from "./QuizStep";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { Button } from "./ui/button";
import { useTranslation } from 'react-i18next';

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface LessonStep {
  id: string;
  step_number: number;
  step_type: string;
  title: string;
  content: string | null;
  image_url: string | null;
  quiz_question: string | null;
  quiz_options: QuizOption[] | null;
  quiz_feedback: string | null;
}

interface LessonPlayerProps {
  phaseId: string;
  onComplete: () => void;
}

export const LessonPlayer = ({ phaseId, onComplete }: LessonPlayerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Fetch lesson steps
  const { data: steps, isLoading } = useQuery({
    queryKey: ['lesson-steps', phaseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('phase_id', phaseId)
        .order('step_number', { ascending: true });

      if (error) throw error;
      
      // Parse quiz_options from JSON
      return (data || []).map(step => ({
        ...step,
        quiz_options: step.quiz_options as unknown as QuizOption[] | null
      })) as LessonStep[];
    }
  });

  // Mark step as completed
  const completeStepMutation = useMutation({
    mutationFn: async (stepId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_step_progress')
        .upsert({
          user_id: user.id,
          step_id: stepId,
          completed: true,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-step-progress'] });
    }
  });

  const handleNext = async () => {
    if (!steps) return;

    const currentStep = steps[currentStepIndex];
    
    // Mark current step as completed
    await completeStepMutation.mutateAsync(currentStep.id);

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      // Lesson complete
      onComplete();
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!steps || steps.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground text-center mb-4">
          {t('lesson.noContent')}
        </p>
        <Button onClick={handleClose} variant="outline">
          {t('common.back')}
        </Button>
      </div>
    );
  }

  const currentStep = steps[currentStepIndex];

  return (
    <div className="relative">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-50"
        onClick={handleClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {currentStep.step_type === 'content' ? (
        <ContentStep
          title={currentStep.title}
          content={currentStep.content || ''}
          imageUrl={currentStep.image_url}
          onContinue={handleNext}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
        />
      ) : (
        <QuizStep
          question={currentStep.quiz_question || ''}
          options={currentStep.quiz_options || []}
          feedback={currentStep.quiz_feedback || t('lesson.tryAgainFeedback')}
          onComplete={handleNext}
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
        />
      )}
    </div>
  );
};
