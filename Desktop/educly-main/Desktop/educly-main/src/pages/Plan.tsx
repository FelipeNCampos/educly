import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, Circle, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Plan = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Buscar todas as trilhas e progresso
  const { data: trailsData } = useQuery({
    queryKey: ['all-trails-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Buscar todas as ferramentas
      const { data: tools, error: toolsError } = await supabase
        .from('ai_tools')
        .select('*')
        .order('name');

      if (toolsError) throw toolsError;

      // Para cada ferramenta, buscar fases e progresso
      const trailsWithProgress = await Promise.all(
        tools.map(async (tool) => {
          // Buscar fases
          const { data: phases } = await supabase
            .from('trail_phases')
            .select('id')
            .eq('ai_tool_id', tool.id);

          const totalPhases = phases?.length || 0;

          // Buscar progresso
          const phaseIds = phases?.map(p => p.id) || [];
          if (phaseIds.length === 0) {
            return {
              ...tool,
              totalPhases,
              completedPhases: 0,
              status: 'not-started' as const,
              progressPercentage: 0
            };
          }

          const { data: progress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .in('phase_id', phaseIds)
            .eq('completed', true);

          const completedPhases = progress?.length || 0;
          const progressPercentage = totalPhases > 0 
            ? Math.round((completedPhases / totalPhases) * 100)
            : 0;

          let status: 'not-started' | 'in-progress' | 'completed' = 'not-started';
          if (completedPhases === totalPhases && totalPhases > 0) {
            status = 'completed';
          } else if (completedPhases > 0) {
            status = 'in-progress';
          }

          return {
            ...tool,
            totalPhases,
            completedPhases,
            status,
            progressPercentage
          };
        })
      );

      return trailsWithProgress;
    }
  });

  const notStarted = trailsData?.filter(t => t.status === 'not-started') || [];
  const inProgress = trailsData?.filter(t => t.status === 'in-progress') || [];
  const completed = trailsData?.filter(t => t.status === 'completed') || [];

  const totalCompleted = trailsData?.reduce((acc, t) => acc + t.completedPhases, 0) || 0;
  const totalPhases = trailsData?.reduce((acc, t) => acc + t.totalPhases, 0) || 0;
  const overallProgress = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-primary" />;
      case 'in-progress':
        return <Circle className="w-5 h-5 text-blue-400 animate-pulse" />;
      default:
        return <Lock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('plan.backButton')}
          </Button>

          <div className="glass rounded-xl p-8 neon-border">
            <h1 className="text-4xl md:text-5xl font-bold neon-glow mb-4">
              {t('plan.title')}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {t('plan.subtitle')}
            </p>

            {/* Progresso Geral */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('plan.overallProgress')}</span>
                <span className="text-primary font-semibold">
                  {totalCompleted}/{totalPhases} {t('plan.phases')} ({overallProgress}%)
                </span>
              </div>
              <div className="w-full h-4 bg-card rounded-full overflow-hidden neon-border">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 neon-glow"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-primary neon-glow">
                {completed.length}
              </CardTitle>
              <CardDescription>{t('plan.completedTrails')}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-blue-400">
                {inProgress.length}
              </CardTitle>
              <CardDescription>{t('plan.inProgressTrails')}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="glass neon-border">
            <CardHeader>
              <CardTitle className="text-3xl text-muted-foreground">
                {notStarted.length}
              </CardTitle>
              <CardDescription>{t('plan.availableTrails')}</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Trilhas Concluídas */}
        {completed.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-primary neon-glow">
              {t('plan.completedSection')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass neon-border cursor-pointer hover-lift"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('plan.progress')}</span>
                        <span className="text-primary font-semibold">
                          {trail.completedPhases}/{trail.totalPhases}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${trail.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trilhas em Progresso */}
        {inProgress.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-blue-400">
              {t('plan.inProgressSection')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgress.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass neon-border cursor-pointer hover-lift hover-glow"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('plan.progress')}</span>
                        <span className="text-blue-400 font-semibold">
                          {trail.completedPhases}/{trail.totalPhases}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all duration-300"
                          style={{ width: `${trail.progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Trilhas Não Iniciadas */}
        {notStarted.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4 text-muted-foreground">
              {t('plan.availableSection')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notStarted.map((trail) => (
                <Card
                  key={trail.id}
                  className="glass border-border/50 cursor-pointer hover-lift"
                  onClick={() => navigate(`/trilha/${trail.slug}`)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-xl">{trail.name}</CardTitle>
                      {getStatusIcon(trail.status)}
                    </div>
                    <CardDescription>{trail.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" className="w-full">
                      {t('plan.startTrailButton')}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plan;
