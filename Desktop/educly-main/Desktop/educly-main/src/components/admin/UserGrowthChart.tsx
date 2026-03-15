import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminChartCard } from "./AdminChartCard";

export const UserGrowthChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["admin-user-growth"],
    queryFn: async () => {
      // Get users created in the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString();
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: true });

      // Group by date
      const groupedByDate: Record<string, number> = {};
      
      // Initialize all 30 days with 0
      for (let i = 29; i >= 0; i--) {
        const date = format(subDays(new Date(), i), "yyyy-MM-dd");
        groupedByDate[date] = 0;
      }

      // Count users per day
      profiles?.forEach((profile) => {
        if (profile.created_at) {
          const date = profile.created_at.split("T")[0];
          if (groupedByDate[date] !== undefined) {
            groupedByDate[date]++;
          }
        }
      });

      // Convert to array and calculate cumulative
      let cumulative = 0;
      const result = Object.entries(groupedByDate).map(([date, count]) => {
        cumulative += count;
        return {
          date,
          novos: count,
          total: cumulative,
          label: format(parseISO(date), "dd/MM", { locale: ptBR }),
        };
      });

      return result;
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  return (
    <AdminChartCard
      title="Crescimento de Usuários (30 dias)"
      emoji="📈"
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <defs>
            <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-sm mt-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-primary mr-2" />
                      Novos: <span className="font-semibold">{payload[0].value}</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="novos"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ 
              r: 6, 
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 2
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
};
