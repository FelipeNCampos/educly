import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePremiumAccess } from '@/hooks/usePremiumAccess';
import { JobCard } from '@/components/JobCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Sparkles, Lock } from 'lucide-react';

const Jobs = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isPremium, isLoading: premiumLoading, checkoutUrl } = usePremiumAccess();

  // Check auth
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  // Fetch jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: isPremium,
  });

  const isLoading = premiumLoading || (isPremium && jobsLoading);

  // Premium gate
  if (!premiumLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto max-w-4xl px-4 py-8">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('common.back')}
          </Button>

          {/* Locked state */}
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 animate-pulse">
              <Lock className="h-12 w-12 text-amber-400" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {t('jobs.premium.title')}
            </h1>
            <p className="mb-6 max-w-md text-muted-foreground">
              {t('jobs.premium.description')}
            </p>
            <Button
              onClick={() => window.open(checkoutUrl, '_blank')}
              className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              <Lock className="h-4 w-4" />
              {t('jobs.premium.unlockButton')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Button>

        {/* Header */}
        <header className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-purple-500/20 to-amber-500/20 p-8 text-center">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-6 left-10 h-3 w-3 animate-pulse rounded-full bg-primary" />
            <div className="absolute top-12 right-16 h-2 w-2 animate-pulse rounded-full bg-purple-400" style={{ animationDelay: '0.5s' }} />
            <div className="absolute bottom-8 left-20 h-2 w-2 animate-pulse rounded-full bg-amber-400" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-6 right-24 h-3 w-3 animate-pulse rounded-full bg-green-400" style={{ animationDelay: '0.3s' }} />
          </div>
          
          <div className="relative">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-purple-500 shadow-lg shadow-primary/30">
                <Briefcase className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-foreground">
              {t('jobs.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('jobs.subtitle')}
            </p>
          </div>
        </header>

        {/* Jobs list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : jobs && jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">
              {t('jobs.noJobs')}
            </h2>
            <p className="max-w-md text-muted-foreground">
              {t('jobs.noJobsDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;
