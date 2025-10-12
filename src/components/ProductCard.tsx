import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  image: string;
  name: string;
  category: string;
  price: string;
  originalPrice?: string;
  discountApplied?: boolean;
  discountType?: string;
  onAddToCart?: () => void;
}

const ProductCard = ({ image, name, category, price, originalPrice, discountApplied, discountType, onAddToCart }: ProductCardProps) => {
  const { t } = useTranslation();
  const [isLiked, setIsLiked] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Fonction pour obtenir l'URL complète de l'image
  const getImageUrl = (imagePath: string) => {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Pour les images uploadées localement
    if (imagePath.startsWith('/uploads/')) {
      return `http://localhost:3001${imagePath}`;
    }
    // Fallback
    return imagePath;
  };

  return (
    <div className="group relative bg-card rounded-lg overflow-hidden shadow-elegant hover:shadow-gold transition-smooth animate-fade-in">
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        {!imageError ? (
          <img
            src={getImageUrl(image)}
            alt={name}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center text-muted-foreground">
              <div className="text-4xl mb-2">📷</div>
              <div className="text-sm">Image non disponible</div>
            </div>
          </div>
        )}
        
        {/* Overlay Actions */}
        <div className="absolute inset-0 bg-primary/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 z-10">
          <Button
            variant="gold"
            size="sm"
            className="shadow-lg hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart();
              }
            }}
          >
            <ShoppingBag className="h-4 w-4 mr-2" />
            {t("product.addToBag")}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="shadow-lg bg-card/90 backdrop-blur-sm hover:scale-105 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
          >
            <Heart
              className={`h-4 w-4 transition-all ${isLiked ? "fill-gold text-gold" : ""}`}
            />
          </Button>
        </div>
        
        {/* Quick Add Button (Always Visible on Mobile) */}
        <div className="md:hidden absolute bottom-2 right-2 z-20">
          <Button
            variant="gold"
            size="icon"
            className="shadow-lg rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              if (onAddToCart) {
                onAddToCart();
              }
            }}
          >
            <ShoppingBag className="h-4 w-4" />
          </Button>
        </div>

        {/* Badge */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          {discountApplied && (
            <span className="bg-red-500 text-white text-xs font-semibold font-heading px-3 py-1 rounded-full">
              {discountType === 'promotion' ? 'PROMO' :
               discountType === 'bulk' ? 'QUANTITÉ' :
               discountType === 'promotion+bulk' ? 'PROMO+QTÉ' : 'RÉDUCTION'}
            </span>
          )}
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
        <div className="flex items-center gap-2">
          {discountApplied && originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice}€
            </span>
          )}
          <p className={`text-xl font-medium ${discountApplied ? 'text-red-600' : 'text-card-foreground'}`}>
            {price}€
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
