import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/landing/Footer";
import { useTranslation } from "react-i18next";
import logoEducy from "@/assets/logo-educy.png";

const CookiesPolicy = () => {
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
        <h1 className="text-4xl font-bold text-foreground mb-2">{t('legal.cookiesPolicy.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('legal.cookiesPolicy.lastUpdated')}</p>

        <div className="prose prose-gray max-w-none space-y-8 break-words">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.whatAreCookies.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.whatAreCookies.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.howWeUse.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.howWeUse.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2 mt-4">
              <li>{t('legal.cookiesPolicy.sections.howWeUse.items.0')}</li>
              <li>{t('legal.cookiesPolicy.sections.howWeUse.items.1')}</li>
              <li>{t('legal.cookiesPolicy.sections.howWeUse.items.2')}</li>
              <li>{t('legal.cookiesPolicy.sections.howWeUse.items.3')}</li>
              <li>{t('legal.cookiesPolicy.sections.howWeUse.items.4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.types.title')}</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {t('legal.cookiesPolicy.sections.types.intro')}
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>{t('legal.cookiesPolicy.sections.types.items.0')}</li>
              <li>{t('legal.cookiesPolicy.sections.types.items.1')}</li>
              <li>{t('legal.cookiesPolicy.sections.types.items.2')}</li>
              <li>{t('legal.cookiesPolicy.sections.types.items.3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.thirdParty.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.thirdParty.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.managing.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.managing.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.consequences.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.consequences.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.consent.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.consent.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.changes.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.changes.content')}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t('legal.cookiesPolicy.sections.contact.title')}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t('legal.cookiesPolicy.sections.contact.intro')}
            </p>
            <ul className="list-none text-muted-foreground space-y-2 mt-4">
              <li><strong>{t('legal.email')}:</strong> contact@educly.app</li>
              <li><strong>{t('legal.website')}:</strong> educly.app</li>
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CookiesPolicy;