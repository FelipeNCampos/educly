import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import {
  Search,
  UserCheck,
  UserX,
  Loader2,
  ShieldCheck,
  Send,
} from "lucide-react";

type UserLookup = {
  has_account: boolean;
  user_id: string | null;
  email: string | null;
  is_premium: boolean;
  plan_type: string;
  products: { product_type: string; is_active: boolean }[];
};

const PRODUCTS = [
  { id: "base", label: "Base", color: "bg-green-100 text-green-700" },
  { id: "freelancer", label: "Freelancer", color: "bg-blue-100 text-blue-700" },
  { id: "ai_hub", label: "AI Hub", color: "bg-purple-100 text-purple-700" },
];

const DURATIONS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
  { value: "365", label: "1 ano" },
  { value: "unlimited", label: "Ilimitado" },
];

const LANGUAGES = [
  { value: "es", label: "🇪🇸 Espanhol" },
  { value: "pt", label: "🇧🇷 Português" },
  { value: "en", label: "🇺🇸 Inglês" },
  { value: "fr", label: "🇫🇷 Francês" },
];

export const ManualAccessGrant = () => {
  const [email, setEmail] = useState("");
  const [userInfo, setUserInfo] = useState<UserLookup | null>(null);
  const [looking, setLooking] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [duration, setDuration] = useState("30");
  const [language, setLanguage] = useState("es");
  const [sendWelcome, setSendWelcome] = useState(false);
  const [granting, setGranting] = useState(false);

  const lookupUser = async () => {
    if (!email.trim()) return;
    setLooking(true);
    setUserInfo(null);
    try {
      const { data, error } = await supabase.rpc("admin_lookup_email", {
        p_email: email.trim(),
      });
      if (error) throw error;
      setUserInfo(data as unknown as UserLookup);
    } catch (e: any) {
      toast({ title: "Erro ao buscar", description: e.message, variant: "destructive" });
    } finally {
      setLooking(false);
    }
  };

  const toggleProduct = (id: string) => {
    setSelectedProducts((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const grantAccess = async () => {
    if (!userInfo?.has_account || !userInfo.user_id || selectedProducts.length === 0) return;
    setGranting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-grant-access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            products: selectedProducts,
            duration_days: duration === "unlimited" ? null : parseInt(duration),
            send_welcome_email: sendWelcome,
            language,
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");

      toast({
        title: "✅ Acesso liberado!",
        description: `Produtos: ${result.granted_products.join(", ")}${
          result.expires_at
            ? ` | Expira: ${new Date(result.expires_at).toLocaleDateString("pt-BR")}`
            : " | Sem expiração"
        }${result.welcome_email_scheduled ? " | Email agendado" : ""}`,
      });

      // Reset
      setSelectedProducts([]);
      setSendWelcome(false);
      // Re-lookup to refresh status
      lookupUser();
    } catch (e: any) {
      toast({ title: "Erro ao liberar", description: e.message, variant: "destructive" });
    } finally {
      setGranting(false);
    }
  };

  const planLabel = (info: UserLookup) => {
    const active = info.products?.filter((p) => p.is_active).map((p) => p.product_type) || [];
    if (active.includes("base") && active.includes("freelancer") && active.includes("ai_hub"))
      return { label: "Combo", color: "text-amber-600 bg-amber-50" };
    if (active.includes("freelancer"))
      return { label: "Premium Freelancer", color: "text-blue-600 bg-blue-50" };
    if (active.includes("ai_hub"))
      return { label: "AI Pack", color: "text-purple-600 bg-purple-50" };
    if (active.includes("base"))
      return { label: "Base", color: "text-green-600 bg-green-50" };
    if (info.is_premium) return { label: "Premium (legacy)", color: "text-yellow-600 bg-yellow-50" };
    return { label: "Free", color: "text-muted-foreground bg-muted" };
  };

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
          <ShieldCheck className="h-5 w-5 text-white" />
        </div>
        <div className="text-left">
          <h3 className="font-bold text-foreground">Liberação Manual de Acesso</h3>
          <p className="text-xs text-muted-foreground">
            Busque por email e libere produtos manualmente
          </p>
        </div>
      </div>

      {/* Email lookup */}
      <div className="space-y-2">
        <Label>Email do usuário</Label>
        <div className="flex gap-2">
          <Input
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookupUser()}
          />
          <Button onClick={lookupUser} disabled={looking || !email.trim()} size="sm">
            {looking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User status */}
      {userInfo && (
        <div
          className={`p-4 rounded-xl border ${
            userInfo.has_account ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {userInfo.has_account ? (
              <UserCheck className="h-4 w-4 text-green-600" />
            ) : (
              <UserX className="h-4 w-4 text-red-600" />
            )}
            <span className="font-medium text-sm">
              {userInfo.has_account ? "Conta encontrada" : "Sem conta registrada"}
            </span>
          </div>
          {userInfo.has_account && (
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded-full font-medium ${planLabel(userInfo).color}`}>
                {planLabel(userInfo).label}
              </span>
              {userInfo.products
                ?.filter((p) => p.is_active)
                .map((p) => (
                  <span key={p.product_type} className="px-2 py-1 rounded-full bg-muted text-muted-foreground">
                    {p.product_type}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Grant form - only show if user has account */}
      {userInfo?.has_account && (
        <div className="space-y-5 pt-2">
          {/* Products */}
          <div className="space-y-3">
            <Label>Produtos a liberar</Label>
            <div className="flex flex-wrap gap-3">
              {PRODUCTS.map((p) => (
                <label
                  key={p.id}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    selectedProducts.includes(p.id)
                      ? `${p.color} border-current shadow-sm`
                      : "bg-muted/30 border-border/50 hover:bg-muted/50"
                  }`}
                >
                  <Checkbox
                    checked={selectedProducts.includes(p.id)}
                    onCheckedChange={() => toggleProduct(p.id)}
                  />
                  <span className="text-sm font-medium">{p.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Duration & Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Duração do acesso</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idioma do email</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Welcome email toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Enviar email de boas-vindas</span>
            </div>
            <Switch checked={sendWelcome} onCheckedChange={setSendWelcome} />
          </div>

          {/* Submit */}
          <Button
            onClick={grantAccess}
            disabled={granting || selectedProducts.length === 0}
            className="w-full h-11 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
          >
            {granting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ShieldCheck className="h-4 w-4 mr-2" />
            )}
            Liberar Acesso
          </Button>
        </div>
      )}
    </div>
  );
};
