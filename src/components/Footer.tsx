import { useTranslation } from "react-i18next";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-primary text-primary-foreground" id="contact">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-heading font-bold">
              TINA
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              {t("footer.description")}
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold hover:scale-110 transition-all">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold hover:scale-110 transition-all">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold hover:scale-110 transition-all">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold text-gold uppercase tracking-wider text-sm">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("nav.home")}
                </a>
              </li>
              <li>
                <a href="#shop" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("nav.shop")}
                </a>
              </li>
              <li>
                <a href="#about" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("nav.about")}
                </a>
              </li>
              <li>
                <a href="#contact" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("nav.contact")}
                </a>
              </li>
            </ul>
          </div>

          {/* Service Client */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold text-gold uppercase tracking-wider text-sm">{t("footer.help")}</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("footer.shipping")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("footer.returns")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("footer.faq")}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-primary-foreground/70 hover:text-gold hover:translate-x-1 inline-block transition-all">
                  {t("footer.terms")}
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-heading font-semibold text-gold uppercase tracking-wider text-sm">{t("footer.contact")}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                <span 
                  className="text-sm text-primary-foreground/70"
                  dangerouslySetInnerHTML={{ __html: t('footer.address') }}
                />
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`tel:${t('footer.phone')}`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  {t("footer.phone")}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gold flex-shrink-0" />
                <a href={`mailto:${t('footer.email')}`} className="text-sm text-primary-foreground/70 hover:text-gold transition-colors">
                  {t("footer.email")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© 2025 TINA. {t("footer.rights")}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gold transition-smooth">
                {t("footer.privacy")}
              </a>
              <a href="#" className="hover:text-gold transition-smooth">
                {t("footer.terms")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
