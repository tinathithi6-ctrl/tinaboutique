import { useState } from 'react';
import { Phone, Globe, DollarSign, ChevronDown } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

const TopBar = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('FR');
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showCurrDropdown, setShowCurrDropdown] = useState(false);

  const announcements = [
    '🚚 Livraison gratuite pour les commandes de plus de 50€',
    '💰 Garantie de remboursement de 30 jours',
    '🎁 20% de réduction sur votre première commande'
  ];

  const languages = [
    { code: 'FR', name: 'Français' },
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'DE', name: 'Deutsch' }
  ];

  const currencies = [
    { code: 'EUR', symbol: '€' },
    { code: 'USD', symbol: '$' },
    { code: 'GBP', symbol: '£' }
  ];

  return (
    <div className="bg-gray-900 text-gray-300 text-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 py-2">
          
          {/* Contact - Desktop only */}
          <div className="hidden lg:flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gold" />
            <span className="mr-1">Besoin d'aide ? Appelez-nous :</span>
            <a href="tel:+33123456789" className="text-gold hover:text-gold/80 transition-colors font-medium">
              +33 1 23 45 67 89
            </a>
          </div>

          {/* Announcements Slider - Center */}
          <div className="text-center overflow-hidden h-6">
            <Swiper
              modules={[Autoplay]}
              direction="vertical"
              slidesPerView={1}
              loop={true}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              speed={600}
              className="h-full"
            >
              {announcements.map((announcement, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <span className="text-white font-medium">{announcement}</span>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Language & Currency - Desktop only */}
          <div className="hidden lg:flex items-center justify-end gap-4">
            
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowLangDropdown(!showLangDropdown);
                  setShowCurrDropdown(false);
                }}
                className="flex items-center gap-1 hover:text-gold transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{selectedLanguage}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showLangDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg py-2 min-w-[120px] z-50">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setShowLangDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>{lang.name}</span>
                      {selectedLanguage === lang.code && (
                        <span className="text-gold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Currency Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowCurrDropdown(!showCurrDropdown);
                  setShowLangDropdown(false);
                }}
                className="flex items-center gap-1 hover:text-gold transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span>{selectedCurrency}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              
              {showCurrDropdown && (
                <div className="absolute top-full right-0 mt-2 bg-white text-gray-900 rounded-lg shadow-lg py-2 min-w-[100px] z-50">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setSelectedCurrency(curr.code);
                        setShowCurrDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <span>{curr.code}</span>
                      {selectedCurrency === curr.code && (
                        <span className="text-gold">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showLangDropdown || showCurrDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowLangDropdown(false);
            setShowCurrDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default TopBar;
