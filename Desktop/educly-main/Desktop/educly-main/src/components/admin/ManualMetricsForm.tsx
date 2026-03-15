import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ManualMetric {
  id: string;
  metric_date: string;
  nps_score: number | null;
  emails_sent: number | null;
  emails_opened: number | null;
  emails_clicked: number | null;
  support_tickets_opened: number | null;
  support_tickets_resolved: number | null;
  notes: string | null;
}

export const ManualMetricsForm = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    nps_score: "",
    emails_sent: "",
    emails_opened: "",
    emails_clicked: "",
    support_tickets_opened: "",
    support_tickets_resolved: "",
    notes: "",
  });

  // Fetch today's metric and history
  const { data: metricsHistory, isLoading } = useQuery({
    queryKey: ["admin-manual-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_manual_metrics")
        .select("*")
        .order("metric_date", { ascending: false })
        .limit(30);

      if (error) throw error;
      return data as ManualMetric[];
    },
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        metric_date: today,
        nps_score: formData.nps_score ? parseFloat(formData.nps_score) : null,
        emails_sent: formData.emails_sent ? parseInt(formData.emails_sent) : null,
        emails_opened: formData.emails_opened ? parseInt(formData.emails_opened) : null,
        emails_clicked: formData.emails_clicked ? parseInt(formData.emails_clicked) : null,
        support_tickets_opened: formData.support_tickets_opened
          ? parseInt(formData.support_tickets_opened)
          : null,
        support_tickets_resolved: formData.support_tickets_resolved
          ? parseInt(formData.support_tickets_resolved)
          : null,
        notes: formData.notes || null,
        created_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("admin_manual_metrics")
        .upsert(payload, { onConflict: "metric_date" });

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Métricas salvas!",
        description: "Os dados foram registrados com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["admin-manual-metrics"] });
      setFormData({
        nps_score: "",
        emails_sent: "",
        emails_opened: "",
        emails_clicked: "",
        support_tickets_opened: "",
        support_tickets_resolved: "",
        notes: "",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Métricas Manuais</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          ✍️ Métricas Manuais - {format(new Date(), "dd/MM/yyyy", { locale: ptBR })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Form */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1">
            <Label htmlFor="nps" className="text-xs">NPS (0-10)</Label>
            <Input
              id="nps"
              type="number"
              min="0"
              max="10"
              step="0.1"
              placeholder="8.5"
              value={formData.nps_score}
              onChange={(e) => setFormData({ ...formData, nps_score: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emails_sent" className="text-xs">Emails Enviados</Label>
            <Input
              id="emails_sent"
              type="number"
              min="0"
              placeholder="0"
              value={formData.emails_sent}
              onChange={(e) => setFormData({ ...formData, emails_sent: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emails_opened" className="text-xs">Emails Abertos</Label>
            <Input
              id="emails_opened"
              type="number"
              min="0"
              placeholder="0"
              value={formData.emails_opened}
              onChange={(e) => setFormData({ ...formData, emails_opened: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="emails_clicked" className="text-xs">Emails Clicados</Label>
            <Input
              id="emails_clicked"
              type="number"
              min="0"
              placeholder="0"
              value={formData.emails_clicked}
              onChange={(e) => setFormData({ ...formData, emails_clicked: e.target.value })}
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tickets_open" className="text-xs">Tickets Abertos</Label>
            <Input
              id="tickets_open"
              type="number"
              min="0"
              placeholder="0"
              value={formData.support_tickets_opened}
              onChange={(e) =>
                setFormData({ ...formData, support_tickets_opened: e.target.value })
              }
              className="h-9"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="tickets_resolved" className="text-xs">Tickets Resolvidos</Label>
            <Input
              id="tickets_resolved"
              type="number"
              min="0"
              placeholder="0"
              value={formData.support_tickets_resolved}
              onChange={(e) =>
                setFormData({ ...formData, support_tickets_resolved: e.target.value })
              }
              className="h-9"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes" className="text-xs">Notas da Diretoria</Label>
          <Textarea
            id="notes"
            placeholder="Observações, decisões, insights..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
        </div>

        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="w-full"
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Métricas do Dia
        </Button>

        {/* History Table */}
        {metricsHistory && metricsHistory.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Histórico (últimos 30 dias)</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs text-center">NPS</TableHead>
                    <TableHead className="text-xs text-center">Enviados</TableHead>
                    <TableHead className="text-xs text-center">Abertos</TableHead>
                    <TableHead className="text-xs text-center">Cliques</TableHead>
                    <TableHead className="text-xs">Notas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metricsHistory.map((metric) => (
                    <TableRow key={metric.id}>
                      <TableCell className="text-xs whitespace-nowrap">
                        {format(new Date(metric.metric_date), "dd/MM", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {metric.nps_score ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {metric.emails_sent ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {metric.emails_opened ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs text-center">
                        {metric.emails_clicked ?? "-"}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[200px]">
                        {metric.notes || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
