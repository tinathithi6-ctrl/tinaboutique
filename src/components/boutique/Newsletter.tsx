import { Mail } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Veuillez entrer votre email');
      return;
    }

    setLoading(true);
    
    // Simuler un appel API
    setTimeout(() => {
      toast.success('Merci ! Vous êtes maintenant inscrit à notre newsletter 🎉');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <section className="py-20 bg-gradient-to-r from-gold via-yellow-500 to-gold relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-6 shadow-xl"
            data-aos="zoom-in"
          >
            <Mail className="w-10 h-10 text-gold" />
          </div>

          {/* Title */}
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Restez Informé !
          </h2>

          {/* Description */}
          <p
            className="text-xl text-white/90 mb-8"
            data-aos="fade-up"
            data-aos-delay="200"
          >
            Inscrivez-vous à notre newsletter et recevez en exclusivité nos dernières offres, 
            nouveautés et conseils mode directement dans votre boîte mail.
          </p>

          {/* Newsletter Form */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Entrez votre email..."
              className="flex-1 px-6 py-4 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/50 text-lg"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          {/* Privacy Note */}
          <p
            className="text-sm text-white/80 mt-6"
            data-aos="fade-up"
            data-aos-delay="400"
          >
            🔒 Vos données sont protégées. Pas de spam, désinscription à tout moment.
          </p>

          {/* Benefits */}
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
            data-aos="fade-up"
            data-aos-delay="500"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">🎁</div>
              <h4 className="text-white font-semibold mb-2">Offres Exclusives</h4>
              <p className="text-white/80 text-sm">
                Accédez à des réductions réservées aux abonnés
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">✨</div>
              <h4 className="text-white font-semibold mb-2">Nouveautés en Avant-Première</h4>
              <p className="text-white/80 text-sm">
                Soyez les premiers informés de nos nouvelles collections
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="text-white font-semibold mb-2">Conseils Mode</h4>
              <p className="text-white/80 text-sm">
                Recevez nos meilleurs conseils et tendances
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
