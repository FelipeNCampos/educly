import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Shield, Clock, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { CompanyInfo } from "@/components/landing/CompanyInfo";

const RefundPolicy = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back Button */}
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("refundPolicy.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("refundPolicy.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Guarantee Section */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("refundPolicy.guarantee.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("refundPolicy.guarantee.description")}
                </p>
              </div>
            </div>
          </section>

          {/* Eligibility Section */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              {t("refundPolicy.eligibility.title")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{t("refundPolicy.eligibility.item1")}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{t("refundPolicy.eligibility.item2")}</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{t("refundPolicy.eligibility.item3")}</p>
              </div>
            </div>
          </section>

          {/* Non-Eligibility Section */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <XCircle className="w-6 h-6 text-destructive" />
              {t("refundPolicy.nonEligibility.title")}
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{t("refundPolicy.nonEligibility.item1")}</p>
              </div>
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-muted-foreground">{t("refundPolicy.nonEligibility.item2")}</p>
              </div>
            </div>
          </section>

          {/* How to Request Section */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              {t("refundPolicy.howToRequest.title")}
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>{t("refundPolicy.howToRequest.intro")}</p>
              
              <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm">
                <p className="font-bold text-foreground mb-2">{t("refundPolicy.howToRequest.emailSubject")}</p>
                <ul className="space-y-1">
                  <li>• {t("refundPolicy.howToRequest.include1")}</li>
                  <li>• {t("refundPolicy.howToRequest.include2")}</li>
                  <li>• {t("refundPolicy.howToRequest.include3")}</li>
                </ul>
              </div>

              <p>
                <span className="font-semibold text-foreground">{t("refundPolicy.howToRequest.emailLabel")}: </span>
                <a href="mailto:contact@educly.app" className="text-primary hover:underline">
                  contact@educly.app
                </a>
              </p>
            </div>
          </section>

          {/* Cancellation Section */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-orange-500" />
              {t("refundPolicy.cancellation.title")}
            </h2>
            
            <div className="space-y-4 text-muted-foreground">
              <p>{t("refundPolicy.cancellation.description")}</p>
              <p>{t("refundPolicy.cancellation.instructions")}</p>
            </div>
          </section>

          {/* Processing Times */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              {t("refundPolicy.processing.title")}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">{t("refundPolicy.processing.responseTime")}</p>
                <p className="text-muted-foreground text-sm">{t("refundPolicy.processing.responseValue")}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="font-semibold text-foreground mb-1">{t("refundPolicy.processing.refundTime")}</p>
                <p className="text-muted-foreground text-sm">{t("refundPolicy.processing.refundValue")}</p>
              </div>
            </div>
          </section>

          {/* Billing Descriptor Notice */}
          <section className="bg-primary/5 border border-primary/20 rounded-xl p-6">
            <p className="text-center text-sm">
              <span className="font-semibold">{t("refundPolicy.billingDescriptor.label")}: </span>
              <span className="font-mono bg-primary/10 px-2 py-1 rounded">EDUCLY.APP</span>
            </p>
          </section>

          {/* Company Info */}
          <CompanyInfo variant="full" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RefundPolicy;
