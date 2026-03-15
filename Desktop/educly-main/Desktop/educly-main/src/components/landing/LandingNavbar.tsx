import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import logoEducy from "@/assets/logo-educy.png";

export const LandingNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  const navLinks = [{
    name: t('landing.nav.home'),
    href: "/#inicio"
  }, {
    name: t('landing.nav.about'),
    href: "/#sobre"
  }, {
    name: t('landing.nav.testimonials'),
    href: "/#depoimentos"
  }, {
    name: t('landing.nav.plan'),
    href: "/#plano"
  }, {
    name: t('landing.nav.contact'),
    href: "/contato",
    isRoute: true
  }];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={logoEducy} alt="Educy" className="h-12 md:h-14" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.name}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.name}
                </a>
              )
            ))}
            <Link to="/auth">
              <Button className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold px-6">
                {t('landing.nav.login', 'Login')}
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map(link => (
                link.isRoute ? (
                  <Link 
                    key={link.href} 
                    to={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 truncate" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    key={link.href} 
                    href={link.href} 
                    className="text-muted-foreground hover:text-primary transition-colors font-medium py-2 truncate" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )
              ))}
              <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold">
                  {t('landing.nav.login', 'Login')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};