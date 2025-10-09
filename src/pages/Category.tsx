import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/boutique/FilterSidebar";
import SortBar from "@/components/boutique/SortBar";
import ProductGrid from "@/components/boutique/ProductGrid";
import Pagination from "@/components/boutique/Pagination";
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Category = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  // Données de produits d'exemple (à remplacer par vos vraies données)
  const products = [
    {
      id: '1',
      name: 'Robe Élégante en Soie',
      price: 129.99,
      oldPrice: 179.99,
      image: '/assets/img/product/product-1.webp',
      badge: 'sale' as const,
      discount: 28,
      rating: 5
    },
    {
      id: '2',
      name: 'Ensemble Casual Chic',
      price: 89.99,
      image: '/assets/img/product/product-2.webp',
      badge: 'new' as const,
      rating: 4
    },
    {
      id: '3',
      name: 'Sac à Main Cuir Premium',
      price: 199.99,
      oldPrice: 249.99,
      image: '/assets/img/product/product-3.webp',
      badge: 'sale' as const,
      discount: 20,
      rating: 5
    },
    {
      id: '4',
      name: 'Chaussures Talons Hauts',
      price: 149.99,
      image: '/assets/img/product/product-4.webp',
      rating: 4
    },
    {
      id: '5',
      name: 'Veste en Jean Moderne',
      price: 79.99,
      image: '/assets/img/product/product-5.webp',
      badge: 'new' as const,
      rating: 5
    },
    {
      id: '6',
      name: 'Pantalon Slim Fit',
      price: 69.99,
      oldPrice: 99.99,
      image: '/assets/img/product/product-6.webp',
      badge: 'sale' as const,
      discount: 30,
      rating: 4
    },
    {
      id: '7',
      name: 'Chemisier Blanc Classique',
      price: 59.99,
      image: '/assets/img/product/product-7.webp',
      rating: 5
    },
    {
      id: '8',
      name: 'Jupe Plissée Élégante',
      price: 89.99,
      image: '/assets/img/product/product-8.webp',
      badge: 'new' as const,
      rating: 4
    },
    {
      id: '9',
      name: 'Manteau Long Hiver',
      price: 249.99,
      oldPrice: 349.99,
      image: '/assets/img/product/product-9.webp',
      badge: 'sale' as const,
      discount: 29,
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-0">
              Catégorie
            </h1>
            <nav className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-gold transition-colors">
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">Catégorie</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar - Filtres */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <FilterSidebar />
            </div>
          </div>

          {/* Main Content - Produits */}
          <div className="lg:col-span-3">
            <SortBar
              totalProducts={products.length}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
            <ProductGrid products={products} viewMode={viewMode} />
            
            <Pagination
              currentPage={currentPage}
              totalPages={10}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;
