import { useTranslation } from "react-i18next";
import { Shield, Lock } from "lucide-react";
import visaLogo from "@/assets/visa-logo.png";
import mastercardLogo from "@/assets/mastercard-logo.png";
import amexLogo from "@/assets/amex-logo.png";

interface CreditCardLogosProps {
  showSecurityBadges?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const CreditCardLogos = ({ 
  showSecurityBadges = true, 
  size = "md",
  className = "" 
}: CreditCardLogosProps) => {
  const { t } = useTranslation();

  const sizeClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Credit Card Logos */}
      <div className="flex items-center justify-center gap-4">
        <img 
          src={visaLogo} 
          alt="Visa" 
          className={`${sizeClasses[size]} w-auto object-contain`} 
        />
        <img 
          src={mastercardLogo} 
          alt="Mastercard" 
          className={`${sizeClasses[size]} w-auto object-contain`} 
        />
        <img 
          src={amexLogo} 
          alt="American Express" 
          className={`${sizeClasses[size]} w-auto object-contain`} 
        />
      </div>

      {/* Security Badges */}
      {showSecurityBadges && (
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-green-500" />
            <span>{t("checkout.securePayment")}</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-green-500" />
            <span>{t("checkout.sslEncrypted")}</span>
          </div>
        </div>
      )}
    </div>
  );
};
