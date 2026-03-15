import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { AdminChartCard } from "./AdminChartCard";

const COLORS = {
  settled: "#10b981",
  trial: "#3b82f6",
  chargeback: "#ef4444",
  refund: "#f59e0b",
  granted: "#8b5cf6",
};

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  description: string;
}

export const BillingEventsChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["admin-billing-events-chart"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("billing_event_logs")
        .select("event_type");

      const counts: Record<string, number> = {
        Pagamentos: 0,
        Trials: 0,
        Chargebacks: 0,
        Reembolsos: 0,
        Concessoes: 0,
      };

      events?.forEach((e) => {
        const type = e.event_type.toUpperCase();
        if (type.includes("SETTLED") || type.includes("APPROVED") || type.includes("COMPLETE")) {
          counts.Pagamentos++;
        } else if (type.includes("TRIAL")) {
          counts.Trials++;
        } else if (type.includes("CHARGEBACK")) {
          counts.Chargebacks++;
        } else if (type.includes("REFUND")) {
          counts.Reembolsos++;
        } else if (type === "GRANTED") {
          counts.Concessoes++;
        }
      });

      return [
        { 
          name: "Pagamentos", 
          value: counts.Pagamentos, 
          color: COLORS.settled,
          description: "SETTLED + PURCHASE_APPROVED + PURCHASE_COMPLETE"
        },
        { 
          name: "Trials", 
          value: counts.Trials, 
          color: COLORS.trial,
          description: "STARTING_TRIAL (via webhooks de pagamento)"
        },
        { 
          name: "Chargebacks", 
          value: counts.Chargebacks, 
          color: COLORS.chargeback,
          description: "PURCHASE_CHARGEBACK"
        },
        { 
          name: "Reembolsos", 
          value: counts.Reembolsos, 
          color: COLORS.refund,
          description: "PURCHASE_REFUNDED"
        },
        { 
          name: "Concessões", 
          value: counts.Concessoes, 
          color: COLORS.granted,
          description: "GRANTED (acesso concedido manualmente)"
        },
      ].filter(item => item.value > 0) as ChartDataItem[];
    },
    refetchInterval: 300000,
  });

  const isEmpty = !chartData || chartData.length === 0;

  return (
    <AdminChartCard
      title="Eventos de Billing"
      emoji="💳"
      tooltip="Contagem de eventos em billing_event_logs agrupados por categoria: Pagamentos (SETTLED, APPROVED, COMPLETE), Trials (STARTING_TRIAL), Chargebacks, Reembolsos, Concessões (GRANTED manual)"
      isLoading={isLoading}
    >
      {isEmpty ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <span className="text-2xl opacity-50">💳</span>
            </div>
            <p className="text-sm text-muted-foreground">Nenhum evento de billing registrado</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" horizontal={false} />
            <XAxis 
              type="number" 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataItem;
                  return (
                    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
                      <p className="font-semibold text-sm text-foreground">{data.name}</p>
                      <p className="text-lg font-bold mt-1">{data.value} eventos</p>
                      <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px]">
                        {data.description}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
              {chartData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </AdminChartCard>
  );
};
