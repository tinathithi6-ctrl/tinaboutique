import { Instagram, Facebook, Twitter, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";

const FooterNYC = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold">
              <span className="text-primary-foreground">Tina</span>
              <span className="text-gold ml-1">NYC</span>
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              L'élégance new-yorkaise à portée de main. Des collections exclusives pour un style urbain et sophistiqué.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-gold/20 hover:text-gold">
                <Twitter className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h4 className="text-lg font-serif font-semibold text-gold">Navigation</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Rechercher
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  À Propos
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Client */}
          <div className="space-y-4">
            <h4 className="text-lg font-serif font-semibold text-gold">Service Client</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shipping" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Livraison
                </Link>
              </li>
              <li>
                <Link to="/returns" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Retours & Échanges
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  Support
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-primary-foreground/70 hover:text-gold transition-smooth">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-lg font-serif font-semibold text-gold">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70">
              Inscrivez-vous pour recevoir nos offres exclusives
            </p>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
              />
              <Button variant="gold" size="icon">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-primary-foreground/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© 2025 Tina la New-Yorkaise. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link to="/terms" className="hover:text-gold transition-smooth">
                Conditions d'utilisation
              </Link>
              <Link to="/privacy" className="hover:text-gold transition-smooth">
                Confidentialité
              </Link>
              <Link to="/payment-methods" className="hover:text-gold transition-smooth">
                Paiement
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterNYC;
