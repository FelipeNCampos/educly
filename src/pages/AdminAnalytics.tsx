import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shield, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { AdminGuard } from "@/components/AdminGuard";
import { KPICards } from "@/components/admin/KPICards";
import { UserGrowthChart } from "@/components/admin/UserGrowthChart";
import { ProductDistributionChart } from "@/components/admin/ProductDistributionChart";
import { BillingEventsChart } from "@/components/admin/BillingEventsChart";
import { LTVRetentionChart } from "@/components/admin/LTVRetentionChart";
import { EngagementChart } from "@/components/admin/EngagementChart";
import { CancellationsTable } from "@/components/admin/CancellationsTable";
import { TopStreaksTable } from "@/components/admin/TopStreaksTable";
import { BillingLogsTable } from "@/components/admin/BillingLogsTable";
import { PremiumUsersTable } from "@/components/admin/PremiumUsersTable";
import { ManualMetricsForm } from "@/components/admin/ManualMetricsForm";
import { ManualAccessGrant } from "@/components/admin/ManualAccessGrant";
import { EmailLookup } from "@/components/admin/EmailLookup";

const AdminAnalyticsContent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-kpis"] });
    queryClient.invalidateQueries({ queryKey: ["admin-user-growth"] });
    queryClient.invalidateQueries({ queryKey: ["admin-product-distribution"] });
    queryClient.invalidateQueries({ queryKey: ["admin-billing-events-chart"] });
    queryClient.invalidateQueries({ queryKey: ["admin-ltv-retention"] });
    queryClient.invalidateQueries({ queryKey: ["admin-engagement-chart"] });
    queryClient.invalidateQueries({ queryKey: ["admin-cancellations"] });
    queryClient.invalidateQueries({ queryKey: ["admin-top-streaks"] });
    queryClient.invalidateQueries({ queryKey: ["admin-billing-logs"] });
    queryClient.invalidateQueries({ queryKey: ["admin-premium-users"] });
    queryClient.invalidateQueries({ queryKey: ["admin-manual-metrics"] });
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/dashboard")}
                className="rounded-xl hover:bg-slate-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-md">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    Painel Administrativo
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Métricas e análises em tempo real
                  </p>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshAll}
              className="rounded-xl border-border/50 hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Email Lookup */}
        <EmailLookup />

        {/* KPI Cards */}
        <KPICards />

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserGrowthChart />
          <ProductDistributionChart />
          <BillingEventsChart />
          <LTVRetentionChart />
          <EngagementChart />
        </div>

        {/* Tables with Tabs */}
        <Tabs defaultValue="billing" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger 
              value="billing" 
              className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              📋 Billing Logs
            </TabsTrigger>
            <TabsTrigger 
              value="cancellations" 
              className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              ⚠️ Cancelamentos
            </TabsTrigger>
            <TabsTrigger 
              value="streaks" 
              className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              🏆 Top Streaks
            </TabsTrigger>
            <TabsTrigger 
              value="premium" 
              className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              👑 Premium
            </TabsTrigger>
            <TabsTrigger 
              value="grant-access" 
              className="rounded-lg text-xs font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              🔓 Liberar Acesso
            </TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <TabsContent value="billing" className="m-0">
              <BillingLogsTable />
            </TabsContent>
            <TabsContent value="cancellations" className="m-0">
              <CancellationsTable />
            </TabsContent>
            <TabsContent value="streaks" className="m-0">
              <TopStreaksTable />
            </TabsContent>
            <TabsContent value="premium" className="m-0">
              <PremiumUsersTable />
            </TabsContent>
            <TabsContent value="grant-access" className="m-0">
              <ManualAccessGrant />
            </TabsContent>
          </div>
        </Tabs>

        {/* Manual Metrics */}
        <ManualMetricsForm />
      </div>
    </div>
  );
};

const AdminAnalytics = () => {
  return (
    <AdminGuard>
      <AdminAnalyticsContent />
    </AdminGuard>
  );
};

export default AdminAnalytics;
