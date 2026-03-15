import { Link } from "react-router-dom";
import { Instagram, Linkedin, Youtube, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import logoEducy from "@/assets/logo-educy.png";
const socialLinks = [
  {
    icon: Instagram,
    href: "#",
    label: "Instagram",
  },
  {
    icon: Linkedin,
    href: "#",
    label: "LinkedIn",
  },
  {
    icon: Youtube,
    href: "#",
    label: "YouTube",
  },
  {
    icon: Twitter,
    href: "#",
    label: "Twitter",
  },
];
export const Footer = () => {
  const { t } = useTranslation();
  const footerLinks = {
    programas: [
      {
        name: t("landing.footer.links.aiFundamentals"),
        href: "#",
      },
      {
        name: t("landing.footer.links.machineLearning"),
        href: "#",
      },
      {
        name: t("landing.footer.links.deepLearning"),
        href: "#",
      },
      {
        name: t("landing.footer.links.aiForBusiness"),
        href: "#",
      },
    ],
    recursos: [
      {
        name: t("landing.footer.links.blog"),
        href: "#",
      },
      {
        name: t("landing.footer.links.webinars"),
        href: "#",
      },
      {
        name: t("landing.footer.links.ebooks"),
        href: "#",
      },
      {
        name: t("landing.footer.links.community"),
        href: "#",
      },
    ],
    empresa: [
      {
        name: t("landing.footer.links.aboutUs"),
        href: "#",
      },
      {
        name: t("landing.footer.links.careers"),
        href: "#",
      },
      {
        name: t("landing.footer.links.partnerships"),
        href: "#",
      },
      {
        name: t("landing.footer.links.contact"),
        href: "/contato",
        isRoute: true,
      },
    ],
    legal: [
      {
        name: t("landing.footer.links.terms"),
        href: "/termos",
        isRoute: true,
      },
      {
        name: t("landing.footer.links.privacy"),
        href: "/privacidade",
        isRoute: true,
      },
      {
        name: t("landing.footer.links.cookies"),
        href: "/cookies",
        isRoute: true,
      },
      {
        name: t("landing.footer.links.refund"),
        href: "/cancelamento",
        isRoute: true,
      },
      {
        name: t("landing.footer.links.subscriptionTerms"),
        href: "/termos-assinatura",
        isRoute: true,
      },
    ],
  };
  return (
    <footer id="contato" className="bg-secondary text-secondary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <img src={logoEducy} alt="Educy" className="h-8" />
            </Link>
            <p className="text-secondary-foreground/70 text-sm mb-4">{t("landing.footer.description")}</p>
            <p className="text-secondary-foreground/70 text-sm">
              <span className="font-medium">{t("landing.footer.contact")}:</span>{" "}
              <a href="mailto:contact@educly.app" className="hover:text-secondary-foreground transition-colors">
                contact@educly.app
              </a>
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold mb-4">{t("landing.footer.programs")}</h4>
            <ul className="space-y-2">
              {footerLinks.programas.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("landing.footer.resources")}</h4>
            <ul className="space-y-2">
              {footerLinks.recursos.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("landing.footer.company")}</h4>
            <ul className="space-y-2">
              {footerLinks.empresa.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4">{t("landing.footer.legal")}</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-secondary-foreground/70 hover:text-secondary-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 space-y-6">
          <div className="text-center space-y-4">
            <p className="text-sm text-secondary-foreground/80 font-medium">
              {t("company.ownershipStatement")}
            </p>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-xs text-secondary-foreground/60">
              {/* Empresa 1: Contra Estatistica */}
              <div className="max-w-xs">
                <p className="font-bold text-secondary-foreground/80 mb-1">
                  Contra Estatistica Digital Marketers LLC
                </p>
                <p>
                  1209 Mountain Road Pl NE, Ste R, Albuquerque, NM 87110, United States
                  <br />
                  EIN: 39-4917931
                </p>
              </div>

              {/* Divisor Visual */}
              <div className="hidden md:block w-px h-10 bg-white/10"></div>
              <div className="block md:hidden w-16 h-px bg-white/10"></div>

              {/* Empresa 2: SELLCORE */}
              <div className="max-w-xs">
                <p className="font-bold text-secondary-foreground/80 mb-1">
                  SELLCORE LTD.
                </p>
                <p>empresas
                  {t("company.registration")}: C 62598 • Saint Kitts and Nevis
                  <br />
                  Suites 5 Horsford's Business Centre, Long Point Road, Charlestown, Nevis
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-secondary-foreground/60 text-center">
            © {new Date().getFullYear()} Educly. {t("landing.footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
};