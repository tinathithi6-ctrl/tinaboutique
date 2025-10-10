import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// Exemple de données de produits, à remplacer par une source de données réelle
const allProducts = [
  { id: '1', name: 'Robe de Soirée Élégante', category: 'robes', price: 199.99, image: '/assets/img/product/product-1.webp' },
  { id: '2', name: 'Robe d\'Été Florale', category: 'robes', price: 79.99, image: '/assets/img/product/product-2.webp' },
  { id: '3', name: 'Chemise Homme Business', category: 'homme', price: 89.99, image: '/assets/img/product/product-3.webp' },
  { id: '4', name: 'T-shirt Homme Coton Bio', category: 'homme', price: 39.99, image: '/assets/img/product/product-4.webp' },
  { id: '5', name: 'Ensemble Enfant Joueur', category: 'enfants', price: 59.99, image: '/assets/img/product/product-5.webp' },
  { id: '6', name: 'Pyjama Enfant Doux', category: 'enfants', price: 49.99, image: '/assets/img/product/product-6.webp' },
  { id: '7', name: 'Sac à Main Cuir', category: 'accessoires', price: 129.99, image: '/assets/img/product/product-7.webp' },
  { id: '8', name: 'Ceinture Classique', category: 'accessoires', price: 45.99, image: '/assets/img/product/product-8.webp' },
];

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();

  const products = allProducts.filter(p => p.category.toLowerCase() === name?.toLowerCase());
  const categoryTitle = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Catégorie';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-0">
              {categoryTitle}
            </h1>
            <nav className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-gold transition-colors">
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">{categoryTitle}</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="container mx-auto px-4 py-8">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] overflow-hidden rounded-t-xl">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-gray-900">{product.price}€</span>
                  </div>
                  <button className="w-full py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors">
                    Voir le produit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Aucun produit trouvé</h2>
            <p className="text-gray-600">
              Il n'y a actuellement aucun produit dans la catégorie "{categoryTitle}".
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
