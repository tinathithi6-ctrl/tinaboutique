import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, User, ShoppingBag, Menu, X, LogOut, Shield } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import logo from "../../image/LOGO.png";

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
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
    { name: t("nav.shop"), to: "/shop" },
    { name: t("nav.about"), anchor: "about" },
    { name: t("nav.contact"), anchor: "contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 animate-fade-in ${
        isScrolled
          ? "bg-white shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-7">
        <div className="flex items-center justify-between h-40">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="Boutique Tina la New-Yorkaise" className="h-40 w-40 rounded-full object-cover shadow-sm" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const linkClasses = `font-heading font-medium transition-all duration-300 relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-gold after:transition-all after:duration-300 hover:after:w-full hover:scale-105 ${
                isScrolled ? "text-primary" : "text-white"
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
            <button
              className={`hidden md:block transition-all duration-300 hover:scale-110 ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            >
              <Search className="h-5 w-5" />
            </button>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin">
                    <button
                      className={`hidden md:block transition-all duration-300 hover:scale-110 ${
                        isScrolled ? "text-primary" : "text-white"
                      }`}
                      title={t("header.admin")}
                    >
                      <Shield className="h-5 w-5" />
                    </button>
                  </Link>
                )}
                <Link to="/profile">
                  <button
                    className={`hidden md:block transition-all duration-300 hover:scale-110 ${
                      isScrolled ? "text-primary" : "text-white"
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </Link>
                <button
                  onClick={handleSignOut}
                  className={`hidden md:block transition-all duration-300 hover:scale-110 ${
                    isScrolled ? "text-primary" : "text-white"
                  }`}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <Link to="/auth">
                <button
                  className={`hidden md:block transition-all duration-300 hover:scale-110 ${
                    isScrolled ? "text-primary" : "text-white"
                  }`}
                >
                  <User className="h-5 w-5" />
                </button>
              </Link>
            )}
            <button
              className={`transition-all duration-300 hover:scale-110 relative ${
                isScrolled ? "text-primary" : "text-white"
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-2 -right-2 bg-gold text-primary text-xs font-semibold font-heading rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden transition-colors duration-300 ${
                isScrolled ? "text-primary" : "text-white"
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
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
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
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
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
