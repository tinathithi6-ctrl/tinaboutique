import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryShowcase = () => {
  const { t } = useTranslation();
  const { data: categories, isLoading } = useCategories();

  // Placeholder images for categories
  const categoryImages: Record<string, string> = {
    "robes": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80",
    "accessoires": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
    "manteaux": "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    "sacs": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80",
  };

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-gold text-sm font-heading font-semibold uppercase tracking-widest mb-2">
            {t("categories.title")}
          </p>
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-4">
            {t("categories.subtitle")}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("categories.description")}
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-[400px] w-full rounded-lg" />
            ))
          ) : categories && categories.length > 0 ? (
            categories.slice(0, 3).map((category, index) => (
              <div
                key={category.id}
                className="group relative h-[400px] rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-smooth cursor-pointer animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image */}
                <img
                  src={category.image_url || categoryImages[category.slug] || "https://images.unsplash.com/photo-1558769132-cb1aea56c737?w=800&q=80"}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <p className="text-sm font-heading font-medium text-gold mb-2 uppercase tracking-wider">
                    {category.description || t("categories.defaultDescription")}
                  </p>
                  <h3 className="text-3xl font-heading font-bold mb-4">
                    {category.name}
                  </h3>
                  <Button
                    variant="outline"
                    className="w-fit border-white text-white hover:bg-white hover:text-primary transition-all group-hover:scale-105"
                  >
                    {t("categories.discover")}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12">
              <p className="text-muted-foreground">{t("categories.noCategories")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
