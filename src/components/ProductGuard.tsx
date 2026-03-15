import { ReactNode } from "react";
import { useProductAccess, ProductType } from "@/hooks/useProductAccess";
import { Loader2 } from "lucide-react";
import { UpgradeUpsell } from "@/pages/UpgradeUpsell";

interface ProductGuardProps {
  productType: ProductType;
  mode?: "replace" | "overlay";
  children: ReactNode;
}

export const ProductGuard = ({ productType, mode = "replace", children }: ProductGuardProps) => {
  const access = useProductAccess();

  if (access.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!access.hasAccess(productType)) {
    if (mode === "overlay") {
      return (
        <div className="relative">
          <div className="pointer-events-none select-none blur-sm">
            {children}
          </div>
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-4xl pointer-events-auto">
              <UpgradeUpsell productType={productType} />
            </div>
          </div>
        </div>
      );
    }

    return <UpgradeUpsell productType={productType} />;
  }

  return <>{children}</>;
};
