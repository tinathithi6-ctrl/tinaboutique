import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  image: string;
  name: string;
  category: string;
  price: string;
}

const ProductCard = ({ image, name, category, price }: ProductCardProps) => {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-smooth animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center gap-3">
          <Button variant="gold" size="sm" className="shadow-lg">
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t("product.addToBag")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shadow-lg bg-card/90 backdrop-blur-sm"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart
              className={`h-4 w-4 transition-all ${isLiked ? "fill-gold text-gold" : ""}`}
            />
          </Button>
        </div>

        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-gold text-primary text-xs font-semibold font-heading px-3 py-1 rounded-full">
            {t("product.newBadge")}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide font-heading">
          {category}
        </p>
        <h3 className="font-heading text-lg font-semibold text-card-foreground group-hover:text-gold transition-smooth">
          {name}
        </h3>
        <p className="text-xl font-medium text-card-foreground">
          {price} <span className="text-gold">$</span>
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
