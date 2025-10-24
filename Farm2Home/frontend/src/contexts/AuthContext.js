import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data (defined before useEffect to avoid temporal dead zone issues)
  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Fetch user data (Authorization header is handled by api interceptor)
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await api.post('/api/auth/register', userData);
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Registration failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const { data } = await api.post('/api/auth/login', credentials);
      localStorage.setItem('token', data.token);
      setUser(data);
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Login failed';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!user;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // Check if user is delivery personnel
  const isDelivery = () => {
    return user?.role === 'delivery';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        isAdmin,
        isDelivery,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
