import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase, 
  Video, 
  Palette, 
  Mic, 
  Code, 
  Headphones, 
  Languages,
  ExternalLink,
  LucideIcon
} from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description?: string;
  hourly_rate: number;
  currency: string;
  platform?: string;
  external_url?: string;
  category?: string;
  icon_name?: string;
}

interface JobCardProps {
  job: Job;
}

const iconMap: Record<string, LucideIcon> = {
  Briefcase,
  Video,
  Palette,
  Mic,
  Code,
  Headphones,
  Languages,
};

export const JobCard = ({ job }: JobCardProps) => {
  const { t } = useTranslation();
  const Icon = iconMap[job.icon_name || 'Briefcase'] || Briefcase;

  const handleApply = () => {
    if (job.external_url) {
      window.open(job.external_url, '_blank');
    }
  };

  const formatCurrency = (rate: number, currency: string) => {
    const symbols: Record<string, string> = {
      EUR: '€',
      USD: '$',
      BRL: 'R$',
      GBP: '£'
    };
    return `${symbols[currency] || currency}${rate}`;
  };

  return (
    <Card className="group relative overflow-hidden border border-primary/20 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary transition-transform duration-300 group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{job.title}</h3>
            {job.platform && (
              <p className="text-sm text-muted-foreground">{job.platform}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30">
            {formatCurrency(job.hourly_rate, job.currency)}{t('jobs.perHour')}
          </Badge>
          <Button 
            size="sm" 
            onClick={handleApply}
            className="gap-2 bg-primary/90 hover:bg-primary"
          >
            {t('jobs.applyButton')}
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
