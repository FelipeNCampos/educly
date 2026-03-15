import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserPlus,
  TrendingUp,
  Flame,
  Crown,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Package,
  Briefcase,
  Bot,
  CheckCircle2,
  UserX,
  Activity,
  Clock,
} from "lucide-react";
import { AdminKPICard } from "./AdminKPICard";
import { AdminSectionHeader } from "./AdminSectionHeader";

export const KPICards = () => {
  const { toast } = useToast();
  const [errorRangeDays, setErrorRangeDays] = useState("7");

  const errorRangeValue = Number(errorRangeDays);
  const errorRangeLabel = `${errorRangeValue}d`;

  // Função para exportar os dados do PRIMEIRO login para CSV
  const exportSessionsToCSV = async () => {
    try {
      const { data, error } = await supabase
        .from('user_session_details')
        .select('*');

      if (error) {
        console.error('Erro ao buscar dados para exportação:', error);
        toast({
          variant: "destructive",
          title: "Erro no relatório",
          description: "Verifique se a View foi criada no banco de dados."
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Sem dados",
          description: "Nenhum dado de primeiro acesso foi registrado ainda."
        });
        return;
      }

      // Cabeçalho da planilha
      const headers = "Nome,Email,Data Primeiro Acesso,Fim da Primeira Sessao,Minutos Ativos na Estreia\n";
      
      const csvContent = data.map(row => {
        const nome = (row.nome || 'Sem nome').replace(/,/g, '');
        const email = row.email || 'N/A';
        const inicio = row.inicio || '';
        const ultimo = row.ultimo_sinal || '';
        const minutos = row.minutos_ativos || 0;
        return `${nome},${email},${inicio},${ultimo},${minutos}`;
      }).join("\n");

      const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `primeiro_acesso_educly_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erro inesperado na exportação:', err);
    }
  };

  // Fetch all KPI data
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["admin-kpis", errorRangeDays],
    queryFn: async () => {
      // Total users
      const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // New users today
      const today = new Date().toISOString().split("T")[0];
      const { count: newToday } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", today);

      // New users this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: newWeek } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", weekAgo);

      // Streak stats
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_activity_date");

      const totalStreaks = streakData?.length || 0;
      const avgStreak = streakData?.length
        ? (streakData.reduce((acc, s) => acc + s.current_streak, 0) / streakData.length).toFixed(1)
        : 0;
      const maxStreak = streakData?.length
        ? Math.max(...streakData.map((s) => s.longest_streak))
        : 0;

      // Users without streak (created account but never did any activity)
      const usersWithoutStreak = (totalUsers || 0) - totalStreaks;

      // Activation rate (users who did at least one activity / total users)
      const activationRate = totalUsers && totalUsers > 0
        ? ((totalStreaks / totalUsers) * 100).toFixed(1)
        : 0;

      // Active users (7 dias) - using filter on the streakData we already have
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const activeUsers = streakData?.filter(s => 
        s.last_activity_date && s.last_activity_date >= sevenDaysAgo
      ).length || 0;

      // Premium users
      const { count: premiumUsers } = await supabase
        .from("user_premium_access")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true);

      // Billing events - include payload for iteration/recurrence detection
      const { data: billingEvents } = await supabase
        .from("billing_event_logs")
        .select("event_type, created_at, payload, status");

      const chargebacks = billingEvents?.filter((e) =>
        e.event_type.toUpperCase().includes("CHARGEBACK")
      ).length || 0;

      const refunds = billingEvents?.filter((e) =>
        e.event_type.toUpperCase().includes("REFUND")
      ).length || 0;


      const settled = billingEvents?.filter((e) =>
        e.event_type.toUpperCase().includes("SETTLED") ||
        e.event_type.toUpperCase().includes("APPROVED") ||
        e.event_type.toUpperCase().includes("COMPLETE")
      ).length || 0;

      // Filter payment events for today
      const purchasesTodayData = billingEvents?.filter((e) => {
        const eventDate = e.created_at?.split("T")[0];
        const eventType = e.event_type.toUpperCase();
        const isPaymentEvent = eventType.includes("SETTLED") || 
                               eventType.includes("APPROVED") || 
                               eventType.includes("COMPLETE");
        return eventDate === today && isPaymentEvent;
      }) || [];

      // New purchases today (iteration = 1 OR oneoff OR Hotmart recurrence_number = 1)
      const newPurchasesToday = purchasesTodayData.filter((e) => {
        const payload = e.payload as Record<string, unknown> | null;
        if (!payload) return true; // If no payload, count as new
        
        // Funnelfox: subscription with iteration = 1 (initial trial)
        const subscription = payload.subscription as Record<string, unknown> | undefined;
        const ffIteration = subscription?.iteration;
        if (ffIteration === 1) return true;
        
        // Funnelfox: oneoff (upsell/one-time purchase)
        if (payload.oneoff) return true;
        
        // Hotmart: recurrence_number = 1
        const data = payload.data as Record<string, unknown> | undefined;
        const purchase = data?.purchase as Record<string, unknown> | undefined;
        const hotmartRecurrence = purchase?.recurrence_number;
        if (hotmartRecurrence === 1) return true;
        
        // If no iteration/recurrence info, assume it's new
        if (!ffIteration && !hotmartRecurrence) return true;
        
        return false;
      }).length;

      // Renewals today (iteration > 1 OR Hotmart recurrence_number > 1)
      const renewalsTodayCount = purchasesTodayData.filter((e) => {
        const payload = e.payload as Record<string, unknown> | null;
        if (!payload) return false;
        
        // Funnelfox: iteration > 1 (renewal after trial)
        const subscription = payload.subscription as Record<string, unknown> | undefined;
        const ffIteration = subscription?.iteration as number | undefined;
        if (ffIteration && ffIteration > 1) return true;
        
        // Hotmart: recurrence_number > 1
        const data = payload.data as Record<string, unknown> | undefined;
        const purchase = data?.purchase as Record<string, unknown> | undefined;
        const hotmartRecurrence = purchase?.recurrence_number as number | undefined;
        if (hotmartRecurrence && hotmartRecurrence > 1) return true;
        
        return false;
      }).length;

      // Product access - count UNIQUE users per product type
      const { data: productAccess } = await supabase
        .from("user_product_access")
        .select("user_id, product_type")
        .eq("is_active", true);

      // Use Sets to count unique users per product type
      const baseUserIds = new Set(productAccess?.filter((p) => p.product_type === "base").map((p) => p.user_id));
      const freelancerUserIds = new Set(productAccess?.filter((p) => p.product_type === "freelancer").map((p) => p.user_id));
      const aiHubUserIds = new Set(productAccess?.filter((p) => p.product_type === "ai_hub").map((p) => p.user_id));

      const baseUsers = baseUserIds.size;
      const freelancerUsers = freelancerUserIds.size;
      const aiHubUsers = aiHubUserIds.size;

      // Total unique users with any product
      const allProductUserIds = new Set(productAccess?.map((p) => p.user_id));
      const totalProductUsers = allProductUserIds.size;

      // Completed days
      const { count: completedDays } = await supabase
        .from("user_day_progress")
        .select("*", { count: "exact", head: true })
        .eq("completed", true);

      // Retention rate
      const retention = totalUsers && activeUsers
        ? ((activeUsers / totalUsers) * 100).toFixed(1)
        : 0;

      // Average First Session Time (via RPC no banco)
      const { data: avgFirstSession } = await supabase
        .rpc('get_avg_first_session_minutes');

      const avgSessionMinutes = avgFirstSession
        ? Number(avgFirstSession).toFixed(1)
        : 0;

      const errorRangeStart = new Date(
        Date.now() - errorRangeValue * 24 * 60 * 60 * 1000
      ).toISOString();
      const errorsInRange = billingEvents?.filter((event) => {
        if (!event.created_at) return false;
        if (event.status !== "error") return false;
        return event.created_at >= errorRangeStart;
      }).length || 0;
      const avgErrorsPerDay = errorRangeValue > 0
        ? (errorsInRange / errorRangeValue).toFixed(2)
        : "0";

      return {
        totalUsers: totalUsers || 0,
        newToday: newToday || 0,
        newWeek: newWeek || 0,
        avgStreak,
        maxStreak,
        activeUsers,
        usersWithoutStreak,
        premiumUsers: premiumUsers || 0,
        chargebacks,
        refunds,
        
        settled,
        newPurchasesToday,
        renewalsTodayCount,
        baseUsers,
        freelancerUsers,
        aiHubUsers,
        totalProductUsers,
        completedDays: completedDays || 0,
        retention,
        activationRate,
        avgSessionMinutes,
        errorsInRange,
        avgErrorsPerDay,
      };
    },
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 5 }).map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-border/50 p-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Users Section */}
      <section>
        <AdminSectionHeader
          emoji="👥"
          title="Usuários"
          description="Métricas de aquisição e ativação"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Total de Usuários"
            value={kpis?.totalUsers || 0}
            icon={<Users className="h-5 w-5" />}
            description={`+${kpis?.newWeek || 0} esta semana`}
            tooltip="Total de perfis cadastrados na tabela 'profiles'"
          />
          <AdminKPICard
            title="Novos Hoje"
            value={kpis?.newToday || 0}
            icon={<UserPlus className="h-5 w-5" />}
            color="success"
            tooltip="Usuários com created_at >= hoje (00:00 UTC)"
          />
          <AdminKPICard
            title="Sem Atividade"
            value={kpis?.usersWithoutStreak || 0}
            icon={<UserX className="h-5 w-5" />}
            description={`${((kpis?.usersWithoutStreak || 0) / (kpis?.totalUsers || 1) * 100).toFixed(0)}% dos usuários`}
            color={kpis?.usersWithoutStreak && kpis.usersWithoutStreak > 0 ? "warning" : "default"}
            tooltip="Usuários que criaram conta mas nunca completaram nenhuma lição (sem registro em user_streaks)"
          />
          <AdminKPICard
            title="Taxa de Ativação"
            value={`${kpis?.activationRate || 0}%`}
            icon={<Activity className="h-5 w-5" />}
            description="Fizeram pelo menos 1 atividade"
            tooltip="% de usuários que têm registro em user_streaks (completaram pelo menos 1 lição)"
          />
        </div>
      </section>

      {/* Engagement Section */}
      <section>
        <AdminSectionHeader
          emoji="🔥"
          title="Engajamento"
          description="Streaks e atividade dos usuários"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Streak Médio"
            value={kpis?.avgStreak || 0}
            icon={<Flame className="h-5 w-5" />}
            description="dias consecutivos"
            tooltip="Média de current_streak de todos os registros em user_streaks"
          />
          <AdminKPICard
            title="Maior Streak"
            value={kpis?.maxStreak || 0}
            icon={<Flame className="h-5 w-5" />}
            color="success"
            tooltip="Valor máximo de longest_streak na tabela user_streaks"
          />
          <AdminKPICard
            title="Ativos (7 dias)"
            value={kpis?.activeUsers || 0}
            icon={<CheckCircle2 className="h-5 w-5" />}
            description={`${kpis?.retention}% retenção`}
            tooltip="Usuários com last_activity_date nos últimos 7 dias. Retenção = ativos / total de usuários."
          />
          <div onClick={exportSessionsToCSV} className="cursor-pointer transition-transform active:scale-95">
            <AdminKPICard
              title="Tempo 1º Login"
              value={`${kpis?.avgSessionMinutes || 0} min`}
              icon={<Clock className="h-5 w-5" />}
              color="info"
              description="CSV de Novos Usuários"
              tooltip="Clique para baixar o relatório de tempo do primeiro acesso"
            />
          </div>
          <AdminKPICard
            title="Dias Completados"
            value={kpis?.completedDays || 0}
            icon={<TrendingUp className="h-5 w-5" />}
            description="total de lições concluídas"
            tooltip="Total de registros com completed=true em user_day_progress"
          />
        </div>
      </section>

      {/* Financial Section */}
      <section>
        <AdminSectionHeader
          emoji="💰"
          title="Financeiro"
          description="Receita e transações"
        />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminKPICard
            title="Usuários Premium"
            value={kpis?.premiumUsers || 0}
            icon={<Crown className="h-5 w-5" />}
            color="success"
            tooltip="Total de registros com is_premium=true em user_premium_access"
          />
          <AdminKPICard
            title="Novos Hoje"
            value={kpis?.newPurchasesToday || 0}
            icon={<DollarSign className="h-5 w-5" />}
            description="Trials + upsells"
            color="success"
            tooltip="Pagamentos iniciais hoje: trials pagos (iteration=1), compras únicas (oneoff), ou primeira compra Hotmart (recurrence_number=1)"
          />
          <AdminKPICard
            title="Renovações Hoje"
            value={kpis?.renewalsTodayCount || 0}
            icon={<DollarSign className="h-5 w-5" />}
            description="Trials convertidos"
            color="info"
            tooltip="Renovações hoje: pagamentos onde iteration>1 (Funnelfox) ou recurrence_number>1 (Hotmart) - trials que converteram para preço cheio"
          />
          <AdminKPICard
            title="Pagamentos"
            value={kpis?.settled || 0}
            icon={<DollarSign className="h-5 w-5" />}
            description="SETTLED/APPROVED/COMPLETE"
            color="success"
            tooltip="Eventos de billing_event_logs com SETTLED, PURCHASE_APPROVED, ou PURCHASE_COMPLETE"
          />
          <AdminKPICard
            title="Chargebacks"
            value={kpis?.chargebacks || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            color={kpis?.chargebacks && kpis.chargebacks > 0 ? "danger" : "default"}
            tooltip="Eventos de billing_event_logs com event_type contendo 'chargeback'"
          />
        </div>
      </section>

      {/* Product Section */}
      <section>
        <AdminSectionHeader
          emoji="📦"
          title="Produtos"
          description="Distribuição por tipo de produto (usuários únicos)"
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Com Produto Ativo"
            value={kpis?.totalProductUsers || 0}
            icon={<Package className="h-5 w-5" />}
            description="usuários únicos"
            tooltip="Contagem de user_id únicos em user_product_access com is_active=true"
          />
          <AdminKPICard
            title="Base"
            value={kpis?.baseUsers || 0}
            icon={<Package className="h-5 w-5" />}
            color="success"
            tooltip="Usuários únicos com product_type='base' em user_product_access"
          />
          <AdminKPICard
            title="Freelancer"
            value={kpis?.freelancerUsers || 0}
            icon={<Briefcase className="h-5 w-5" />}
            color="info"
            tooltip="Usuários únicos com product_type='freelancer' em user_product_access"
          />
          <AdminKPICard
            title="AI Hub"
            value={kpis?.aiHubUsers || 0}
            icon={<Bot className="h-5 w-5" />}
            color="purple"
            tooltip="Usuários únicos com product_type='ai_hub' em user_product_access"
          />
        </div>
      </section>

      {/* Problems Section */}
      <section>
        <AdminSectionHeader
          emoji="⚠️"
          title="Problemas"
          description="Métricas de atenção"
          action={
            <Select value={errorRangeDays} onValueChange={setErrorRangeDays}>
              <SelectTrigger className="h-8 w-[130px] bg-white">
                <SelectValue placeholder="Periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Ultimos 1 dia</SelectItem>
                <SelectItem value="2">Ultimos 2 dias</SelectItem>
                <SelectItem value="3">Ultimos 3 dias</SelectItem>
                <SelectItem value="4">Ultimos 4 dias</SelectItem>
                <SelectItem value="5">Ultimos 5 dias</SelectItem>
                <SelectItem value="6">Ultimos 6 dias</SelectItem>
                <SelectItem value="7">Ultimos 7 dias</SelectItem>
                <SelectItem value="30">Ultimos 30 dias</SelectItem>
                <SelectItem value="60">Ultimos 60 dias</SelectItem>
                <SelectItem value="90">Ultimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Reembolsos"
            value={kpis?.refunds || 0}
            icon={<RefreshCw className="h-5 w-5" />}
            color={kpis?.refunds && kpis.refunds > 0 ? "warning" : "default"}
            tooltip="Eventos de billing_event_logs com event_type contendo 'refund'"
          />
          <AdminKPICard
            title="Logs de Erro (Cashrate)"
            value={kpis?.errorsInRange || 0}
            icon={<AlertTriangle className="h-5 w-5" />}
            color={kpis?.errorsInRange && kpis.errorsInRange > 0 ? "danger" : "default"}
            description={`Periodo: ${errorRangeLabel}`}
            tooltip="Total de eventos em billing_event_logs com status='error' no periodo selecionado"
          />
          <AdminKPICard
            title="Media de Erros"
            value={kpis?.avgErrorsPerDay || 0}
            icon={<Activity className="h-5 w-5" />}
            color={kpis?.avgErrorsPerDay && Number(kpis.avgErrorsPerDay) > 0 ? "warning" : "default"}
            description={`${errorRangeLabel} (erros/dia)`}
            tooltip="Media diaria de erros no periodo selecionado"
          />
        </div>
      </section>
    </div>
  );
};
