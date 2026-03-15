import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";

interface RecurringBillingDisclosureProps {
  price?: string;
  frequency?: string;
  className?: string;
}

export const RecurringBillingDisclosure = ({ 
  price = "29.90",
  frequency = "monthly",
  className = "" 
}: RecurringBillingDisclosureProps) => {
  const { t } = useTranslation();

  return (
    <div className={`bg-muted/50 border border-border rounded-lg p-4 text-xs text-muted-foreground space-y-2 ${className}`}>
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary" />
        <div className="space-y-2">
          {/* Billing Terms */}
          <p>
            {t("checkout.billingDisclosure", { price, frequency: t(`checkout.frequency.${frequency}`) })}
          </p>

          {/* Billing Descriptor */}
          <p className="font-medium text-foreground">
            {t("checkout.billingDescriptor")}
          </p>

          {/* Cancellation Instructions */}
          <p>
            {t("checkout.cancellationInstructions")}
          </p>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            <Link 
              to="/termos" 
              className="underline hover:text-primary transition-colors"
            >
              {t("checkout.links.terms")}
            </Link>
            <Link 
              to="/termos-assinatura" 
              className="underline hover:text-primary transition-colors"
            >
              {t("checkout.links.subscriptionTerms")}
            </Link>
            <Link 
              to="/privacidade" 
              className="underline hover:text-primary transition-colors"
            >
              {t("checkout.links.privacy")}
            </Link>
            <Link 
              to="/cancelamento" 
              className="underline hover:text-primary transition-colors"
            >
              {t("checkout.links.refund")}
            </Link>
          </div>

          {/* Company Location */}
          <p className="text-[10px] pt-1 border-t border-border mt-2">
            {t("checkout.companyLocation")}
          </p>
        </div>
      </div>
    </div>
  );
};
