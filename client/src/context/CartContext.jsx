import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cart.api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const EMPTY_CART = { id: null, items: [], subtotal: '0.00', itemCount: 0 };

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) { setCart(EMPTY_CART); return; }
    setLoading(true);
    try {
      const { data } = await cartApi.getCart();
      setCart(data.data.cart);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await cartApi.addItem(productId, quantity);
    setCart(data.data.cart);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await cartApi.updateItem(itemId, quantity);
    setCart(data.data.cart);
  };

  const removeItem = async (itemId) => {
    await cartApi.removeItem(itemId);
    await fetchCart();
  };

  const clearCart = () => setCart(EMPTY_CART);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, fetchCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
