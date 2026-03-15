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
import { Crown } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminDataTable } from "./AdminDataTable";

export const PremiumUsersTable = () => {
  const { data: premiumUsers, isLoading, refetch } = useQuery({
    queryKey: ["admin-premium-users"],
    queryFn: async () => {
      const { data: premiumAccess } = await supabase
        .from("user_premium_access")
        .select("user_id, is_premium, plan_type, purchased_at")
        .eq("is_premium", true)
        .order("purchased_at", { ascending: false })
        .limit(20);

      if (!premiumAccess) return [];

      const userIds = premiumAccess.map((p) => p.user_id);

      // Get profiles
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.id, p.full_name]) || []);

      // Get product access
      const { data: products } = await supabase
        .from("user_product_access")
        .select("user_id, product_type")
        .in("user_id", userIds)
        .eq("is_active", true);

      const productMap = new Map<string, string[]>();
      products?.forEach((p) => {
        const existing = productMap.get(p.user_id) || [];
        existing.push(p.product_type);
        productMap.set(p.user_id, existing);
      });

      return premiumAccess.map((p) => ({
        ...p,
        full_name: profileMap.get(p.user_id) || "Usuário",
        products: productMap.get(p.user_id) || [],
      }));
    },
    refetchInterval: 60000,
  });

  const getProductBadge = (productType: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      base: { bg: "bg-emerald-100", text: "text-emerald-700" },
      freelancer: { bg: "bg-blue-100", text: "text-blue-700" },
      ai_hub: { bg: "bg-purple-100", text: "text-purple-700" },
    };
    const style = config[productType] || { bg: "bg-slate-100", text: "text-slate-700" };
    const label = productType === "ai_hub" ? "AI Hub" : productType.charAt(0).toUpperCase() + productType.slice(1);
    
    return (
      <Badge 
        key={productType}
        className={`${style.bg} ${style.text} hover:${style.bg} border-0 font-medium`}
      >
        {label}
      </Badge>
    );
  };

  return (
    <AdminDataTable
      title="Usuários Premium"
      emoji="👑"
      isLoading={isLoading}
      onRefresh={refetch}
      isEmpty={!premiumUsers || premiumUsers.length === 0}
      emptyMessage="Nenhum usuário premium"
    >
      <div className="overflow-x-auto -mx-5">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border/50 hover:bg-transparent">
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-5">
                Nome
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Produtos
              </TableHead>
              <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pr-5">
                Desde
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {premiumUsers?.map((user) => (
              <TableRow key={user.user_id} className="border-b border-border/30 hover:bg-muted/30">
                <TableCell className="py-3 pl-5">
                  <div className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {user.full_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {user.products.length > 0 ? (
                      user.products.map((product) => getProductBadge(product))
                    ) : (
                      <Badge variant="outline" className="font-medium bg-white">
                        Premium
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap pr-5">
                  {user.purchased_at
                    ? format(new Date(user.purchased_at), "dd/MM/yy", {
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
