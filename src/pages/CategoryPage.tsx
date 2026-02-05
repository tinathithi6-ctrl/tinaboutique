import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { ChevronRight } from 'lucide-react';
import { ProductService, CategoryService, Product, Category } from '@/services/productService';
import { Link } from 'react-router-dom';
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

const CategoryPage = () => {
  const { name } = useParams<{ name: string }>();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState("default");

  const fetchProducts = async () => {
    try {
      const data = await ProductService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await CategoryService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setProductsLoading(true);
      setCategoriesLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setProductsLoading(false);
      setCategoriesLoading(false);
    };

    loadData();
  }, []);

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId || !categories) return 'Autre';
    const category = categories.find((cat) => String(cat.id) === String(categoryId));
    return category?.name || 'Autre';
  };

  const categoryId = categories.find(cat => cat.name.toLowerCase() === name?.toLowerCase())?.id;
  const categoryTitle = name ? name.charAt(0).toUpperCase() + name.slice(1) : 'Catégorie';

  const filteredAndSortedProducts = useMemo(() => {
    if (!products || !categoryId) return [];

    let filtered = products.filter(p => String(p.category_id) === String(categoryId));

    // Sorting
    switch (sortOrder) {
      case "price-asc":
        filtered.sort((a, b) => {
          const priceA = a.pricing?.finalPrice || a.price_eur;
          const priceB = b.pricing?.finalPrice || b.price_eur;
          return priceA - priceB;
        });
        break;
      case "price-desc":
        filtered.sort((a, b) => {
          const priceA = a.pricing?.finalPrice || a.price_eur;
          const priceB = b.pricing?.finalPrice || b.price_eur;
          return priceB - priceA;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [products, categoryId, sortOrder]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: String(product.id),
      name: product.name,
      price: Number(product.price_eur),
      image: product.images?.[0] || '/placeholder.svg'
    }, 1);
    toast.success(`${product.name} ajouté au panier !`);

    if (!user) {
      toast.info('Connectez-vous pour sauvegarder votre panier entre sessions.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
              <Link to="/boutique" className="text-gray-600 hover:text-gold transition-colors">
                Boutique
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">{categoryTitle}</span>
            </nav>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="space-y-4 mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground">
            {categoryTitle}
          </h1>
          <p className="text-muted-foreground text-lg">
            Découvrez notre collection {categoryTitle.toLowerCase()}
          </p>
        </div>

        {/* Sorting */}
        <div className="flex justify-center items-center mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Trier par :</span>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-[180px] px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gold focus:border-gold hover:border-gold transition-colors cursor-pointer"
            >
              <option value="default">Par défaut</option>
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {productsLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="space-y-4">
                <div className="aspect-[4/5] bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))
          ) : filteredAndSortedProducts.length > 0 ? (
            filteredAndSortedProducts.map((product) => (
              <ProductCard
                key={`product-${product.id}`}
                image={product.images[0] || "/placeholder.svg"}
                name={product.name}
                category={getCategoryName(Number(product.category_id))}
                price={Number(product.pricing?.finalPrice || product.price_eur).toFixed(0)}
                originalPrice={product.pricing?.discountApplied ? Number(product.pricing.originalPrice).toFixed(0) : undefined}
                discountApplied={product.pricing?.discountApplied || false}
                discountType={product.pricing?.discountApplied ? 'percentage' : undefined}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">Aucun produit trouvé</p>
              <p className="text-muted-foreground text-sm mt-2">
                Il n'y a actuellement aucun produit dans la catégorie "{categoryTitle}".
              </p>
              <Link
                to="/shop"
                className="inline-block mt-4 px-6 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors"
              >
                Voir tous les produits
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
