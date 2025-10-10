import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProducts } from "@/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const { data: products, isLoading } = useProducts();
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    if (products && query) {
      const filtered = products.filter((product: any) =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products || []);
    }
  }, [products, query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
    }
  };

  const handleAddToCart = (productData: { id: string; name: string; price: number; image: string; }, quantity = 1) => {
    if (!user) {
      toast.info('Veuillez vous connecter pour ajouter des articles au panier.');
      return;
    }
    addToCart(productData, quantity);
    toast.success(`${quantity} x ${productData.name} ajouté au panier !`);
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search Header */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Rechercher des produits</h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Rechercher des produits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 text-lg py-3"
              />
              <Button type="submit" size="lg" className="px-8">
                Rechercher
              </Button>
            </form>
            {query && (
              <p className="mt-4 text-gray-600">
                Résultats pour "<span className="font-semibold text-gray-900">{query}</span>"
                {filteredProducts.length > 0 && (
                  <span className="ml-2">
                    ({filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''})
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Search Results */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des produits...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun résultat trouvé</h2>
              <p className="text-gray-600 mb-6">
                {query
                  ? `Aucun produit ne correspond à "${query}". Essayez avec d'autres termes.`
                  : "Utilisez la barre de recherche ci-dessus pour trouver des produits."
                }
              </p>
              <Link to="/shop">
                <Button>Voir tous les produits</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="aspect-[3/4] overflow-hidden rounded-t-xl relative">
                  <Link to={`/product/${product.id}`}>
                    <img
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </Link>
                  {product.stock_quantity === 0 && (
                    <Badge variant="destructive" className="absolute top-3 left-3">
                      Rupture de stock
                    </Badge>
                  )}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                    <Link to={`/product/${product.id}`}>
                      <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </Link>
                  </div>
                </div>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="mb-3">{renderStars(4)}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">€{product.price_eur}</span>
                    {product.price_usd && (
                      <span className="text-lg text-gray-400">(${product.price_usd})</span>
                    )}
                  </div>
                  <Button
                    onClick={() => {
                      handleAddToCart({
                        id: String(product.id),
                        name: product.name,
                        price: product.price_eur,
                        image: product.images?.[0] || '/placeholder-product.jpg'
                      });
                    }}
                    className="w-full py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                    disabled={product.stock_quantity === 0}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.stock_quantity === 0 ? 'Rupture de stock' : 'Ajouter au panier'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;