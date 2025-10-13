import { useState } from 'react';
import { useCurrency } from '@/contexts/CurrencyContext';
import { Minus, Plus, Heart, ShoppingCart, Zap, Truck, RotateCcw, Shield, Headphones, Check } from 'lucide-react';
import { toast } from 'react-toastify';

interface ProductInfoProps {
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  inStock: boolean;
  stockCount?: number;
  colors?: Array<{ name: string; value: string; gradient: string }>;
  sizes?: string[];
  onAddToCart?: (quantity: number) => void;
}

const ProductInfo = ({
  name,
  category,
  price,
  oldPrice,
  rating,
  reviewCount,
  description,
  inStock,
  stockCount,
  colors = [],
  sizes = [],
  onAddToCart
}: ProductInfoProps) => {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || '');
  const [selectedSize, setSelectedSize] = useState(sizes[0] || '');
  const [quantity, setQuantity] = useState(1);

  const { format } = useCurrency();

  const discount = oldPrice ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
  const savings = oldPrice ? (oldPrice - price).toFixed(2) : 0;

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && (!stockCount || newQuantity <= stockCount)) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(quantity);
    } else {
      toast.success(`${name} ajouté au panier !`);
    }
  };

  const handleBuyNow = () => {
    toast.info('Redirection vers le paiement...');
  };

  const handleAddToWishlist = () => {
    toast.success('Ajouté à la liste de souhaits !');
  };

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-5 h-5 ${
            star <= Math.floor(rating)
              ? 'text-yellow-400 fill-current'
              : star - 0.5 === rating
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
          viewBox="0 0 20 20"
        >
          {star - 0.5 === rating ? (
            <defs>
              <linearGradient id="half-star">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
          ) : null}
          <path
            fill={star - 0.5 === rating ? 'url(#half-star)' : 'currentColor'}
            d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
          />
        </svg>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Category & Rating */}
      <div className="flex items-center justify-between">
        <span className="px-3 py-1 bg-gold/10 text-gold text-sm font-medium rounded-full">
          {category}
        </span>
        <div className="flex items-center gap-2">
          {renderStars(rating)}
          <span className="text-sm text-gray-600">({reviewCount} avis)</span>
        </div>
      </div>

      {/* Product Name */}
      <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
        {name}
      </h1>

      {/* Pricing */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-gray-900">{format(price)}</span>
          {oldPrice && (
            <span className="text-2xl text-gray-400 line-through">{format(oldPrice)}</span>
          )}
        </div>
        {oldPrice && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600 font-semibold">Économisez {savings}€</span>
            <span className="text-gray-600">({discount}% de réduction)</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 leading-relaxed">{description}</p>

      {/* Availability */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {inStock ? (
            <>
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">En stock</span>
            </>
          ) : (
            <>
              <span className="font-medium text-red-600">Rupture de stock</span>
            </>
          )}
        </div>
        {stockCount && (
          <span className="text-sm text-gray-600">
            Plus que {stockCount} articles disponibles
          </span>
        )}
      </div>

      {/* Color Selection */}
      {colors.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">
            Couleurs disponibles:
          </label>
          <div className="flex items-center gap-3">
            {colors.map((color) => (
              <button
                key={color.name}
                onClick={() => setSelectedColor(color.name)}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  selectedColor === color.name
                    ? 'border-gold scale-110 shadow-lg'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ background: color.gradient }}
                title={color.name}
              >
                {selectedColor === color.name && (
                  <Check className="h-5 w-5 text-white mx-auto drop-shadow-lg" />
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Sélectionné: <span className="font-medium">{selectedColor}</span>
          </p>
        </div>
      )}

      {/* Size Selection */}
      {sizes.length > 0 && (
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-900">Taille:</label>
          <div className="flex items-center gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                  selectedSize === size
                    ? 'border-gold bg-gold text-white'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity & Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-900">Quantité:</label>
          <div className="flex items-center border-2 border-gray-300 rounded-lg">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border-x-2 border-gray-300 py-2 focus:outline-none"
              min="1"
              max={stockCount}
            />
            <button
              onClick={() => handleQuantityChange(1)}
              className="p-2 hover:bg-gray-100 transition-colors"
              disabled={stockCount ? quantity >= stockCount : false}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 py-3 bg-gold text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gold/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-5 w-5" />
            Ajouter au Panier
          </button>
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="flex-1 py-3 bg-gray-900 text-white rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Zap className="h-5 w-5" />
            Acheter Maintenant
          </button>
          <button
            onClick={handleAddToWishlist}
            className="p-3 border-2 border-gray-300 rounded-lg hover:border-gold hover:text-gold transition-colors"
            title="Ajouter à la liste de souhaits"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-3 pt-6 border-t border-gray-200">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Truck className="h-5 w-5 text-gold" />
          <span>Livraison gratuite pour les commandes de plus de 75€</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <RotateCcw className="h-5 w-5 text-gold" />
          <span>Retours sans tracas sous 45 jours</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Shield className="h-5 w-5 text-gold" />
          <span>Garantie fabricant de 3 ans</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Headphones className="h-5 w-5 text-gold" />
          <span>Support client disponible 24/7</span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
