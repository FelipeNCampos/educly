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

interface LTVDataItem {
  month: number;
  label: string;
  users: number;
  color: string;
}

const getMonthColor = (iteration: number): string => {
  const realMonth = iteration - 1;
  if (realMonth === 2) return "#4ade80"; // 2º mês - Verde claro
  if (realMonth === 3) return "#22c55e"; // 3º mês - Verde médio
  if (realMonth === 4) return "#16a34a"; // 4º mês - Verde
  return "#15803d"; // 5º+ mês - Verde escuro
};

export const LTVRetentionChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["admin-ltv-retention"],
    queryFn: async () => {
      const { data: events } = await supabase
        .from("billing_event_logs")
        .select("email, event_type, payload");

      if (!events) return [];

      // Agrupar por mês de iteração
      const monthCounts: Record<number, Set<string>> = {};

      events.forEach((event) => {
        const eventType = event.event_type.toUpperCase();
        
        // Filtrar apenas eventos de pagamento confirmado
        if (
          !eventType.includes("SETTLED") &&
          !eventType.includes("APPROVED") &&
          !eventType.includes("COMPLETE") &&
          !eventType.includes("RENEWING") &&
          !eventType.includes("RECOVERING")
        ) {
          return;
        }

        // Extrair iteration do payload
        let iteration = 1;
        const payload = event.payload as Record<string, unknown> | null;
        
        if (payload) {
          // Funnelfox: payload.subscription.iteration
          const subscription = payload.subscription as Record<string, unknown> | undefined;
          if (subscription?.iteration) {
            iteration = Number(subscription.iteration);
          }
          // Hotmart: payload.data.purchase.recurrence_number
          else {
            const data = payload.data as Record<string, unknown> | undefined;
            const purchase = data?.purchase as Record<string, unknown> | undefined;
            if (purchase?.recurrence_number) {
              iteration = Number(purchase.recurrence_number);
            }
          }
        }

        // Somente iteration >= 3 (renovações reais - 2º mês em diante)
        // iteration 1 = trial, iteration 2 = 1ª cobrança, iteration 3 = 2º mês
        if (iteration >= 3) {
          if (!monthCounts[iteration]) {
            monthCounts[iteration] = new Set();
          }
          monthCounts[iteration].add(event.email.toLowerCase());
        }
      });

      // Converter para array ordenado - iteration 3 = 2º mês, iteration 4 = 3º mês, etc.
      const result: LTVDataItem[] = Object.entries(monthCounts)
        .map(([iteration, emails]) => {
          const iterNum = Number(iteration);
          const realMonth = iterNum - 1; // iteration - 1 = mês real
          return {
            month: iterNum,
            label: `${realMonth}º Mês`,
            users: emails.size,
            color: getMonthColor(iterNum),
          };
        })
        .sort((a, b) => a.month - b.month);

      return result;
    },
    refetchInterval: 300000,
  });

  const isEmpty = !chartData || chartData.length === 0;

  return (
    <AdminChartCard
      title="LTV - Retenção por Mês"
      emoji="💎"
      tooltip="Usuários únicos que renovaram assinatura em cada mês. Quanto mais meses, maior o LTV. Baseado em iteration (Funnelfox) ou recurrence_number (Hotmart)."
      isLoading={isLoading}
    >
      {isEmpty ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <span className="text-2xl opacity-50">💎</span>
            </div>
            <p className="text-sm text-muted-foreground">Nenhuma renovação registrada ainda</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Usuários aparecem aqui a partir da 1ª renovação (2º mês)
            </p>
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
              dataKey="label"
              tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              width={70}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as LTVDataItem;
                  const realMonth = data.month - 1; // iteration - 1 = mês real
                  const prevIteration = chartData?.find(d => d.month === data.month - 1);
                  const retentionRate = prevIteration 
                    ? Math.round((data.users / prevIteration.users) * 100) 
                    : null;
                  
                  return (
                    <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
                      <p className="font-semibold text-sm text-foreground">{data.label}</p>
                      <p className="text-lg font-bold mt-1">{data.users} usuários</p>
                      {retentionRate !== null && (
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {retentionRate}% de retenção vs mês anterior
                        </p>
                      )}
                      <p className="text-xs text-emerald-600 mt-1">
                        ✓ Renovaram {realMonth - 1}x
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="users" radius={[0, 6, 6, 0]} barSize={24}>
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
