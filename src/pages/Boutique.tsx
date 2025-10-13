import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/boutique/HeroSection";
import PromoCards from "@/components/boutique/PromoCards";
import FeaturedProducts from "@/components/boutique/FeaturedProducts";
import Features from "@/components/boutique/Features";
import Testimonials from "@/components/boutique/Testimonials";
import Newsletter from "@/components/boutique/Newsletter";

const Boutique = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await (await import('@/lib/api')).apiFetch('/api/categories');
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />

        {/* Categories Navigation */}
        {categories.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-heading font-bold text-center mb-12 text-foreground">
                Parcourir par Catégories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.name.toLowerCase()}`}
                    className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center"
                  >
                    <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gold/20 transition-colors">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gold transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Découvrez notre collection
                    </p>
                  </Link>
                ))}
                <Link
                  to="/shop"
                  className="group bg-gradient-to-br from-gold to-gold/80 text-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 text-center"
                >
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <h3 className="text-lg font-semibold">
                    Tous les Produits
                  </h3>
                  <p className="text-sm opacity-90 mt-2">
                    Voir toute la boutique
                  </p>
                </Link>
              </div>
            </div>
          </section>
        )}

        <PromoCards />
        <FeaturedProducts />
        <Features />
        <Testimonials />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

export default Boutique;
