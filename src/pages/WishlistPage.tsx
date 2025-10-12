import { useState, useEffect } from "react";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";

interface WishlistItem {
  id: number;
  name: string;
  price_eur: number;
  images: string[];
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const { toast } = useToast();
  const { addToCart } = useCart();

  useEffect(() => {
    // Charger la wishlist depuis localStorage
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, []);

  const removeFromWishlist = (productId: number) => {
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    setWishlist(updatedWishlist);
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    
    toast({
      title: "✅ Retiré des favoris",
      description: "Le produit a été retiré de votre liste de souhaits",
    });
  };

  const moveToCart = async (product: WishlistItem) => {
    try {
      const cartItem = {
        id: String(product.id),
        name: product.name,
        price: product.price_eur,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
      };
      
      await addToCart(cartItem, 1);
      removeFromWishlist(product.id);
      
      toast({
        title: "✅ Ajouté au panier",
        description: `${product.name} a été ajouté à votre panier`,
      });
    } catch (error) {
      toast({
        title: "❌ Erreur",
        description: "Impossible d'ajouter au panier",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-6xl mx-auto">
          {/* Titre */}
          <div className="flex items-center gap-3 mb-8">
            <Heart className="h-8 w-8 text-gold fill-gold" />
            <h1 className="text-4xl font-heading font-bold">
              Mes Favoris
            </h1>
          </div>

          {/* Contenu */}
          {wishlist.length > 0 ? (
            <>
              <p className="text-gray-600 mb-6">
                {wishlist.length} produit(s) dans votre liste de souhaits
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((product) => (
                  <Card key={product.id} className="hover:shadow-lg transition-shadow relative group">
                    <CardContent className="p-4">
                      {/* Bouton supprimer */}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="absolute top-6 right-6 z-10 bg-white rounded-full p-2 shadow-md hover:bg-red-50 transition-colors"
                        title="Retirer des favoris"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </button>

                      {/* Image */}
                      <Link to={`/product/${product.id}`}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-md mb-4"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                            <span className="text-gray-400">Pas d'image</span>
                          </div>
                        )}
                      </Link>

                      {/* Infos */}
                      <Link to={`/product/${product.id}`}>
                        <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 hover:text-gold transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center justify-between mt-4">
                        <p className="text-gold font-bold text-xl">
                          {product.price_eur.toFixed(2)} €
                        </p>
                        
                        <Button
                          onClick={() => moveToCart(product)}
                          size="sm"
                          className="bg-gold hover:bg-yellow-600"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <Heart className="h-24 w-24 mx-auto text-gray-300 mb-6" />
              <h2 className="text-2xl font-heading font-semibold text-gray-900 mb-3">
                Votre liste de souhaits est vide
              </h2>
              <p className="text-gray-600 mb-8">
                Ajoutez des produits à vos favoris pour les retrouver facilement
              </p>
              <Link to="/boutique">
                <Button className="bg-gold hover:bg-yellow-600">
                  Découvrir nos produits
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WishlistPage;
