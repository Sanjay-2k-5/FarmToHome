<<<<<<< HEAD
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
=======
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
<<<<<<< HEAD
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
=======
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from server or local storage
  const loadCart = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isAuthenticated && user?._id) {
        // For authenticated users, load from server
        try {
          const { data } = await api.get('/api/cart');
          if (data?.items) {
            setItems(data.items);
            // Also save to local storage as backup
            localStorage.setItem(`cart_${user._id}`, JSON.stringify(data.items));
          }
        } catch (error) {
          console.error('Failed to load cart from server:', error);
          // Fallback to local storage if server request fails
          const raw = localStorage.getItem(`cart_${user._id}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            setItems(Array.isArray(parsed) ? parsed : []);
          }
        }
      } else {
        // For guest users, load from local storage
        const raw = localStorage.getItem('cart_guest');
        if (raw) {
          const parsed = JSON.parse(raw);
          setItems(Array.isArray(parsed) ? parsed : []);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  // Initial load
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save guest cart to local storage when items change
  useEffect(() => {
    if (!isAuthenticated) {
      try {
        localStorage.setItem('cart_guest', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to local storage:', error);
      }
    }
  }, [items, isAuthenticated]);
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))

  const clampQty = (qty, stock) => {
    const s = Number(stock ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    if (s > 0) return Math.min(qty, s);
    return qty;
  };

<<<<<<< HEAD
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
=======
  const addItem = useCallback(async (product, qty = 1) => {
    if (!product?._id) {
      console.error('No product ID provided');
      return false;
    }
    
    try {
      const max = Number(product.stock ?? 0);
      const currentItems = [...items];
      const existingItemIndex = currentItems.findIndex(p => p._id === product._id);
      let newQty = qty;
      
      // Calculate new quantity
      if (existingItemIndex >= 0) {
        newQty = clampQty(currentItems[existingItemIndex].qty + qty, max);
      } else {
        newQty = clampQty(qty, max);
        if (newQty <= 0) {
          console.error('Invalid quantity:', qty);
          return false;
        }
      }
      
      if (isAuthenticated) {
        // For authenticated users, update server first
        try {
          console.log('Adding to cart:', { productId: product._id, qty });
          const response = await api.post('/api/cart', { 
            productId: product._id, 
            qty: qty // Send the delta, not the total
          });
          
          console.log('Server response:', response.data);
          
          // Update local state with the server response
          if (response.data && Array.isArray(response.data.items)) {
            setItems(response.data.items);
          } else {
            // If response format is unexpected, refresh the entire cart
            await loadCart();
          }
          
          return true;
        } catch (error) {
          console.error('Failed to update cart:', error.response?.data || error.message);
          return false;
        }
      } else {
        // For guests, update local state directly
        const updatedItems = [...currentItems];
        if (existingItemIndex >= 0) {
          updatedItems[existingItemIndex].qty = newQty;
        } else {
          updatedItems.push({
            ...product,
            qty: newQty
          });
        }
        setItems(updatedItems);
        return true;
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  });

  const removeItem = async (id) => {
    if (!id) return false;
    
    try {
      if (isAuthenticated) {
        // For authenticated users, update server first
        try {
          await api.delete(`/api/cart/${id}`);
          // Refresh cart from server
          await loadCart();
          return true;
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          return false;
        }
      } else {
        // For guests, update local state directly
        setItems(prev => prev.filter(item => item._id !== id));
        return true;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  };

  const clear = async () => {
    try {
      if (isAuthenticated) {
        // For authenticated users, clear on server first
        try {
          await api.delete('/api/cart');
          // Refresh cart from server
          await loadCart();
          return true;
        } catch (error) {
          console.error('Failed to clear cart:', error);
          return false;
        }
      } else {
        // For guests, clear local state directly
        setItems([]);
        return true;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const updateQty = async (id, qty, stock) => {
    try {
      const itemToUpdate = items.find(item => item._id === id);
      if (!itemToUpdate) return false;
      
      const newQty = clampQty(qty, stock ?? itemToUpdate.stock);
      
      if (isAuthenticated) {
        // For authenticated users, update server first
        try {
          await api.put(`/api/cart/${id}`, { qty: newQty });
          // Refresh cart from server
          await loadCart();
          return true;
        } catch (error) {
          console.error('Failed to update quantity:', error);
          return false;
        }
      } else {
        // For guests, update local state directly
        setItems(prev => 
          prev.map(item => 
            item._id === id ? { ...item, qty: newQty } : item
          )
        );
        return true;
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const increment = async (id) => {
    const item = items.find(p => p._id === id);
    if (!item) return false;
    
    const newQty = clampQty((item.qty || 0) + 1, item.stock);
    return await updateQty(id, newQty, item.stock);
  };

  const decrement = async (id) => {
    const item = items.find(p => p._id === id);
    if (!item) return false;
    
    const newQty = clampQty((item.qty || 0) - 1, item.stock);
    if (newQty <= 0) {
      return await removeItem(id);
    }
    return await updateQty(id, newQty, item.stock);
  };

  // Sync guest cart with server when user logs in
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      const guestCart = localStorage.getItem('cart_guest');
      if (guestCart) {
        try {
          const guestItems = JSON.parse(guestCart);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            // Add all guest items to the user's cart
            const syncGuestCart = async () => {
              try {
                await Promise.all(
                  guestItems.map(item => 
                    api.post('/api/cart', {
                      productId: item._id,
                      qty: item.qty
                    })
                  )
                );
                // Clear guest cart
                localStorage.removeItem('cart_guest');
                // Refresh cart from server
                await loadCart();
              } catch (error) {
                console.error('Error syncing guest cart:', error);
              }
            };
            syncGuestCart();
          }
        } catch (error) {
          console.error('Error parsing guest cart:', error);
        }
      }
    }
  }, [isAuthenticated, user?._id, loadCart]);

  const value = useMemo(() => {
    // Calculate summary based on current items
    const summary = {
      countQty: items.reduce((a, b) => a + (b.qty || 0), 0),
      distinct: items.length,
      total: items.reduce((a, b) => a + (Number(b.price) || 0) * (b.qty || 0), 0)
    };

    return {
      items,
      isLoading,
      addItem,
      removeItem,
      clear,
      updateQty,
      increment,
      decrement,
      summary,
      refreshCart: loadCart
    };
  }, [
    items,
    isLoading,
    addItem,
    removeItem,
    clear,
    updateQty,
    increment,
    decrement,
    loadCart
  ]);

  return (
    <CartContext.Provider value={value}>
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
