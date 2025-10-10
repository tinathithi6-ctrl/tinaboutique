import { ShoppingBag, Menu, Search, User, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import TopBar from "./TopBar";

const HeaderBootstrapStyle = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { cart } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const cartItemsCount = cart?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const wishlistCount = 0; // TODO: Ajouter contexte wishlist

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Top Bar */}
        <TopBar />

        {/* Main Header */}
        <div className="border-b border-gray-200">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-4 gap-4">
              
              {/* Logo */}
              <Link to="/" className="flex items-center shrink-0">
                <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight">
                  <span className="text-gray-900">Tina</span>
                  <span className="text-gold ml-1">NYC</span>
                </h1>
              </Link>

              {/* Search Bar - Desktop */}
              <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
                <div className="relative w-full">
                  <Input
                    type="text"
                    placeholder="Rechercher des produits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pr-12 text-base border-2 border-gray-300 focus:border-gold rounded-lg"
                  />
                  <button
                    type="submit"
                    className="absolute right-0 top-0 h-12 px-6 bg-gold hover:bg-gold/90 text-white rounded-r-lg transition-colors"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </div>
              </form>

              {/* Actions */}
              <div className="flex items-center gap-2">
                
                {/* Mobile Search Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Account Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAuthOpen(true)}
                    className="hover:bg-gray-100"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </div>

                {/* Wishlist - Desktop only */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:flex hover:bg-gray-100 relative"
                  onClick={() => navigate('/account')}
                >
                  <Heart className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {wishlistCount}
                    </span>
                  )}
                </Button>

                {/* Cart */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-gray-100"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gold text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                      {cartItemsCount}
                    </span>
                  )}
                </Button>

                {/* Mobile Menu Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="hidden lg:block border-b border-gray-200 bg-white">
          <div className="container mx-auto px-4">
            <ul className="flex items-center space-x-8 h-14">
              <li>
                <Link to="/" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/boutique" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Boutique
                </Link>
              </li>
              <li>
                <Link to="/category" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Catégories
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Produits
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Panier
                </Link>
              </li>
              <li>
                <Link to="/checkout" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Paiement
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm font-medium text-gray-700 hover:text-gold transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4">
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link
                    to="/boutique"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Boutique
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Catégories
                  </Link>
                </li>
                <li>
                  <Link
                    to="/shop"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Boutique
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Panier
                  </Link>
                </li>
                <li>
                  <Link
                    to="/checkout"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Paiement
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                  >
                    Contact
                  </Link>
                </li>
                
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link
                        to="/account"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                      >
                        Mon Compte
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="block text-sm font-medium text-gray-700 hover:text-gold py-2 w-full text-left"
                      >
                        Déconnexion
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-medium text-gray-700 hover:text-gold py-2"
                      >
                        Connexion
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="block text-sm font-semibold text-gold hover:text-gold/80 py-2"
                      >
                        Créer un compte
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>
        )}
      </header>

      {/* Spacer pour compenser le header fixed */}
      <div className="h-[148px] lg:h-[176px]" />

      {/* Dialogs - TODO: Implement these components */}
    </>
  );
};

export default HeaderBootstrapStyle;
