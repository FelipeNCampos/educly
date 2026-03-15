import { useTranslation } from "react-i18next";
import { Building2, MapPin, Phone, Mail, FileText } from "lucide-react";

interface CompanyInfoProps {
  variant?: "full" | "compact" | "footer";
  className?: string;
}

export const CompanyInfo = ({ variant = "full", className = "" }: CompanyInfoProps) => {
  const { t } = useTranslation();

  const companies = [
    {
      label: "Services provided by:",
      legalName: "Contra Estatistica Digital Marketers LLC",
      registration: "EIN: 39-4917931",
      jurisdiction: "United States",
      address: "1209 Mountain Road Pl NE, Ste R, Albuquerque, NM 87110, United States",
    },
    {
      label: "Corporate Headquarter:",
      legalName: "SELLCORE LTD.",
      registration: "C 62598",
      jurisdiction: "Saint Kitts and Nevis",
      address: "Suite 5, Horsford's Business Centre, Long Point Road, Charlestown, Nevis",
    }
  ];

  const contactData = {
    phone: "+5562991874867",
    email: "contact@educly.app",
  };

  if (variant === "footer") {
    return (
        <div className={`text-sm text-secondary-foreground/70 space-y-1 ${className}`}>
          <p className="font-medium text-secondary-foreground">
            {t("company.ownershipStatement")}
          </p>
          {companies.map((company, index) => (
              <p key={index}>{company.legalName} - {company.registration}</p>
          ))}
        </div>
    );
  }

  if (variant === "compact") {
    return (
        <div className={`text-sm text-muted-foreground space-y-4 ${className}`}>
          {companies.map((company, index) => (
              <div key={index} className={index !== 0 ? "border-t border-border pt-3" : ""}>
                <p className="font-semibold text-foreground">{company.legalName}</p>
                <p className="text-xs opacity-80">{company.registration}</p>
              </div>
          ))}
        </div>
    );
  }

  // Full variant
  return (
      <div className={`bg-card border border-border rounded-xl p-6 space-y-6 ${className}`}>
        <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border pb-4">
          <Building2 className="w-5 h-5 text-primary" />
          {t("company.title")}
        </h3>

        <div className="flex flex-col gap-8">
          {companies.map((company, index) => (
              <div key={index} className="relative space-y-3">
                {/* Rótulo pequeno acima de cada empresa */}
                <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-1">
                  {company.label}
                </p>

                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-primary/70 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-foreground leading-none mb-1">{company.legalName}</p>
                    <p className="text-xs text-muted-foreground font-medium">
                      {company.registration} • {company.jurisdiction}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground leading-relaxed">{company.address}</p>
                </div>

                {/* Linha separadora entre as empresas, exceto após a última */}
                {index === 0 && (
                    <div className="absolute -bottom-4 left-0 w-full border-t border-dashed border-border" />
                )}
              </div>
          ))}

          {/* Seção de Contato */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border bg-muted/30 -mx-6 px-6 py-4 rounded-b-xl">
            <div className="flex items-center gap-3">
              <div className="bg-background p-1.5 rounded-full border border-border">
                <Phone className="w-3.5 h-3.5 text-primary" />
              </div>
              <a href={`tel:${contactData.phone}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {contactData.phone}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-background p-1.5 rounded-full border border-border">
                <Mail className="w-3.5 h-3.5 text-primary" />
              </div>
              <a href={`mailto:${contactData.email}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {contactData.email}
              </a>
            </div>
          </div>
        </div>
      </div>
  );
};