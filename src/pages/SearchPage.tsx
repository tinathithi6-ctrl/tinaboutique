import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  price_eur: number;
  images: string[];
  category_id?: number;
}

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Charger tous les produits au montage
        const fetchProducts = async () => {
          try {
            const data = await (await import('@/lib/api')).apiFetch('/api/products');
            setAllProducts(Array.isArray(data) ? data : []);
          } catch (error) {
            console.error('Erreur lors du chargement des produits:', error);
          }
        };

    fetchProducts();
  }, []);

  useEffect(() => {
    // Filtrer les produits en temps réel
    if (searchQuery.trim() === "") {
      setFilteredProducts([]);
    } else {
      const query = searchQuery.toLowerCase();
      const results = allProducts.filter(product =>
        product.name.toLowerCase().includes(query)
      );
      setFilteredProducts(results);
    }
  }, [searchQuery, allProducts]);

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredProducts([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          {/* Titre */}
          <h1 className="text-4xl font-heading font-bold text-center mb-8">
            Rechercher des Produits
          </h1>

          {/* Barre de recherche */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom de produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-12 py-6 text-lg"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Résultats */}
          {searchQuery && (
            <div className="mb-4 text-gray-600">
              {filteredProducts.length} résultat(s) trouvé(s)
            </div>
          )}

          {/* Liste des produits */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
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
                      <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gold font-bold text-xl">
                        {product.price_eur.toFixed(2)} €
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-gray-600">
                Essayez une autre recherche
              </p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Commencez votre recherche
              </h3>
              <p className="text-gray-600">
                Tapez le nom d'un produit ci-dessus
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchPage;
