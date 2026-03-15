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
import { Loader2, Bug } from "lucide-react";

export const UserBugsTable = () => {
  const { data: bugs, isLoading } = useQuery({
    queryKey: ["admin-user-bugs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_bugs")
        .select("*")
        .order("created_at", { ascending: false }); // Mostrar os mais recentes primeiro

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[150px]">Data</TableHead>
            <TableHead className="w-[150px]">Plataforma</TableHead>
            <TableHead>Mensagem de Erro</TableHead>
            <TableHead className="max-w-[200px]">Stack/Local</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bugs?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                Nenhum bug detectado até o momento. Bom trabalho! ✨
              </TableCell>
            </TableRow>
          ) : (
            bugs?.map((bug) => (
              <TableRow key={bug.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="text-xs font-medium">
                  {format(new Date(bug.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] font-normal uppercase">
                    {bug.platform || "Desconhecido"}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-xs text-red-600 break-all">
                  {bug.error_message}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {bug.component_stack}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};