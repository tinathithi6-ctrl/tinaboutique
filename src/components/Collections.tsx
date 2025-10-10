import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Collections = () => {
  const { t } = useTranslation();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId || !categories) return t("product.other");
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || t("product.other");
  };

  return (
    <section className="py-20 bg-background" id="shop">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4 animate-slide-up">
            {t("collections.title")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            {t("collections.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {productsLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-4">
                <Skeleton className="h-[400px] w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : products && products.length > 0 ? (
            products.slice(0, 4).map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <ProductCard
                  image={product.images?.[0] || "/placeholder.svg"}
                  name={product.name}
                  category={getCategoryName(product.category_id)}
                  price={Number(product.price_eur || 0).toFixed(0)}
                />
              </div>
            ))
          ) : (
            <div className="col-span-4 text-center py-12">
              <p className="text-muted-foreground">{t("collections.noProducts")}</p>
            </div>
          )}
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: "0.6s" }}>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
              {t("collections.viewAll")}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Collections;
