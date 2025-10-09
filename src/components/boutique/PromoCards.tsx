import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const PromoCards = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Large Featured Card */}
          <div
            className="relative overflow-hidden rounded-2xl shadow-xl group"
            data-aos="fade-right"
            data-aos-delay="200"
          >
            <div className="aspect-[4/3]">
              <img
                src="/assets/img/product/product-f-2.webp"
                alt="Collection Été"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <span className="inline-block px-4 py-1 bg-gold text-white text-sm font-semibold rounded-full mb-4">
                Tendance Actuelle
              </span>
              <h2 className="text-4xl font-bold mb-3">Nouvelle Collection Été</h2>
              <p className="text-gray-200 mb-6 leading-relaxed">
                Découvrez nos dernières arrivées conçues pour le style de vie moderne. 
                Mode élégante, confortable et durable pour chaque occasion.
              </p>
              <Link
                to="/category/robes"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Explorer la Collection
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Grid of 4 Small Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Men's Wear */}
            <div
              className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="300"
            >
              <Link to="/category/homme">
                <div className="aspect-square">
                  <img
                    src="/assets/img/product/product-m-5.webp"
                    alt="Mode Homme"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="text-xl font-bold mb-1">Mode Homme</h4>
                  <p className="text-sm text-gray-200 mb-2">242 produits</p>
                  <span className="inline-flex items-center text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Acheter
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Kid's Fashion */}
            <div
              className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="400"
            >
              <Link to="/category/enfants">
                <div className="aspect-square">
                  <img
                    src="/assets/img/product/product-8.webp"
                    alt="Mode Enfants"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="text-xl font-bold mb-1">Mode Enfants</h4>
                  <p className="text-sm text-gray-200 mb-2">185 produits</p>
                  <span className="inline-flex items-center text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Acheter
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Beauty Products */}
            <div
              className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="500"
            >
              <Link to="/category/beaute">
                <div className="aspect-square">
                  <img
                    src="/assets/img/product/product-3.webp"
                    alt="Produits Beauté"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="text-xl font-bold mb-1">Produits Beauté</h4>
                  <p className="text-sm text-gray-200 mb-2">127 produits</p>
                  <span className="inline-flex items-center text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Acheter
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>

            {/* Accessories */}
            <div
              className="relative overflow-hidden rounded-xl shadow-lg group cursor-pointer"
              data-aos="fade-up"
              data-aos-delay="600"
            >
              <Link to="/category/accessoires">
                <div className="aspect-square">
                  <img
                    src="/assets/img/product/product-12.webp"
                    alt="Accessoires"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h4 className="text-xl font-bold mb-1">Accessoires</h4>
                  <p className="text-sm text-gray-200 mb-2">308 produits</p>
                  <span className="inline-flex items-center text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                    Acheter
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoCards;
