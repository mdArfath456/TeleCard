import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      return;
    }
    setCartLoading(true);
    try {
      const { data } = await api.get('/api/cart');
      setCart(data);
    } catch {
      // ignore
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (cardId, quantity = 1) => {
    const { data } = await api.post('/api/cart/add', { cardId, quantity });
    setCart(data);
    return data;
  };

  const increase = async (itemId) => {
    const { data } = await api.put(`/api/cart/item/${itemId}/increase`);
    setCart(data);
  };

  const decrease = async (itemId) => {
    const { data } = await api.put(`/api/cart/item/${itemId}/decrease`);
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await api.delete(`/api/cart/item/${itemId}`);
    setCart(data);
  };

  const clearCart = async () => {
    await api.delete('/api/cart/clear');
    setCart({ items: [], totalItems: 0, totalAmount: 0 });
  };

  return (
    <CartContext.Provider
      value={{ cart, cartLoading, refreshCart, addToCart, increase, decrease, removeItem, clearCart, setCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
