import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdminChartCard } from "./AdminChartCard";

export const EngagementChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["admin-engagement-chart"],
    queryFn: async () => {
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("current_streak");

      const distribution = {
        "0": 0,
        "1-3": 0,
        "4-7": 0,
        "8-14": 0,
        "15+": 0,
      };

      streaks?.forEach((s) => {
        const streak = s.current_streak;
        if (streak === 0) distribution["0"]++;
        else if (streak <= 3) distribution["1-3"]++;
        else if (streak <= 7) distribution["4-7"]++;
        else if (streak <= 14) distribution["8-14"]++;
        else distribution["15+"]++;
      });

      return [
        { name: "0 dias", value: distribution["0"], fill: "#ef4444" },
        { name: "1-3 dias", value: distribution["1-3"], fill: "#f59e0b" },
        { name: "4-7 dias", value: distribution["4-7"], fill: "#3b82f6" },
        { name: "8-14 dias", value: distribution["8-14"], fill: "#10b981" },
        { name: "15+ dias", value: distribution["15+"], fill: "#8b5cf6" },
      ];
    },
    refetchInterval: 300000,
  });

  return (
    <AdminChartCard
      title="Distribuição de Streaks"
      emoji="🔥"
      isLoading={isLoading}
    >
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted/50" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            width={35}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
                    <p className="font-semibold text-sm text-foreground">{data.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {data.value} usuários
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </AdminChartCard>
  );
};
