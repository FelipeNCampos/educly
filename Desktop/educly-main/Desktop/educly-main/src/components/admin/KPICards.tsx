import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
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
  Bug,
} from "lucide-react";
import { AdminKPICard } from "./AdminKPICard";
import { AdminSectionHeader } from "./AdminSectionHeader";

export const KPICards = () => {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ["admin-kpis"],
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

      const usersWithoutStreak = (totalUsers || 0) - totalStreaks;
      const activationRate = totalUsers && totalUsers > 0
        ? ((totalStreaks / totalUsers) * 100).toFixed(1)
        : 0;

      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const activeUsers = streakData?.filter(s => 
        s.last_activity_date && s.last_activity_date >= sevenDaysAgo
      ).length || 0;

      // Premium users
      const { count: premiumUsers } = await supabase
        .from("user_premium_access")
        .select("*", { count: "exact", head: true })
        .eq("is_premium", true);

      // Billing events
      const { data: billingEvents } = await supabase
        .from("billing_event_logs")
        .select("event_type, created_at, payload");

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

      // New purchases vs Renewals today logic
      const purchasesTodayData = billingEvents?.filter((e) => {
        const eventDate = e.created_at?.split("T")[0];
        const eventType = e.event_type.toUpperCase();
        return eventDate === today && (eventType.includes("SETTLED") || eventType.includes("APPROVED") || eventType.includes("COMPLETE"));
      }) || [];

      const newPurchasesToday = purchasesTodayData.filter((e) => {
        const payload = e.payload as any;
        return !payload || payload.subscription?.iteration === 1 || payload.oneoff || payload.data?.purchase?.recurrence_number === 1;
      }).length;

      const renewalsTodayCount = purchasesTodayData.filter((e) => {
        const payload = e.payload as any;
        return payload?.subscription?.iteration > 1 || payload?.data?.purchase?.recurrence_number > 1;
      }).length;

      // Product access
      const { data: productAccess } = await supabase
        .from("user_product_access")
        .select("user_id, product_type")
        .eq("is_active", true);

      const baseUsers = new Set(productAccess?.filter((p) => p.product_type === "base").map((p) => p.user_id)).size;
      const freelancerUsers = new Set(productAccess?.filter((p) => p.product_type === "freelancer").map((p) => p.user_id)).size;
      const aiHubUsers = new Set(productAccess?.filter((p) => p.product_type === "ai_hub").map((p) => p.user_id)).size;
      const totalProductUsers = new Set(productAccess?.map((p) => p.user_id)).size;

      const { count: completedDays } = await supabase
        .from("user_day_progress")
        .select("*", { count: "exact", head: true })
        .eq("completed", true);

      const retention = totalUsers && activeUsers ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0;

      // --- BUSCA O TOTAL DE BUGS NA TABELA CORRETA (user_bugs) ---
      const { count: totalBugs } = await supabase
        .from("user_bugs")
        .select("*", { count: "exact", head: true });

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
        totalBugs: totalBugs || 0,
      };
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Users Section */}
      <section>
        <AdminSectionHeader emoji="👥" title="Usuários" description="Métricas de aquisição e ativação" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard title="Total de Usuários" value={kpis?.totalUsers || 0} icon={<Users className="h-5 w-5" />} description={`+${kpis?.newWeek || 0} esta semana`} />
          <AdminKPICard title="Novos Hoje" value={kpis?.newToday || 0} icon={<UserPlus className="h-5 w-5" />} color="success" />
          <AdminKPICard title="Sem Atividade" value={kpis?.usersWithoutStreak || 0} icon={<UserX className="h-5 w-5" />} color={kpis?.usersWithoutStreak && kpis.usersWithoutStreak > 0 ? "warning" : "default"} />
          <AdminKPICard title="Taxa de Ativação" value={`${kpis?.activationRate || 0}%`} icon={<Activity className="h-5 w-5" />} />
        </div>
      </section>

      {/* Financial Section */}
      <section>
        <AdminSectionHeader emoji="💰" title="Financeiro" description="Receita e transações" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <AdminKPICard title="Usuários Premium" value={kpis?.premiumUsers || 0} icon={<Crown className="h-5 w-5" />} color="success" />
          <AdminKPICard title="Novos Hoje" value={kpis?.newPurchasesToday || 0} icon={<DollarSign className="h-5 w-5" />} color="success" />
          <AdminKPICard title="Renovações Hoje" value={kpis?.renewalsTodayCount || 0} icon={<DollarSign className="h-5 w-5" />} color="info" />
          <AdminKPICard title="Pagamentos" value={kpis?.settled || 0} icon={<DollarSign className="h-5 w-5" />} color="success" />
          <AdminKPICard title="Chargebacks" value={kpis?.chargebacks || 0} icon={<AlertTriangle className="h-5 w-5" />} color={kpis?.chargebacks && kpis.chargebacks > 0 ? "danger" : "default"} />
        </div>
      </section>

      {/* Problems Section */}
      <section>
        <AdminSectionHeader emoji="⚠️" title="Problemas" description="Métricas de atenção e falhas técnicas" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AdminKPICard
            title="Bugs Reportados"
            value={kpis?.totalBugs || 0}
            icon={<Bug className="h-5 w-5" />}
            color={kpis?.totalBugs && kpis.totalBugs > 0 ? "danger" : "default"}
            tooltip="Total de erros técnicos registrados silenciosamente"
          />
          <AdminKPICard
            title="Reembolsos"
            value={kpis?.refunds || 0}
            icon={<RefreshCw className="h-5 w-5" />}
            color={kpis?.refunds && kpis.refunds > 0 ? "warning" : "default"}
          />
        </div>
      </section>
    </div>
  );
};