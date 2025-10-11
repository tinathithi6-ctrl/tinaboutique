import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

// Définition des types pour les données de l'API
interface ApiProduct {
  id: number;
  name: string;
  description: string;
  category_id: number;
  price_eur: number;
  price_usd: number;
  price_cdf: number;
  stock_quantity: number;
  images: string[];
  is_active: boolean;
  pricing?: {
    originalPrice: number;
    finalPrice: number;
    discountApplied: boolean;
    discountType?: string;
    discountAmount: number;
    currency: string;
  };
}

interface ApiCategory {
  id: number;
  name: string;
}

const Shop = () => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    // Chargement initial
    const loadData = async () => {
      setProductsLoading(true);
      setCategoriesLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setProductsLoading(false);
      setCategoriesLoading(false);
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
      filtered = filtered.filter(p => p.category_id === Number(selectedCategory));
    }

    // Sorting
    switch (sortOrder) {
      case "price-asc":
        filtered.sort((a, b) => a.price_eur - b.price_eur);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price_eur - a.price_eur);
        break;
      default:
        // No default sorting, keeps original order (usually by creation date)
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortOrder]);

  const handleAddToCart = (product: ApiProduct) => {
    if (!user) {
      toast.info('Veuillez vous connecter pour ajouter des articles au panier.');
      return;
    }
    addToCart({
      id: String(product.id),
      name: product.name,
      price: Number(product.price_eur),
      image: product.images?.[0] || '/placeholder.svg'
    }, 1);
    toast.success(`${product.name} ajouté au panier !`);
  };

  const isLoading = productsLoading || categoriesLoading;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">{t("shop.title")}</h1>
        </div>

        {/* Filters and Sorting */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("shop.filterByCategory")}:</span>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("shop.filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("shop.allCategories")}</SelectItem>
                {categories?.map(cat => (
                  <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{t("shop.sortBy")}:</span>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t("shop.sortBy")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{t("shop.sort.default")}</SelectItem>
                <SelectItem value="price-asc">{t("shop.sort.priceAsc")}</SelectItem>
                <SelectItem value="price-desc">{t("shop.sort.priceDesc")}</SelectItem>
              </SelectContent>
            </Select>
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
                category={getCategoryName(product.category_id)}
                price={Number(product.pricing?.finalPrice || product.price_eur).toFixed(0)}
                originalPrice={product.pricing?.discountApplied ? Number(product.pricing.originalPrice).toFixed(0) : undefined}
                discountApplied={product.pricing?.discountApplied || false}
                discountType={product.pricing?.discountType}
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