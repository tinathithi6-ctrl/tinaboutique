import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  badge?: 'new' | 'sale';
  discount?: number;
  rating: number;
}

interface ProductGridProps {
  products: Product[];
  viewMode?: 'grid' | 'list';
}

const ProductCard = ({ product, viewMode }: { product: Product; viewMode: 'grid' | 'list' }) => {
  const [isHovered, setIsHovered] = useState(false);

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
      <span className="text-sm text-gray-600 ml-1">({rating})</span>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div
        className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 flex gap-6 p-4"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="w-1/4 shrink-0">
          <Link to={`/product/${product.id}`}>
            <div className="aspect-square overflow-hidden rounded-lg">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </Link>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gold transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="text-sm text-gray-600 line-clamp-2">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </div>
          {renderStars(product.rating)}
        </div>

        {/* Price & Actions */}
        <div className="w-1/4 flex flex-col items-end justify-between">
          <div className="text-right">
            <span className="text-2xl font-bold text-gray-900">{product.price}€</span>
            {product.oldPrice && (
              <span className="text-lg text-gray-400 line-through ml-2">{product.oldPrice}€</span>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full">
            <button className="w-full py-2 bg-gold text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Ajouter
            </button>
            <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 hover:bg-gray-200">
              <Heart className="w-5 h-5" />
              Favoris
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          {product.badge === 'new' ? (
            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">NOUVEAU</span>
          ) : (
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">-{product.discount}%</span>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div
        className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
      >
        <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
          <Heart className="w-5 h-5" />
        </button>
        <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
          <Eye className="w-5 h-5" />
        </button>
      </div>

      {/* Product Image */}
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] overflow-hidden rounded-t-xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        <div className="mb-3">{renderStars(product.rating)}</div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">{product.price}€</span>
          {product.oldPrice && (
            <span className="text-lg text-gray-400 line-through">{product.oldPrice}€</span>
          )}
        </div>
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${isHovered ? 'bg-gold text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          <ShoppingCart className="w-5 h-5" />
          Ajouter au Panier
        </button>
      </div>
    </div>
  );
};

const ProductGrid = ({ products, viewMode = 'grid' }: ProductGridProps) => {
  return (
    <div
      className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} viewMode={viewMode} />
      ))}
    </div>
  );
};

export default ProductGrid;
