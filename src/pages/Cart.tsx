import { useState } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronRight, Minus, Plus, Trash2, ShoppingBag, CreditCard, Wallet, Building2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');

  const handleUpdateQuantity = (id: string, currentQuantity: number, delta: number) => {
    const newQuantity = currentQuantity + delta;
    updateQuantity(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast.success('Produit retiré du panier');
  };

  const handleClearCart = () => {
    clearCart();
    toast.info('Panier vidé');
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      toast.success('Code promo appliqué !');
    } else {
      toast.error('Veuillez entrer un code promo');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal > 0 ? (shippingMethod === 'standard' ? 4.99 : shippingMethod === 'express' ? 12.99 : 0) : 0;
  const tax = subtotal * 0.1;
  const discount = 0; // La logique de réduction sera ajoutée plus tard
  const total = subtotal + shippingCost + tax - discount;
  const { format } = useCurrency();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2 lg:mb-0">
              Panier
            </h1>
            <nav className="flex items-center text-sm">
              <Link to="/" className="text-gray-600 hover:text-gold transition-colors">
                Accueil
              </Link>
              <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
              <span className="text-gray-900 font-medium">Panier</span>
            </nav>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBag className="h-24 w-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits pour commencer vos achats</p>
            <Link
              to="/boutique"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold text-white rounded-lg font-semibold hover:bg-gold/90 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Continuer vos achats
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {/* Header */}
                <div className="hidden lg:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
                  <div className="col-span-6">Produit</div>
                  <div className="col-span-2 text-center">Prix</div>
                  <div className="col-span-2 text-center">Quantité</div>
                  <div className="col-span-2 text-center">Total</div>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-4">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                        {/* Product Info */}
                        <div className="lg:col-span-6 flex gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              {/* Note: La couleur et la taille ne sont pas encore dans le contexte */}
                              {/* <p>Couleur: {item.color}</p> */}
                              {/* <p>Taille: {item.size}</p> */}
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                            >
                              <Trash2 className="h-4 w-4" />
                              Retirer
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="lg:col-span-2 text-center">
                          <span className="text-lg font-semibold text-gray-900">{format(item.price)}</span>
                        </div>

                        {/* Quantity */}
                        <div className="lg:col-span-2 flex justify-center">
                          <div className="flex items-center border-2 border-gray-300 rounded-lg">
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4 py-2 font-medium">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                              className="p-2 hover:bg-gray-100 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="lg:col-span-2 text-center">
                          <span className="text-lg font-bold text-gray-900">
                            {format(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Code promo"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold/50"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-6 py-2 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
                        >
                          Appliquer
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearCart}
                        className="px-6 py-2 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 transition-colors"
                      >
                        Vider le panier
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Résumé de Commande</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Sous-total</span>
                    <span className="font-semibold">{format(subtotal)}</span>
                  </div>

                  {/* Shipping Options */}
                  <div className="space-y-2">
                    <label className="text-gray-700 font-medium">Livraison</label>
                    <div className="space-y-2">
                      <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gold transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            value="standard"
                            checked={shippingMethod === 'standard'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="text-gold focus:ring-gold"
                          />
                          <span className="text-sm">Standard - {subtotal > 0 ? format(4.99) : format(0)}</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gold transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            value="express"
                            checked={shippingMethod === 'express'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="text-gold focus:ring-gold"
                          />
                          <span className="text-sm">Express - {subtotal > 0 ? format(12.99) : format(0)}</span>
                        </div>
                      </label>
                      <label className="flex items-center justify-between p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gold transition-colors">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="shipping"
                            value="free"
                            checked={shippingMethod === 'free'}
                            onChange={(e) => setShippingMethod(e.target.value)}
                            className="text-gold focus:ring-gold"
                          />
                          <span className="text-sm">Gratuit (&gt;300€)</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between text-gray-700">
                    <span>Taxe</span>
                    <span className="font-semibold">{format(tax)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span className="font-semibold">-{discount.toFixed(2)}€</span>
                    </div>
                  )}
                </div>

                  <div className="pt-4 border-t-2 border-gray-200 mb-6">
                  <div className="flex justify-between text-xl font-bold text-gray-900">
                    <span>Total</span>
                    <span>{format(total)}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="block w-full py-3 bg-gold text-white text-center rounded-lg font-semibold hover:bg-gold/90 transition-colors mb-4"
                >
                  Procéder au Paiement
                </Link>

                <Link
                  to="/boutique"
                  className="block w-full py-3 text-center text-gray-700 hover:text-gold transition-colors"
                >
                  <ArrowLeft className="inline h-4 w-4 mr-2" />
                  Continuer vos achats
                </Link>

                {/* Payment Methods */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">Nous acceptons</p>
                  <div className="flex items-center gap-4 text-gray-400">
                    <CreditCard className="h-8 w-8" />
                    <Wallet className="h-8 w-8" />
                    <Building2 className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default Cart;
