import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Shop = () => {
  const { t } = useTranslation();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return t("product.other");
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || t("product.other");
  };

  const filteredAndSortedProducts = useMemo(() => {
    if (!products) return [];

    let filtered = [...products];

    // Filtering
    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Sorting
    switch (sortOrder) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      default:
        // No default sorting, keeps original order (usually by creation date)
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortOrder]);

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
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                image={product.image_url || "/placeholder.svg"}
                name={product.name}
                category={getCategoryName(product.category_id)}
                price={product.price.toFixed(0)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">{t("shop.noProducts")}</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Shop;