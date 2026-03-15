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
import { Flame } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminDataTable } from "./AdminDataTable";

export const TopStreaksTable = () => {
  const { data: topUsers, isLoading, refetch } = useQuery({
    queryKey: ["admin-top-streaks"],
    queryFn: async () => {
      const { data: streaks } = await supabase
        .from("user_streaks")
        .select("user_id, current_streak, longest_streak, last_activity_date")
        .order("current_streak", { ascending: false })
        .limit(10);

      if (!streaks) return [];

      // Get profiles for user names
      const userIds = streaks.map((s) => s.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      return streaks.map((s) => ({
        ...s,
        full_name: profileMap.get(s.user_id) || "Usuário",
      }));
    },
    refetchInterval: 60000,
  });

  const getMedal = (index: number) => {
    if (index === 0) return <span className="text-lg">🥇</span>;
    if (index === 1) return <span className="text-lg">🥈</span>;
    if (index === 2) return <span className="text-lg">🥉</span>;
    return <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <AdminDataTable
      title="Top 10 Streaks"
      emoji="🏆"
      isLoading={isLoading}
      onRefresh={refetch}
      isEmpty={!topUsers || topUsers.length === 0}
      emptyMessage="Nenhum streak registrado"
    >
      <div className="overflow-x-auto -mx-5">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12 pl-5">
                #
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Nome
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Atual
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">
                Recorde
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-5">
                Última Atividade
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topUsers?.map((user, index) => (
              <TableRow key={user.user_id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="py-3 pl-5">
                  {getMedal(index)}
                </TableCell>
                <TableCell className="text-sm font-medium truncate max-w-[150px]">
                  {user.full_name}
                </TableCell>
                <TableCell className="text-center">
                  <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-500 hover:to-amber-500 border-0 font-bold shadow-sm">
                    <Flame className="h-3.5 w-3.5 mr-1" />
                    {user.current_streak}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-semibold bg-white">
                    {user.longest_streak}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground pr-5">
                  {user.last_activity_date
                    ? format(new Date(user.last_activity_date), "dd/MM/yy", {
                        locale: ptBR,
                      })
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminDataTable>
  );
};
