import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ProductService, Product } from '@/services/productService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';


const FeaturedProducts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await ProductService.getAllProducts();
        // On ne prend que les 8 premiers produits pour la page d'accueil
        setProducts(data.slice(0, 8));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: Number(product.price_eur || 0),
      image: product.images[0] || '/placeholder.svg',
    }, 1);

    toast({
      title: "Produit ajouté",
      description: `${product.name} a été ajouté à votre panier.`,
    });

    if (!user) {
      toast({
        title: "Astuce",
        description: "Connectez-vous pour sauvegarder votre panier entre sessions.",
      });
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
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

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Produits en Vedette</h2>
          <p className="text-lg text-gray-600">Chargement des produits...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Produits en Vedette</h2>
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </section>
    );
  }

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
              {/* Badge - La logique des badges sera à réimplémenter si nécessaire */}

              {/* Quick Actions */}
              <div
                className={`absolute top-3 right-3 z-10 flex flex-col gap-2 transition-all duration-300 ${hoveredProduct === product.id
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
                    src={product.images[0] || 'https://via.placeholder.com/300x400'}
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

                {/* Rating - Temporairement statique */}
                <div className="mb-3">{renderStars(4.5)}</div>

                {/* Price */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl font-bold text-gray-900">
                    {Number(product.price_eur || 0).toFixed(2)}€
                  </span>
                  {/* La logique de l'ancien prix sera à réimplémenter */}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${hoveredProduct === product.id
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
            to="/shop" // Lien vers la page boutique principale
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
