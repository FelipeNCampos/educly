import { useState } from "react";
import { Search, UserCheck, UserX, ShieldCheck, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LookupResult {
  has_account: boolean;
  user_id: string | null;
  email: string | null;
  created_at: string | null;
  is_premium: boolean;
  plan_type: string;
  products: Array<{
    product_type: string;
    product_id: string;
    is_active: boolean;
    granted_at: string;
  }>;
  billing_events: Array<{
    event_type: string;
    status: string;
    processed: boolean;
    created_at: string;
  }>;
}

const getPlanLabel = (result: LookupResult): { label: string; color: string } => {
  const activeProducts = result.products.filter(p => p.is_active);
  const hasBase = activeProducts.some(p => p.product_type === 'base');
  const hasFreelancer = activeProducts.some(p => p.product_type === 'freelancer');
  const hasAiHub = activeProducts.some(p => p.product_type === 'ai_hub');

  if (hasBase && hasFreelancer && hasAiHub) return { label: 'Combo', color: 'bg-amber-500 text-white' };
  if (hasFreelancer) return { label: 'Premium Freelancer', color: 'bg-blue-500 text-white' };
  if (hasAiHub) return { label: 'AI Pack', color: 'bg-purple-500 text-white' };
  if (hasBase) return { label: 'Base', color: 'bg-green-500 text-white' };
  if (result.is_premium) return { label: 'Premium (legado)', color: 'bg-yellow-600 text-white' };
  return { label: 'Sem plano', color: 'bg-gray-400 text-white' };
};

export const EmailLookup = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  const handleSearch = async () => {
    if (!email.trim()) {
      toast.error("Digite um email para pesquisar");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.rpc("admin_lookup_email", {
        p_email: email.trim(),
      });
      if (error) throw error;
      setResult(data as unknown as LookupResult);
    } catch (err: any) {
      toast.error("Erro ao pesquisar: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Search className="h-4 w-4" />
          Pesquisar Email
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Digite o email do usuário..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading} size="sm">
            {loading ? "..." : "Buscar"}
          </Button>
        </div>

        {result && (
          <div className="space-y-3 pt-2 border-t">
            {/* Account status */}
            <div className="flex items-center gap-2">
              {result.has_account ? (
                <>
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-700">
                    Conta criada
                  </span>
                  <span className="text-xs text-muted-foreground">
                    em{" "}
                    {new Date(result.created_at!).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </>
              ) : (
                <>
                  <UserX className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700">
                    Ainda não criou conta
                  </span>
                </>
              )}
            </div>

            {/* Plan status */}
            {result.has_account && (() => {
              const plan = getPlanLabel(result);
              return (
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Plano:</span>
                  <Badge className={`${plan.color} border-transparent`}>
                    {plan.label}
                  </Badge>
                </div>
              );
            })()}

            {/* Products */}
            {result.products.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Produtos:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-6">
                  {result.products.map((p, i) => (
                    <Badge
                      key={i}
                      variant={p.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {p.product_type}
                      {p.is_active ? " ✅" : " (inativo)"}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Billing events */}
            {result.billing_events.length > 0 && (
              <div className="space-y-1">
                <span className="text-sm font-medium">
                  Eventos de billing ({result.billing_events.length}):
                </span>
                <div className="max-h-32 overflow-y-auto space-y-1 pl-2">
                  {result.billing_events.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-xs text-muted-foreground"
                    >
                      <Badge
                        variant={
                          ev.status === "success"
                            ? "default"
                            : ev.status === "USER_NOT_FOUND"
                              ? "destructive"
                              : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {ev.status}
                      </Badge>
                      <span className="font-mono">{ev.event_type}</span>
                      <span>
                        {new Date(ev.created_at).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.billing_events.length === 0 && !result.has_account && (
              <p className="text-xs text-muted-foreground">
                Nenhum evento de billing encontrado para este email.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
