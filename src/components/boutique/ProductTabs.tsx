import { useState } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

interface ProductTabsProps {
  description: string;
  specifications?: Array<{ label: string; value: string }>;
  reviews?: Review[];
}

const ProductTabs = ({ description, specifications = [], reviews = [] }: ProductTabsProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'reviews'>('overview');

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

  const averageRating = reviews.length > 0
    ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className="mt-12">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Description
          </button>
          {specifications.length > 0 && (
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === 'specs'
                  ? 'border-gold text-gold'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Caractéristiques
            </button>
          )}
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-gold text-gold'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Avis ({reviews.length})
          </button>
        </nav>
      </div>

      {/* Tabs Content */}
      <div className="py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="prose max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aperçu du Produit</h3>
            <div className="text-gray-600 leading-relaxed space-y-4">
              <p>{description}</p>
              <p>
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
                consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro
                quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
              </p>
              <h4 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Caractéristiques Principales</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Design élégant et moderne</li>
                <li>Matériaux de haute qualité</li>
                <li>Confort optimal pour un usage quotidien</li>
                <li>Facile à entretenir</li>
                <li>Disponible en plusieurs couleurs</li>
              </ul>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === 'specs' && specifications.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Caractéristiques Techniques</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900">{spec.label}:</span>
                  <span className="text-gray-600">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div>
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Avis Clients</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {renderStars(Math.round(averageRating))}
                    <span className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-gray-600">
                    Basé sur {reviews.length} avis
                  </span>
                </div>
              </div>
              <button className="px-6 py-2 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors">
                Écrire un Avis
              </button>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{review.author}</h4>
                          {review.verified && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                              Achat Vérifié
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {renderStars(review.rating)}
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Aucun avis pour le moment</p>
                <button className="px-6 py-2 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors">
                  Soyez le premier à donner votre avis
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
