import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import apiFetch from '@/lib/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  product_id?: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeLocalCart: () => Promise<void>;
  cartCount: number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const { user, token } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger le panier depuis la DB
  const loadCart = async () => {
    if (!user || !token) {
      // Utilisateur non connecté - utiliser localStorage
      try {
        const localData = localStorage.getItem('cart');
        setCartItems(localData ? JSON.parse(localData) : []);
      } catch (error) {
        setCartItems([]);
      }
      return;
    }

    try {
      const data = await apiFetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }) as any;
      if (!data) {
        setCartItems([]);
        return;
      }

      // Accept either an array or an object { rows: [...] }
      const itemsArray = Array.isArray(data) ? data : (Array.isArray(data.rows) ? data.rows : null);
      if (!itemsArray) {
        console.warn('loadCart: unexpected /api/cart response shape', data);
        setCartItems([]);
        return;
      }

      const formattedItems = itemsArray.map((item: any) => ({
        id: item.product_id.toString(),
        name: item.name,
        price: item.price_eur,
        image: item.image_url,
        quantity: item.quantity,
        product_id: item.product_id
      }));
      setCartItems(formattedItems);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  };

  // Sauvegarder dans localStorage pour les utilisateurs non connectés
  const saveToLocalStorage = (items: CartItem[]) => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  };

  useEffect(() => {
    loadCart();
  }, [user, token]);

  useEffect(() => {
    saveToLocalStorage(cartItems);
  }, [cartItems, user]);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const addToCart = async (item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    if (!user || !token) {
      // Utilisateur non connecté - localStorage seulement
      setCartItems(prevItems => {
        const existingItem = prevItems.find(i => i.id === item.id);
        if (existingItem) {
          return prevItems.map(i =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          return [...prevItems, { ...item, quantity }];
        }
      });
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/api/cart', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ product_id: parseInt(item.id), quantity }) });
      await loadCart();
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || !token) {
      setCartItems(prevItems => prevItems.filter(i => i.id !== itemId));
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/cart/${itemId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      await loadCart();
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || !token) {
      if (quantity <= 0) {
        await removeFromCart(itemId);
      } else {
        setCartItems(prevItems =>
          prevItems.map(i => (i.id === itemId ? { ...i, quantity } : i))
        );
      }
      return;
    }

    try {
      setLoading(true);
      await apiFetch(`/api/cart/${itemId}`, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ quantity }) });
      await loadCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user || !token) {
      setCartItems([]);
      return;
    }

    try {
      setLoading(true);
      await apiFetch('/api/cart', { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      setCartItems([]);
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fusionner le panier local (localStorage) vers la DB lorsque l'utilisateur se connecte
  const mergeLocalCart = async () => {
    if (!user || !token) return;

    try {
      const localData = localStorage.getItem('cart');
      const items: CartItem[] = localData ? JSON.parse(localData) : [];
      if (!items || items.length === 0) return;

      // Envoyer tous les items en une seule requête au endpoint de merge côté serveur
      const payload = items.map(i => ({ product_id: parseInt(i.id, 10), quantity: i.quantity }));

      await apiFetch('/api/cart/merge', { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ items: payload }) });

      // Nettoyer le localStorage et recharger le panier depuis la DB
      localStorage.removeItem('cart');
      await loadCart();
    } catch (error) {
      console.error('Erreur lors de la fusion du panier local:', error);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      mergeLocalCart,
      cartCount,
      loading
    }}>
      {children}
    </CartContext.Provider>
  );
};
