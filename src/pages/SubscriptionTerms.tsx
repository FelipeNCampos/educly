import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileText, Shield, BookOpen, Scale, AlertCircle, Lightbulb, Brain, Mail } from "lucide-react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";
import { CompanyInfo } from "@/components/landing/CompanyInfo";

const SubscriptionTerms = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <LandingNavbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("common.back")}
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("subscriptionTerms.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t("subscriptionTerms.subtitle")}
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          {/* General Terms */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("subscriptionTerms.generalTerms.title")}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t("subscriptionTerms.generalTerms.content")}
                </p>
              </div>
            </div>
          </section>

          {/* License */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("subscriptionTerms.license.title")}</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t("subscriptionTerms.license.content")}
                </p>
              </div>
            </div>
          </section>

          {/* Definitions */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              {t("subscriptionTerms.definitions.title")}
            </h2>
            <p className="text-muted-foreground mb-4">{t("subscriptionTerms.definitions.intro")}</p>
            <div className="space-y-4">
              {["cookie", "company", "country", "device", "service", "you"].map((key) => (
                <div key={key} className="bg-muted/50 rounded-lg p-4">
                  <p className="text-muted-foreground whitespace-pre-line">
                    {t(`subscriptionTerms.definitions.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Restrictions */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-destructive" />
              {t("subscriptionTerms.restrictions.title")}
            </h2>
            <p className="text-muted-foreground mb-4">{t("subscriptionTerms.restrictions.intro")}</p>
            <div className="space-y-3">
              {["item1", "item2", "item3"].map((key) => (
                <div key={key} className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">{t(`subscriptionTerms.restrictions.${key}`)}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Refund Policy */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("subscriptionTerms.refundPolicy.title")}</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p className="whitespace-pre-line">{t("subscriptionTerms.refundPolicy.intro")}</p>
                  <p className="whitespace-pre-line">{t("subscriptionTerms.refundPolicy.subscriptionRefunds")}</p>
                  <p className="whitespace-pre-line">{t("subscriptionTerms.refundPolicy.digitalContent")}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Suggestions */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("subscriptionTerms.suggestions.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("subscriptionTerms.suggestions.content")}
                </p>
              </div>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">{t("subscriptionTerms.intellectualProperty.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("subscriptionTerms.intellectualProperty.content")}
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-card border border-border rounded-xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-primary" />
              {t("subscriptionTerms.contact.title")}
            </h2>
            <div className="text-muted-foreground space-y-2">
              <p>{t("subscriptionTerms.contact.content")}</p>
              <p>
                <a href="mailto:contact@educly.app" className="text-primary hover:underline">
                  contact@educly.app
                </a>
              </p>
            </div>
          </section>

          <CompanyInfo variant="full" />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubscriptionTerms;
