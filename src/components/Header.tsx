import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, ShoppingBag, Menu, X, LogOut, Shield, Heart } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { useCart } from "@/contexts/CartContext";


const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const { cartCount } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: t("toast.signOut.title"),
      description: t("toast.signOut.description"),
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.home"), to: "/" },
    { name: "Boutique", to: "/boutique" },
    { name: "Produits", to: "/shop" },
    { name: "Panier", to: "/cart" },
    { name: "Paiement", to: "/checkout" },
    { name: t("nav.about"), anchor: "about" },
    { name: t("nav.contact"), anchor: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in ${isScrolled
        ? "bg-white shadow-lg"
        : "bg-gradient-to-b from-black/30 to-transparent"
        }`}
    >
      <div className="container mx-auto px-7">
        <div className="flex items-center justify-between h-40">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300">
            <img
              src="/image/LOGO.png"
              alt="Boutique Tina la New-Yorkaise"
              className={`h-40 w-40 rounded-full object-cover transition-all duration-300 ${isScrolled ? "shadow-md" : "shadow-2xl ring-4 ring-white/20"
                }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const linkClasses = `font-heading font-medium transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold after:transition-all after:duration-300 hover:after:w-full hover:scale-105 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                }`;

              if (link.to) {
                return (
                  <Link key={link.name} to={link.to} className={linkClasses}>
                    {link.name}
                  </Link>
                );
              }
              if (link.anchor) {
                const href = location.pathname === "/" ? `#${link.anchor}` : `/#${link.anchor}`;
                return (
                  <a key={link.name} href={href} className={linkClasses}>
                    {link.name}
                  </a>
                );
              }
              return null;
            })}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />

            {/* Recherche */}
            <Link to="/search">
              <button
                className={`hidden md:block transition-all duration-300 hover:scale-110 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                  }`}
                title="Rechercher"
              >
                <Search className="h-5 w-5" />
              </button>
            </Link>

            {/* Favoris */}
            <Link to="/wishlist">
              <button
                className={`hidden md:block transition-all duration-300 hover:scale-110 relative ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                  }`}
                title="Mes Favoris"
              >
                <Heart className="h-5 w-5" />
              </button>
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <button
                      className={`hidden md:block transition-all duration-300 hover:scale-110 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                        }`}
                      title={t("header.admin")}
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                  </Link>
                )}
                <Link to="/profile">
                  <button
                    className={`hidden md:block transition-all duration-300 hover:scale-110 relative ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                      }`}
                  >
                    <User className="h-5 w-5" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`hidden md:block transition-all duration-300 hover:scale-110 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                    }`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button
                  className={`hidden md:block transition-all duration-300 hover:scale-110 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                    }`}
                >
                  <User className="h-5 w-5" />
                </button>
              </Link>
            )}
            <Link to="/cart">
              <button
                className={`transition-all duration-300 hover:scale-110 relative ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                  }`}
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gold text-primary text-xs font-semibold font-heading rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden transition-colors duration-300 ${isScrolled ? "text-primary" : "text-white drop-shadow-lg"
                }`}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map((link) => {
              const linkClasses = "font-heading font-medium text-primary hover:text-gold transition-colors";

              if (link.to) {
                return (
                  <Link
                    key={link.name}
                    to={link.to}
                    className={linkClasses}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                );
              }
              if (link.anchor) {
                const href = location.pathname === "/" ? `#${link.anchor}` : `/#${link.anchor}`;
                return (
                  <a
                    key={link.name}
                    href={href}
                    className={linkClasses}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                );
              }
              return null;
            })}
            <div className="flex gap-4 pt-4 border-t border-border">
              <Link to="/search">
                <Button variant="ghost" size="icon" title="Rechercher">
                  <Search className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" title="Mes Favoris">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" title={t("header.admin")}>
                        <Shield className="h-5 w-5" />
                      </Button>
                    </Link>
                  )}
                  <Link to="/profile">
                    <Button variant="ghost" size="icon" className="relative">
                      <User className="h-5 w-5" />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
