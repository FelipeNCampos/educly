import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/AdminGuard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, RefreshCw, Mail, MailOpen, AlertTriangle, Clock, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailLog {
  id: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: string;
  sent_at: string | null;
  opened_at: string | null;
  error_message: string | null;
  created_at: string;
}

interface EmailStats {
  total: number;
  sent: number;
  opened: number;
  failed: number;
  pending: number;
}

const AdminEmails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats>({ total: 0, sent: 0, opened: 0, failed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("email_logs")
        .select("id, recipient_email, email_type, subject, status, sent_at, opened_at, error_message, created_at")
        .order("created_at", { ascending: false })
        .limit(500);

      if (statusFilter !== "all") query = query.eq("status", statusFilter);
      if (startDate) query = query.gte("created_at", startDate);
      if (endDate) query = query.lte("created_at", `${endDate}T23:59:59`);

      const { data, error } = await query;
      if (error) throw error;

      setLogs(data || []);

      // Stats from all records (not filtered)
      const { data: allLogs } = await supabase
        .from("email_logs")
        .select("status");

      if (allLogs) {
        setStats({
          total: allLogs.length,
          sent: allLogs.filter(l => l.status === "sent").length,
          opened: allLogs.filter(l => l.status === "opened").length,
          failed: allLogs.filter(l => l.status === "failed" || l.status === "error").length,
          pending: allLogs.filter(l => l.status === "pending").length,
        });
      }
    } catch (err) {
      console.error("Error fetching email logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [statusFilter, startDate, endDate]);

    const sendBatch = async () => {
    setSending(true);
    setBatchResult(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) { toast({ title: "Sessão expirada", description: "Faça login novamente", variant: "destructive" }); return; }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-pending-welcome-batch`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      setBatchResult(result);
      toast({
        title: result.error ? "Erro no envio" : "Lote enviado!",
        description: result.error || `${result.sent} enviados, ${result.remaining} restantes`,
        variant: result.error ? "destructive" : "default",
      });
      fetchData();
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao enviar lote", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      sent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      opened: "bg-green-500/20 text-green-400 border-green-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || "bg-muted text-muted-foreground border-border"}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const openRate = stats.total > 0 ? ((stats.opened / (stats.sent + stats.opened)) * 100).toFixed(1) : "0";

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background p-4 md:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/analytics")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">📧 Monitoramento de Emails</h1>
              <p className="text-sm text-muted-foreground">Dashboard de emails enviados, abertos e erros</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Send className="h-4 w-4 text-indigo-400" />
              <span className="text-xs text-muted-foreground">Enviados</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.sent}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MailOpen className="h-4 w-4 text-green-400" />
              <span className="text-xs text-muted-foreground">Abertos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.opened}</p>
            <p className="text-xs text-muted-foreground">{openRate}% taxa</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-xs text-muted-foreground">Erros</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.failed}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Pendentes</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
          </div>
        </div>

        {/* Batch Send Button */}
        <div className="bg-card border border-border rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-semibold text-foreground">Envio em Lote (Welcome Emails Pendentes)</h3>
              <p className="text-sm text-muted-foreground">Envia até 15 emails por vez com 5s de delay entre cada</p>
            </div>
            <Button onClick={sendBatch} disabled={sending} className="bg-primary hover:bg-primary/90">
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              {sending ? "Enviando..." : "Enviar Próximo Lote"}
            </Button>
          </div>
          {batchResult && !batchResult.error && (
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
              <p className="text-green-400">✓ {batchResult.sent} enviados | {batchResult.failed || 0} falhas | {batchResult.remaining} restantes</p>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="sent">Enviados</SelectItem>
              <SelectItem value="opened">Abertos</SelectItem>
              <SelectItem value="failed">Falhas</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
            </SelectContent>
          </Select>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-[160px]" placeholder="Data início" />
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-[160px]" placeholder="Data fim" />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enviado</TableHead>
                <TableHead>Aberto</TableHead>
                <TableHead>Erro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">{log.recipient_email}</TableCell>
                    <TableCell className="text-xs">{log.email_type}</TableCell>
                    <TableCell className="text-xs max-w-[200px] truncate">{log.subject}</TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                    <TableCell className="text-xs">{formatDate(log.sent_at)}</TableCell>
                    <TableCell className="text-xs">{formatDate(log.opened_at)}</TableCell>
                    <TableCell className="text-xs text-red-400 max-w-[150px] truncate">{log.error_message || "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Mostrando {logs.length} registros (limite: 500)</p>
      </div>
    </AdminGuard>
  );
};

export default AdminEmails;
