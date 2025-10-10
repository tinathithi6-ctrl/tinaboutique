import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductGallery from "@/components/boutique/ProductGallery";
import ProductInfo from "@/components/boutique/ProductInfo";
import ProductTabs from "@/components/boutique/ProductTabs";
import { ChevronRight, ShoppingCart, Heart, Eye } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { useState, useEffect } from 'react';

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
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Produit non trouvé');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = (productData: { id: string; name: string; price: number; image: string; }, quantity = 1) => {
    if (!user) {
      toast.info('Veuillez vous connecter pour ajouter des articles au panier.');
      navigate('/auth');
      return;
    }
    addToCart(productData, quantity);
    toast.success(`${quantity} x ${productData.name} ajouté au panier !`);
  };

  // Produits similaires (pourrait être remplacé par un appel API)
  const relatedProducts = [
    {
      id: '1',
      name: 'Robe Cocktail Élégante',
      price: 149.99,
      oldPrice: 199.99,
      image: '/assets/img/product/product-1.webp',
      rating: 5
    },
    {
      id: '2',
      name: 'Robe Longue Soirée',
      price: 229.99,
      image: '/assets/img/product/product-2.webp',
      rating: 4
    },
    {
      id: '3',
      name: 'Robe Casual Chic',
      price: 89.99,
      image: '/assets/img/product/product-3.webp',
      rating: 5
    },
    {
      id: '4',
      name: 'Robe d\'Été Légère',
      price: 79.99,
      oldPrice: 99.99,
      image: '/assets/img/product/product-4.webp',
      rating: 4
    }
  ];

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
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Chargement du produit...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Erreur</h2>
          <p>{error || 'Le produit que vous cherchez n\'existe pas.'}</p>
          <Link to="/shop" className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded">
            Retour à la boutique
          </Link>
        </div>
        <Footer />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-0">
              Détails du Produit
            </h1>
            <nav className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-gold transition-colors">
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <Link to="/category" className="text-gray-600 hover:text-gold transition-colors">
                Catégorie
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <ProductGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo
              name={product.name}
              category={"Catégorie à définir"} // TODO: Récupérer le nom de la catégorie
              price={product.price_eur}
              oldPrice={undefined} // TODO: Gérer les promotions
              rating={4.5} // Statique pour l'instant
              reviewCount={0} // Statique pour l'instant
              description={product.description}
              inStock={product.stock_quantity > 0}
              stockCount={product.stock_quantity}
              colors={[]} // Statique pour l'instant
              sizes={[]} // Statique pour l'instant
              onAddToCart={(quantity) => {
                handleAddToCart({
                  id: String(product.id),
                  name: product.name,
                  price: product.price_eur,
                  image: product.images[0]
                }, quantity);
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs
          description={product.description}
          specifications={[]} // Statique pour l'instant
          reviews={[]} // Statique pour l'instant
        />

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Produits Similaires</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/product/${relatedProduct.id}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-t-xl relative">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {relatedProduct.oldPrice && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        PROMO
                      </span>
                    )}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
                        <Heart className="w-5 h-5" />
                      </button>
                      <button className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gold hover:text-white transition-colors">
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${relatedProduct.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                  </Link>
                  <div className="mb-3">{renderStars(relatedProduct.rating)}</div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{relatedProduct.price}€</span>
                    {relatedProduct.oldPrice && (
                      <span className="text-lg text-gray-400 line-through">{relatedProduct.oldPrice}€</span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      handleAddToCart({
                        id: relatedProduct.id,
                        name: relatedProduct.name,
                        price: relatedProduct.price,
                        image: relatedProduct.image
                      });
                    }}
                    className="w-full py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Ajouter au Panier
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
      
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default ProductDetails;
