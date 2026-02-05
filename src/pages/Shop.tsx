import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import { useCurrency } from '@/contexts/CurrencyContext';
import { ProductService, CategoryService, Product, Category } from '@/services/productService';

const Shop = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { format } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          ProductService.getAllProducts(),
          CategoryService.getAllCategories()
        ]);

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err: any) {
        console.error("Failed to fetch data:", err);
        toast.error("Impossible de charger les produits. Vérifiez votre connexion.");
        setProducts([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return t("product.other");
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || t("product.other");
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filtering
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => String(p.category_id) === selectedCategory);
    }

    // Sorting
    switch (sortOrder) {
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA = a.pricing?.finalPrice || a.price_eur;
          const priceB = b.pricing?.finalPrice || b.price_eur;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA = a.pricing?.finalPrice || a.price_eur;
          const priceB = b.pricing?.finalPrice || b.price_eur;
          return priceB - priceA;
        });
        break;
      default:
        // No default sorting, keeps original order (usually by creation date)
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortOrder]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: Number(product.price_eur),
      image: product.images?.[0] || '/placeholder.svg'
    }, 1);
    toast.success(`${product.name} ajouté au panier !`);

    if (!user) {
      toast.info('Connectez-vous pour sauvegarder votre panier entre sessions.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">{t("shop.title")}</h1>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Category Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Filtrer par catégorie :
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full md:w-[220px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold hover:border-gold transition-colors cursor-pointer"
              >
                <option value="all">
                  ✨ Toutes les catégories ({products.length})
                </option>
                {categories?.map(cat => {
                  const count = products.filter(p => p.category_id === cat.id).length;
                  return (
                    <option key={cat.id} value={String(cat.id)}>
                      {cat.name} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                Trier par :
              </span>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full md:w-[220px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold hover:border-gold transition-colors cursor-pointer"
              >
                <option value="default">📅 Par défaut</option>
                <option value="price-asc">💰 Prix croissant</option>
                <option value="price-desc">💎 Prix décroissant</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="hidden md:block text-sm text-gray-600">
              <span className="font-semibold text-gold">{filteredAndSortedProducts.length}</span>
              {' '}produit{filteredAndSortedProducts.length > 1 ? 's' : ''} trouvé{filteredAndSortedProducts.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={`product-${product.id}`}
                image={product.images[0] || "/placeholder.svg"}
                name={product.name}
                category={getCategoryName(Number(product.category_id))}
                price={format(Number(product.pricing?.finalPrice || product.price_eur))}
                originalPrice={product.pricing?.discountApplied ? format(Number(product.pricing.originalPrice)) : undefined}
                discountApplied={product.pricing?.discountApplied || false}
                discountType={product.pricing?.discountApplied ? 'percentage' : undefined}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))
          ) : (
            <div key="no-products" className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">{t("shop.noProducts")}</p>
              <p className="text-muted-foreground text-sm mt-2">Les produits ajoutés par l'administrateur apparaîtront ici automatiquement.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;