import { ReactNode } from "react";
import { useProductAccess, ProductType } from "@/hooks/useProductAccess";
import { Loader2 } from "lucide-react";
import { UpgradeUpsell } from "@/pages/UpgradeUpsell";

interface ProductGuardProps {
  productType: ProductType;
  children: ReactNode;
}

export const ProductGuard = ({ productType, children }: ProductGuardProps) => {
  const access = useProductAccess();

  if (access.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!access.hasAccess(productType)) {
    return <UpgradeUpsell productType={productType} />;
  }

  return <>{children}</>;
};
