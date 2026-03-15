import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertTriangle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminDataTable } from "./AdminDataTable";
import { cn } from "@/lib/utils";

export const BillingLogsTable = () => {
  const { data: billingLogs, isLoading, refetch } = useQuery({
    queryKey: ["admin-billing-logs"],
    queryFn: async () => {
      const { data } = await supabase
        .from("billing_event_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);

      return data || [];
    },
    refetchInterval: 30000,
  });

  // Health check: eventos pendentes
  const { data: healthStats } = useQuery({
    queryKey: ["admin-billing-health"],
    queryFn: async () => {
      const { data: pending } = await supabase
        .from("billing_event_logs")
        .select("id, status, created_at")
        .eq("processed", false)
        .in("status", ["pending", "USER_NOT_FOUND"]);

      const now = new Date();
      const oldPending = (pending || []).filter(p => {
        const created = new Date(p.created_at);
        const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return hoursAgo > 24;
      });

      return {
        totalPending: pending?.length || 0,
        oldPending: oldPending.length,
        userNotFound: (pending || []).filter(p => p.status === "USER_NOT_FOUND").length
      };
    },
    refetchInterval: 60000,
  });

  const getEventBadge = (eventType: string) => {
    const type = eventType.toUpperCase();
    const config: Record<string, { bg: string; text: string; label: string }> = {
      paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Pago" },
      trial: { bg: "bg-blue-100", text: "text-blue-700", label: "Trial" },
      chargeback: { bg: "bg-red-100", text: "text-red-700", label: "Chargeback" },
      refund: { bg: "bg-amber-100", text: "text-amber-700", label: "Reembolso" },
      granted: { bg: "bg-purple-100", text: "text-purple-700", label: "Upsell" },
    };

    let key = "default";
    if (type.includes("SETTLED") || type.includes("APPROVED") || type.includes("COMPLETE")) key = "paid";
    else if (type.includes("TRIAL")) key = "trial";
    else if (type.includes("CHARGEBACK") || type.includes("DISPUTE")) key = "chargeback";
    else if (type.includes("REFUND")) key = "refund";
    else if (type.includes("GRANTED")) key = "granted";

    if (key === "default") {
      return <Badge variant="outline" className="text-xs font-medium bg-white">{eventType}</Badge>;
    }

    const style = config[key];
    return (
      <Badge className={`${style.bg} ${style.text} hover:${style.bg} border-0 font-medium text-xs`}>
        {style.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string, processed: boolean | null) => {
    if (processed && status === "success") {
      return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 text-xs">✓ Processado</Badge>;
    }
    if (processed) {
      return <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 text-xs">Processado</Badge>;
    }
    if (status === "USER_NOT_FOUND") {
      return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 text-xs">⏳ Aguardando</Badge>;
    }
    if (status === "pending") {
      return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-0 text-xs">Pendente</Badge>;
    }
    if (status === "error") {
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 text-xs">Erro</Badge>;
    }
    if (status === "IGNORED") {
      return <Badge variant="outline" className="text-xs text-muted-foreground bg-white">Ignorado</Badge>;
    }
    return <Badge variant="outline" className="text-xs bg-white">{status}</Badge>;
  };

  const getSourceBadge = (payload: any) => {
    const source = payload?._webhook_source;
    if (source === "hotmart") {
      return <Badge variant="outline" className="text-xs border-orange-200 text-orange-600 bg-orange-50">Hotmart</Badge>;
    }
    if (source === "funnelfox") {
      return <Badge variant="outline" className="text-xs border-blue-200 text-blue-600 bg-blue-50">FF/Primer</Badge>;
    }
    return null;
  };

  const getProductInfo = (payload: any) => {
    const info = payload?._extraction_info;
    if (info?.product_id) {
      const type = info.product_id === "7031196" || info.product_id?.includes("freelancer") ? "Freelancer" : "Base";
      return <span className="text-xs text-muted-foreground">{type}</span>;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Health Check Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className={cn(
          "rounded-xl border p-4 flex items-center gap-3 transition-colors",
          healthStats?.oldPending && healthStats.oldPending > 0 
            ? "border-red-200 bg-red-50" 
            : "border-border/50 bg-card"
        )}>
          {healthStats?.oldPending && healthStats.oldPending > 0 ? (
            <div className="p-2 rounded-lg bg-red-100">
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-emerald-100">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          )}
          <div>
            <p className="text-xs text-muted-foreground">Pendentes &gt;24h</p>
            <p className="text-lg font-bold">{healthStats?.oldPending || 0}</p>
          </div>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Clock className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Aguardando Signup</p>
            <p className="text-lg font-bold">{healthStats?.userNotFound || 0}</p>
          </div>
        </div>
        
        <div className="rounded-xl border border-border/50 bg-card p-4 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100">
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Pendente</p>
            <p className="text-lg font-bold">{healthStats?.totalPending || 0}</p>
          </div>
        </div>
      </div>

      {/* Billing Logs Table */}
      <AdminDataTable
        title="Eventos de Billing"
        emoji="📋"
        description="Últimos 30 eventos • Atualiza a cada 30s"
        isLoading={isLoading}
        onRefresh={refetch}
        isEmpty={!billingLogs || billingLogs.length === 0}
        emptyMessage="Nenhum evento de billing registrado"
      >
        <div className="overflow-x-auto -mx-5">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-5">Data</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fonte</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evento</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Produto</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-5">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingLogs?.map((log) => (
                <TableRow 
                  key={log.id} 
                  className={cn(
                    "border-b border-border/30 hover:bg-muted/30",
                    !log.processed && log.status === "USER_NOT_FOUND" && "bg-amber-50/50"
                  )}
                >
                  <TableCell className="text-sm whitespace-nowrap py-3 pl-5">
                    {log.created_at
                      ? format(new Date(log.created_at), "dd/MM HH:mm", {
                          locale: ptBR,
                        })
                      : "-"}
                  </TableCell>
                  <TableCell className="text-sm font-medium truncate max-w-[140px]" title={log.email}>
                    {log.email}
                  </TableCell>
                  <TableCell>{getSourceBadge(log.payload)}</TableCell>
                  <TableCell>{getEventBadge(log.event_type)}</TableCell>
                  <TableCell>{getProductInfo(log.payload)}</TableCell>
                  <TableCell className="pr-5">{getStatusBadge(log.status, log.processed)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </AdminDataTable>
    </div>
  );
};
