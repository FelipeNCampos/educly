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
import { AdminDataTable } from "./AdminDataTable";

export const CancellationsTable = () => {
  const { data: cancellations, isLoading, refetch } = useQuery({
    queryKey: ["admin-cancellations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("billing_event_logs")
        .select("*")
        .or(
          "event_type.ilike.%chargeback%,event_type.ilike.%refund%,event_type.ilike.%cancel%,event_type.ilike.%dispute%"
        )
        .order("created_at", { ascending: false })
        .limit(20);

      return data || [];
    },
    refetchInterval: 60000,
  });

  const getEventBadge = (eventType: string) => {
    const type = eventType.toUpperCase();
    if (type.includes("CHARGEBACK") || type.includes("DISPUTE")) {
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 font-medium">
          Chargeback
        </Badge>
      );
    }
    if (type.includes("REFUND")) {
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 font-medium">
          Reembolso
        </Badge>
      );
    }
    if (type.includes("CANCEL")) {
      return (
        <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-0 font-medium">
          Cancelado
        </Badge>
      );
    }
    return <Badge variant="outline" className="font-medium">{eventType}</Badge>;
  };

  return (
    <AdminDataTable
      title="Cancelamentos & Chargebacks"
      emoji="⚠️"
      isLoading={isLoading}
      onRefresh={refetch}
      isEmpty={!cancellations || cancellations.length === 0}
      emptyMessage="Nenhum cancelamento ou chargeback registrado"
    >
      <div className="overflow-x-auto -mx-5">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-5">
                Data
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Email
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tipo
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-5">
                Status
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cancellations?.map((event) => (
              <TableRow key={event.id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="text-sm py-3 pl-5">
                  {event.created_at
                    ? format(new Date(event.created_at), "dd/MM/yy HH:mm", {
                        locale: ptBR,
                      })
                    : "-"}
                </TableCell>
                <TableCell className="text-sm font-medium truncate max-w-[180px]">
                  {event.email}
                </TableCell>
                <TableCell>{getEventBadge(event.event_type)}</TableCell>
                <TableCell className="pr-5">
                  <Badge
                    className={
                      event.processed
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-0"
                    }
                  >
                    {event.processed ? "✓ Processado" : "Pendente"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AdminDataTable>
  );
};
