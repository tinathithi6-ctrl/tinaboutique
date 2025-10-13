import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, CreditCard, Wallet, Apple, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error('Veuillez accepter les conditions générales');
      return;
    }
    if (!user) {
      toast.error('Vous devez être connecté pour passer une commande.');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);

    const orderData = {
      user_id: user.id,
      total_amount: total,
      shipping_address: {
        address: formData.address,
        apartment: formData.apartment,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        country: formData.country,
      },
      customer_info: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      },
      items: cartItems.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        image: item.image,
      })),
    };

    try {
      const result = await (await import('@/lib/api')).apiFetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) } as any) as any;
      toast.success('Commande passée avec succès !');
      clearCart();
      navigate('/order-confirmation', { state: { orderId: result.orderId } });

    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue.';
      toast.error(`Erreur lors de la commande: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 4.99 : 0; // Simplifié, pourrait être basé sur la méthode choisie
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-0">
              Paiement
            </h1>
            <nav className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-gold transition-colors">
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <Link to="/cart" className="text-gray-600 hover:text-gold transition-colors">
                Panier
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">Paiement</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Step 1: Customer Information */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Informations Client</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Votre prénom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="+33 1 23 45 67 89"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Shipping Address */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Adresse de Livraison</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Rue, numéro"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Complément d'adresse (optionnel)
                    </label>
                    <input
                      type="text"
                      name="apartment"
                      value={formData.apartment}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      placeholder="Appartement, étage, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ville
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="Paris"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Région
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="Île-de-France"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Code Postal
                      </label>
                      <input
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="75001"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                      required
                    >
                      <option value="">Sélectionner un pays</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Mode de Paiement</h2>
                </div>

                {/* Payment Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'credit-card'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-gold focus:ring-gold"
                    />
                    <CreditCard className="h-6 w-6 text-gray-700" />
                    <span className="font-medium">Carte</span>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-gold focus:ring-gold"
                    />
                    <Wallet className="h-6 w-6 text-gray-700" />
                    <span className="font-medium">PayPal</span>
                  </label>
                  <label
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'apple-pay'
                        ? 'border-gold bg-gold/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="apple-pay"
                      checked={paymentMethod === 'apple-pay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="text-gold focus:ring-gold"
                    />
                    <Apple className="h-6 w-6 text-gray-700" />
                    <span className="font-medium">Apple Pay</span>
                  </label>
                </div>

                {/* Credit Card Details */}
                {paymentMethod === 'credit-card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Numéro de Carte
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="1234 5678 9012 3456"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date d'Expiration
                        </label>
                        <input
                          type="text"
                          name="expiry"
                          value={formData.expiry}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                          placeholder="MM/AA"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom sur la Carte
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        placeholder="Jean Dupont"
                        required
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'paypal' && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Vous serez redirigé vers PayPal pour finaliser votre achat en toute sécurité.
                    </p>
                  </div>
                )}

                {paymentMethod === 'apple-pay' && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      Vous serez invité à autoriser le paiement avec Apple Pay.
                    </p>
                  </div>
                )}
              </div>

              {/* Step 4: Review & Place Order */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 bg-gold text-white rounded-full flex items-center justify-center font-bold">
                    4
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Vérification & Commande</h2>
                </div>
                <div className="space-y-4">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-gold border-gray-300 rounded focus:ring-gold"
                      required
                    />
                    <span className="text-sm text-gray-700">
                      J'accepte les{' '}
                      <a href="#" className="text-gold hover:underline">
                        Conditions Générales
                      </a>{' '}
                      et la{' '}
                      <a href="#" className="text-gold hover:underline">
                        Politique de Confidentialité
                      </a>
                    </span>
                  </label>
                  <button
                    type="submit"
                    disabled={isSubmitting || cartItems.length === 0}
                    className="w-full py-4 bg-gold text-white rounded-lg font-bold text-lg hover:bg-gold/90 transition-colors flex items-center justify-between px-6 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <span>{isSubmitting ? 'Traitement...' : 'Passer la Commande'}</span>
                    <span>{total.toFixed(2)}€</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé</h2>

              {/* Order Items */}
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.price.toFixed(2)}€ × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Sous-total</span>
                  <span className="font-semibold">{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Livraison</span>
                  <span className="font-semibold">{shipping.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Taxe</span>
                  <span className="font-semibold">{tax.toFixed(2)}€</span>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-200">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              </div>
            </div>
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

export default Checkout;
