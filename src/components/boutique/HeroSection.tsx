import { useEffect } from 'react';
import { ShoppingCart, Heart, Search, Truck, Award, Headphones } from 'lucide-react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: 'ease-out',
    });
  }, []);

  return (
    <section className="relative bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-20 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8">
            <div data-aos="fade-up" data-aos-delay="100">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Découvrez des Produits <span className="text-gold">Extraordinaires</span>
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Explorez notre collection soigneusement sélectionnée d'articles premium conçus pour améliorer votre style de vie. 
                De la mode à la technologie, trouvez tout ce dont vous avez besoin avec des offres exclusives et une livraison rapide.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4" data-aos="fade-up" data-aos-delay="200">
              <Link
                to="/category/robes"
                className="px-8 py-4 bg-gold text-white font-semibold rounded-lg hover:bg-gold/90 transition-all transform hover:scale-105 shadow-lg"
              >
                Acheter Maintenant
              </Link>
              <Link
                to="/about"
                className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-50 transition-all border-2 border-gray-200"
              >
                Parcourir les Catégories
              </Link>
            </div>

            {/* Features List */}
            <div className="flex flex-wrap gap-8 pt-4" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <Truck className="h-6 w-6 text-gold" />
                </div>
                <span className="font-medium text-gray-700">Livraison Gratuite</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <Award className="h-6 w-6 text-gold" />
                </div>
                <span className="font-medium text-gray-700">Garantie Qualité</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gold/10 rounded-full flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-gold" />
                </div>
                <span className="font-medium text-gray-700">Support 24/7</span>
              </div>
            </div>
          </div>

          {/* Right Visual Content */}
          <div className="relative" data-aos="fade-left" data-aos-delay="200">
            {/* Featured Product Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-auto">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/assets/img/femme-afro-americaine-a-la-mode-en-chemise-rouge-et-jupe-en-jean-avec-veste-posee-au-magasin-de-vetements-il-est-temps-de-faire-du-shopping.jpg')" }}
              >
                <div className="absolute -top-4 -right-4 bg-gold text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                  Meilleure Vente
                </div>
              </div>
              
              <div className="aspect-square rounded-xl overflow-hidden mb-4">
                <img
                  src="/assets/img/product/product-2.webp"
                  alt="Produit Premium"
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-gray-900">Casque Sans Fil Premium</h4>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-gold">299€</span>
                  <span className="text-lg text-gray-400 line-through">399€</span>
                </div>
              </div>
            </div>

            {/* Mini Products Grid */}
            <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
              <div
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                data-aos="zoom-in"
                data-aos-delay="400"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src="/assets/img/product/product-3.webp"
                    alt="Produit"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">89€</span>
              </div>
              
              <div
                className="bg-white rounded-xl shadow-lg p-4 hover:shadow-xl transition-shadow"
                data-aos="zoom-in"
                data-aos-delay="500"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-2">
                  <img
                    src="/assets/img/product/product-5.webp"
                    alt="Produit"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">149€</span>
              </div>
            </div>

            {/* Floating Icons */}
            <div className="absolute -right-4 top-1/4 space-y-4">
              <div
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform relative"
                data-aos="fade-up"
                data-aos-delay="600"
              >
                <ShoppingCart className="h-6 w-6 text-gold" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  3
                </span>
              </div>
              
              <div
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                data-aos="fade-up"
                data-aos-delay="700"
              >
                <Heart className="h-6 w-6 text-gold" />
              </div>
              
              <div
                className="w-14 h-14 bg-white rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                data-aos="fade-up"
                data-aos-delay="800"
              >
                <Search className="h-6 w-6 text-gold" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default HeroSection;
