import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";
import logoEducy from "@/assets/logo-educy.png";

const TermsOfUse = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src={logoEducy} alt="Educy" className="h-10" />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 max-w-4xl overflow-y-auto">
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('legal.termsOfUse.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('legal.termsOfUse.lastUpdated')}</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t('legal.termsOfUse.intro')}</p>

        <div className="prose prose-gray max-w-none space-y-8 break-words">
          {/* 1. Sobre o IAcademy */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.about.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.about.content')}
            </p>
          </section>

          {/* 2. Aceitação dos Termos */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.acceptance.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.acceptance.content')}
            </p>
          </section>

          {/* 3. Cadastro e Responsabilidade */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.account.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.account.intro')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.account.responsibility')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-2">
              <li>{t('legal.termsOfUse.sections.account.items.0')}</li>
              <li>{t('legal.termsOfUse.sections.account.items.1')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.account.disclaimer')}</p>
          </section>

          {/* 4. Planos, Assinatura e Paid Trial */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.plans.title')}</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('legal.termsOfUse.sections.plans.items.0')}</li>
              <li>{t('legal.termsOfUse.sections.plans.items.1')}</li>
              <li>{t('legal.termsOfUse.sections.plans.items.2')}</li>
            </ul>
          </section>

          {/* 5. Política de Reembolso e Cancelamento */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.refund.title')}</h2>
            
            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.termsOfUse.sections.refund.trialRefund.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.refund.trialRefund.content')}</p>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.termsOfUse.sections.refund.howToRefund.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.refund.howToRefund.content')}</p>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.termsOfUse.sections.refund.cancellation.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.refund.cancellation.content1')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.refund.cancellation.content2')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.refund.cancellation.content3')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4 font-medium">📧 contact@educly.app</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.refund.cancellation.content4')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.refund.cancellation.content5')}</p>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.termsOfUse.sections.refund.processing.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.refund.processing.content')}</p>
          </section>

          {/* 6. Uso Adequado da Plataforma */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.acceptableUse.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.termsOfUse.sections.acceptableUse.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.termsOfUse.sections.acceptableUse.items.0')}</li>
              <li>{t('legal.termsOfUse.sections.acceptableUse.items.1')}</li>
              <li>{t('legal.termsOfUse.sections.acceptableUse.items.2')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.termsOfUse.sections.acceptableUse.consequence')}</p>
          </section>

          {/* 7. Propriedade Intelectual */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.ip.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.ip.content')}
            </p>
          </section>

          {/* 8. Limitação de Responsabilidade */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.liability.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.liability.content')}
            </p>
          </section>

          {/* 9. Alterações dos Termos */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.modifications.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.modifications.content')}
            </p>
          </section>

          {/* 10. Legislação Aplicável e Foro */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.law.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.law.content')}
            </p>
          </section>

          {/* 11. Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.termsOfUse.sections.contact.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.termsOfUse.sections.contact.intro')}
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4 font-medium">📧 contact@educly.app</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfUse;
