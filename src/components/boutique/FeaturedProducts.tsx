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

const products: Product[] = [
  {
    id: '1',
    name: 'Robe Élégante Manhattan',
    price: 289,
    oldPrice: 359,
    image: '/assets/img/product/product-f-1.webp',
    badge: 'sale',
    discount: 20,
    rating: 4.5,
  },
  {
    id: '2',
    name: 'Ensemble Chic Brooklyn',
    price: 199,
    image: '/assets/img/product/product-f-2.webp',
    badge: 'new',
    rating: 5,
  },
  {
    id: '3',
    name: 'Tailleur Queens',
    price: 349,
    oldPrice: 449,
    image: '/assets/img/product/product-f-3.webp',
    badge: 'sale',
    discount: 22,
    rating: 4.8,
  },
  {
    id: '4',
    name: 'Robe Cocktail Soho',
    price: 259,
    image: '/assets/img/product/product-f-4.webp',
    rating: 4.7,
  },
  {
    id: '5',
    name: 'Blazer Premium',
    price: 299,
    oldPrice: 399,
    image: '/assets/img/product/product-f-5.webp',
    badge: 'sale',
    discount: 25,
    rating: 4.9,
  },
  {
    id: '6',
    name: 'Ensemble Casual',
    price: 179,
    image: '/assets/img/product/product-f-6.webp',
    badge: 'new',
    rating: 4.6,
  },
  {
    id: '7',
    name: 'Robe Longue Élégante',
    price: 329,
    image: '/assets/img/product/product-f-7.webp',
    rating: 4.8,
  },
  {
    id: '8',
    name: 'Tenue Business',
    price: 399,
    oldPrice: 499,
    image: '/assets/img/product/product-f-8.webp',
    badge: 'sale',
    discount: 20,
    rating: 5,
  },
];

const FeaturedProducts = () => {
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Produits en Vedette
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez notre sélection de produits premium, choisis avec soin pour leur qualité exceptionnelle
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300"
              data-aos="fade-up"
              data-aos-delay={index * 100}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
            >
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-3 left-3 z-10">
                  {product.badge === 'new' ? (
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      NOUVEAU
                    </span>
                  ) : (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      -{product.discount}%
                    </span>
                  )}
                </div>
              )}

              {/* Quick Actions */}
              <div
                className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${
                  hoveredProduct === product.id
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-4'
                }`}
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

                {/* Rating */}
                <div className="mb-3">{renderStars(product.rating)}</div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {product.price}€
                  </span>
                  {product.oldPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {product.oldPrice}€
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                    hoveredProduct === product.id
                      ? 'bg-gold text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  Ajouter au Panier
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12" data-aos="fade-up">
          <Link
            to="/category/robes"
            className="inline-block px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Voir Tous les Produits
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
