import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
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

  const clampQty = (qty, stock) => {
    const s = Number(stock ?? 0);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    if (s > 0) return Math.min(qty, s);
    return qty;
  };

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
          // Even if server request fails, try to update local state for better UX
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
  }, [isAuthenticated, items, loadCart]);

  const removeItem = useCallback(async (id) => {
    if (!id) return false;
    
    try {
      // Store current items for potential rollback
      const currentItems = [...items];
      
      // Update UI immediately for better UX
      setItems(prev => prev.filter(item => item._id !== id));
      
      if (isAuthenticated) {
        try {
          // Use the correct endpoint with productId parameter
          const response = await api.delete(`/api/cart/${id}`);
          
          // Update local state with the server response if available
          if (response.data && Array.isArray(response.data.items)) {
            setItems(response.data.items);
            // Update local storage with the latest cart
            try {
              localStorage.setItem(`cart_${user._id}`, JSON.stringify(response.data.items));
            } catch (e) {
              console.error('Error updating local storage:', e);
            }
          } else {
            // If response format is unexpected, refresh the entire cart
            await loadCart();
          }
          return true;
        } catch (error) {
          console.error('Failed to remove item from cart:', error);
          // Revert to previous state on error
          setItems(currentItems);
          return false;
        }
      } else {
        // For guests, just update local storage
        try {
          const guestItems = items.filter(item => item._id !== id);
          localStorage.setItem('cart_guest', JSON.stringify(guestItems));
        } catch (e) {
          console.error('Error updating guest cart in localStorage:', e);
        }
        return true;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  }, [isAuthenticated, loadCart]);

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

  const updateQty = useCallback(async (id, qty, stock) => {
    try {
      setItems(prevItems => {
        const itemToUpdate = prevItems.find(item => item._id === id);
        if (!itemToUpdate) return prevItems;
        
        const newQty = clampQty(qty, stock ?? itemToUpdate.stock);
        const updatedItems = prevItems.map(item => 
          item._id === id ? { ...item, qty: newQty } : item
        );
        
        // For guest users, update local storage
        if (!isAuthenticated) {
          try {
            localStorage.setItem('cart_guest', JSON.stringify(updatedItems));
          } catch (e) {
            console.error('Error saving cart to local storage:', e);
            return prevItems; // Revert on error
          }
        }
        
        return updatedItems;
      });
      
      // For authenticated users, update server
      if (isAuthenticated) {
        try {
            const newQty = clampQty(qty, stock);
            // Log request details for debugging
            console.log('Updating cart qty on server', { id, qty: newQty });

            // Send qty both as query param and in body to be robust against middleware differences
            await api.put(`/api/cart/${id}?qty=${encodeURIComponent(newQty)}`, { qty: newQty });

            // Refresh cart from server to ensure consistency
            await loadCart();
          } catch (error) {
            console.error('Failed to update quantity on server:', error.response?.data || error.message);
            // Revert on error by reloading server state
            await loadCart();
            return false;
          }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  }, [isAuthenticated, loadCart]);

  const increment = useCallback(async (id) => {
    try {
      const item = items.find(p => p._id === id);
      if (!item) return false;
      // Use 0.5 increments to match UI which steps by 0.5 (kg)
      const currentQty = parseFloat(item.qty) || 0;
      const newQty = Math.round((currentQty + 0.5) * 100) / 100;
      
      if (newQty > (item.stock || 0)) return false;
      
      return await updateQty(id, newQty, item.stock);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
      return false;
    }
  }, [items, updateQty]);

  const decrement = useCallback(async (id) => {
    try {
      const item = items.find(p => p._id === id);
      if (!item) return false;
      // Use 0.5 decrements to match UI
      const currentQty = parseFloat(item.qty) || 0;
      const newQty = Math.round((currentQty - 0.5) * 100) / 100;
      
      if (newQty <= 0) {
        return await removeItem(id);
      }
      
      return await updateQty(id, newQty, item.stock);
    } catch (error) {
      console.error('Error decrementing quantity:', error);
      return false;
    }
  }, [items, updateQty, removeItem]);

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
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
