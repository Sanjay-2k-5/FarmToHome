import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const storageKey = user ? `cart_${user._id}` : 'cart_guest';
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem('cart_guest');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {}
  }, [items, storageKey]);

  // Initial load from server (if authenticated); fall back to local storage
  useEffect(() => {
    const load = async () => {
      // Reset immediately to avoid showing previous user's cart
      if (!user) {
        try {
          const raw = localStorage.getItem('cart_guest');
          setItems(raw ? JSON.parse(raw) : []);
        } catch { setItems([]); }
        return;
      }
      try {
        const { data } = await api.get('/api/cart');
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
          // also mirror into user-specific storage
          localStorage.setItem(`cart_${user._id}`, JSON.stringify(data.items));
        } else {
          setItems([]);
        }
      } catch {
        // fallback to user-specific local storage if present
        try {
          const raw = localStorage.getItem(`cart_${user._id}`);
          setItems(raw ? JSON.parse(raw) : []);
        } catch { setItems([]); }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?._id]);

  const clampQty = (qty, stock) => {
    const s = Number(stock ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    if (s > 0) return Math.min(qty, s);
    return qty;
  };

  const addItem = (product, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p._id === product._id);
      const max = Number(product.stock ?? 0);
      if (idx >= 0) {
        const copy = [...prev];
        const nextQty = clampQty(copy[idx].qty + qty, max);
        copy[idx] = { ...copy[idx], qty: nextQty };
        return copy;
      }
      const initQty = clampQty(qty, max);
      if (initQty <= 0) return prev;
      return [...prev, { ...product, qty: initQty }];
    });
    // Sync to server (best-effort)
    (async () => {
      try {
        await api.post('/api/cart', { productId: product._id, qty });
      } catch {}
    })();
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((p) => p._id !== id));
    (async () => { try { await api.delete(`/api/cart/${id}`); } catch {} })();
  };
  const clear = () => {
    setItems([]);
    (async () => { try { await api.delete('/api/cart'); } catch {} })();
  };

  const updateQty = (id, qty, stock) => {
    const clamped = (prevItem) => clampQty(qty, stock ?? prevItem.stock);
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, qty: clamped(p) } : p)));
    (async () => { try { await api.put(`/api/cart/${id}`, { qty }); } catch {} })();
  };

  const increment = (id) => {
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, qty: clampQty((p.qty || 0) + 1, p.stock) } : p)));
    (async () => { try { await api.put(`/api/cart/${id}`, { qty: (items.find(i => i._id === id)?.qty || 0) + 1 }); } catch {} })();
  };

  const decrement = (id) => {
    setItems((prev) => prev.map((p) => (p._id === id ? { ...p, qty: Math.max((p.qty || 0) - 1, 1) } : p)));
    (async () => { try { await api.put(`/api/cart/${id}`, { qty: Math.max((items.find(i => i._id === id)?.qty || 0) - 1, 1) }); } catch {} })();
  };

  const summary = useMemo(() => {
    const countQty = items.reduce((a, b) => a + b.qty, 0);
    const distinct = items.length;
    const total = items.reduce((a, b) => a + Number(b.price || 0) * b.qty, 0);
    return { countQty, distinct, total };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear, updateQty, increment, decrement, summary }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
