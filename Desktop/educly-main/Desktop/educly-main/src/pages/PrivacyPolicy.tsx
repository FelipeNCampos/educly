import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";
import logoEducy from "@/assets/logo-educy.png";

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('legal.privacyPolicy.title')}</h1>
        <p className="text-muted-foreground mb-4">{t('legal.privacyPolicy.lastUpdated')}</p>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t('legal.privacyPolicy.intro')}</p>

        <div className="prose prose-gray max-w-none space-y-8 break-words">
          {/* 1. Dados Coletados */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.collection.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.collection.intro')}</p>
            
            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.privacyPolicy.sections.collection.directData.title')}</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('legal.privacyPolicy.sections.collection.directData.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.directData.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.directData.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.directData.items.3')}</li>
            </ul>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.privacyPolicy.sections.collection.paymentData.title')}</h3>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.collection.paymentData.content1')}</p>
            <p className="text-muted-foreground leading-relaxed mt-2">{t('legal.privacyPolicy.sections.collection.paymentData.content2')}</p>

            <h3 className="text-xl font-medium text-foreground mt-6 mb-2">{t('legal.privacyPolicy.sections.collection.autoData.title')}</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('legal.privacyPolicy.sections.collection.autoData.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.autoData.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.autoData.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.collection.autoData.items.3')}</li>
            </ul>
          </section>

          {/* 2. Finalidade do Uso dos Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.usage.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.usage.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.usage.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.3')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.4')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.5')}</li>
              <li>{t('legal.privacyPolicy.sections.usage.items.6')}</li>
            </ul>
          </section>

          {/* 3. Base Legal */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.legalBasis.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.legalBasis.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.legalBasis.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.legalBasis.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.legalBasis.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.legalBasis.items.3')}</li>
            </ul>
          </section>

          {/* 4. Compartilhamento de Dados */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.sharing.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.sharing.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.sharing.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.sharing.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.sharing.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.sharing.items.3')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.sharing.disclaimer')}</p>
          </section>

          {/* 5. Armazenamento e Segurança */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.security.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.security.content1')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.security.content2')}</p>
          </section>

          {/* 6. Direitos do Usuário */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.rights.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.rights.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.rights.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.rights.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.rights.items.2')}</li>
              <li>{t('legal.privacyPolicy.sections.rights.items.3')}</li>
              <li>{t('legal.privacyPolicy.sections.rights.items.4')}</li>
              <li>{t('legal.privacyPolicy.sections.rights.items.5')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.rights.howTo')}</p>
            <p className="text-muted-foreground leading-relaxed mt-2 font-medium">📧 contact@educly.app</p>
          </section>

          {/* 7. Comunicações */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.communications.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.communications.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.communications.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.communications.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.communications.items.2')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.communications.optOut')}</p>
          </section>

          {/* 8. Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.cookies.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.cookies.intro')}</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.privacyPolicy.sections.cookies.items.0')}</li>
              <li>{t('legal.privacyPolicy.sections.cookies.items.1')}</li>
              <li>{t('legal.privacyPolicy.sections.cookies.items.2')}</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.cookies.disclaimer')}</p>
          </section>

          {/* 9. Alterações */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.changes.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.changes.content1')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.changes.content2')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4">{t('legal.privacyPolicy.sections.changes.content3')}</p>
          </section>

          {/* 10. Contato */}
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.privacyPolicy.sections.contact.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">{t('legal.privacyPolicy.sections.contact.intro')}</p>
            <p className="text-muted-foreground leading-relaxed mt-4 font-medium">📧 contact@educly.app</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
