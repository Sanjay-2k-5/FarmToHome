import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
            // Update local storage as backup
            localStorage.setItem(`cart_${user._id}`, JSON.stringify(data.items));
          }
        } catch (error) {
          console.error('Error loading cart from server:', error);
          // Fallback to local storage if server request fails
          const localCart = localStorage.getItem(`cart_${user._id}`);
          if (localCart) {
            setItems(JSON.parse(localCart));
          }
        }
      } else {
        // For guests, load from local storage
        const guestCart = localStorage.getItem('cart_guest');
        if (guestCart) {
          setItems(JSON.parse(guestCart));
        }
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?._id]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Save cart to local storage when it changes
  useEffect(() => {
    if (!isLoading) {
      try {
        if (isAuthenticated && user?._id) {
          localStorage.setItem(`cart_${user._id}`, JSON.stringify(items));
        } else {
          localStorage.setItem('cart_guest', JSON.stringify(items));
        }
      } catch (error) {
        console.error('Error saving cart to local storage:', error);
      }
    }
  }, [items, isLoading, isAuthenticated, user?._id]);

  // Add or update item in cart
  const addOrUpdateItem = useCallback(async (product, quantity = 1) => {
    try {
      setError(null);
      const qty = Math.max(1, Math.min(quantity, product.stock));
      
      if (isAuthenticated) {
        const { data } = await api.post('/api/cart', {
          productId: product._id,
          qty
        });
        
        if (data?.items) {
          setItems(data.items);
          return true;
        }
      } else {
        setItems(prevItems => {
          const existingItemIndex = prevItems.findIndex(item => item._id === product._id);
          
          if (existingItemIndex >= 0) {
            // Update quantity if item exists
            const newItems = [...prevItems];
            newItems[existingItemIndex] = {
              ...newItems[existingItemIndex],
              qty: Math.min(newItems[existingItemIndex].qty + qty, product.stock)
            };
            return newItems;
          } else {
            // Add new item
            return [
              ...prevItems,
              {
                _id: product._id,
                name: product.name,
                price: product.price,
                stock: product.stock,
                imageUrl: product.imageUrl || product.img || '',
                description: product.description || '',
                qty: qty
              }
            ];
          }
        });
        return true;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError('Failed to add item to cart');
      return false;
    }
  }, [isAuthenticated]);

  // Remove item from cart
  const removeItem = useCallback(async (productId) => {
    try {
      setError(null);
      
      if (isAuthenticated) {
        const { data } = await api.delete(`/api/cart/${productId}`);
        if (data && (data.items || data.message === 'Item removed from cart')) {
          // If we have items in response or success message, update the cart
          if (data.items) {
            setItems(data.items);
            if (user?._id) {
              localStorage.setItem(`cart_${user._id}`, JSON.stringify(data.items));
            }
          } else {
            // If no items in response but success message, refresh the cart
            await loadCart();
          }
          return true;
        }
        // If we get here, the response format was unexpected
        throw new Error('Unexpected response from server');
      } else {
        // For guest users, update local state and storage
        setItems(prevItems => {
          const updatedItems = prevItems.filter(item => item._id !== productId);
          localStorage.setItem('cart_guest', JSON.stringify(updatedItems));
          return updatedItems;
        });
        return true;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setError(error.response?.data?.message || 'Failed to remove item from cart');
      return false;
    }
  }, [isAuthenticated, loadCart, user?._id]);

  // Update item quantity
  const updateQty = useCallback(async (productId, newQty) => {
    try {
      setError(null);
      const quantity = Math.max(1, newQty);
      
      if (isAuthenticated) {
        // The backend expects the quantity in the URL as a query parameter
        const { data } = await api.put(`/api/cart/${productId}?qty=${quantity}`);
        if (data?.items) {
          setItems(data.items);
          // Update local storage for offline consistency
          if (user?._id) {
            localStorage.setItem(`cart_${user._id}`, JSON.stringify(data.items));
          }
          return true;
        }
        // If we get here, the response format was unexpected
        throw new Error('Unexpected response from server');
      } else {
        // For guest users, update local state and storage
        setItems(prevItems => {
          const updatedItems = prevItems.map(item => 
            item._id === productId 
              ? { ...item, qty: Math.min(quantity, item.stock) } 
              : item
          );
          localStorage.setItem('cart_guest', JSON.stringify(updatedItems));
          return updatedItems;
        });
        return true;
      }
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      setError(error.response?.data?.message || 'Failed to update quantity');
      return false;
    }
  }, [isAuthenticated, user?._id]);

  // Clear cart
  const clearCart = useCallback(async () => {
    try {
      setError(null);
      
      if (isAuthenticated) {
        await api.delete('/api/cart');
      }
      
      setItems([]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError('Failed to clear cart');
      return false;
    }
  }, [isAuthenticated]);

  // Calculate cart summary
  const getCartSummary = useCallback(() => {
    const itemCount = items.length;
    const totalItems = items.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    
    return {
      itemCount,
      totalItems,
      subtotal
    };
  }, [items]);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        error,
        addOrUpdateItem,
        removeItem,
        updateQty,
        clearCart,
        getCartSummary,
        refreshCart: loadCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
