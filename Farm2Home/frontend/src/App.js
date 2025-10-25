import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/NewCartContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./routes/Home";
import Blog from "./routes/Blog";
import Profile from "./routes/Profile";
import ProductPage from "./routes/ProductPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CartPage from "./pages/NewCartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import FarmerProducts from "./pages/farmer/FarmerProducts";
import AddProduct from "./pages/farmer/AddProduct";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import PrivateRoute from "./components/PrivateRoute";
import Unauthorized from "./pages/Unauthorized";
import "./index.css";

// Component to handle redirection after login
const AuthRedirect = () => {
  const { user } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  // If user is already logged in, redirect based on role
  if (user) {
    switch(user.role) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'farmer':
        return <Navigate to="/farmer/dashboard" replace />;
      case 'delivery':
        return <Navigate to="/delivery/dashboard" replace />;
      default:
        return <Navigate to={from || '/home'} replace />;
    }
  }
  
  // If not logged in, redirect to login
  return <Navigate to="/login" state={{ from: location }} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <div className="app-container d-flex flex-column min-vh-100">
            <Navbar />
            <main className="main-content flex-grow-1">
              <ToastContainer 
                position="top-right" 
                autoClose={5000}
                pauseOnFocusLoss={false}
                pauseOnHover
                closeOnClick
              />
              <div className="content-wrapper">
                <Routes>
                  {/* Default route */}
                  <Route path="/" element={<AuthRedirect />} />

                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/products" element={<ProductPage />} />
                  
                  {/* Protected Routes */}
                  <Route path="/checkout" element={
                    <PrivateRoute>
                      <CheckoutPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  
                  {/* Farmer Routes */}
                  <Route path="/farmer" element={
                    <PrivateRoute requiredRole="farmer">
                      <FarmerDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/farmer/dashboard" element={
                    <PrivateRoute requiredRole="farmer">
                      <FarmerDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/farmer/products" element={
                    <PrivateRoute requiredRole="farmer">
                      <FarmerProducts />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/farmer/products/add" element={
                    <PrivateRoute requiredRole="farmer">
                      <AddProduct />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <PrivateRoute requiredRole="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/admin/dashboard" element={
                    <PrivateRoute requiredRole="admin">
                      <AdminDashboard />
                    </PrivateRoute>
                  } />
                  
                  {/* Delivery Routes */}
                  <Route path="/delivery" element={
                    <PrivateRoute requiredRole="delivery">
                      <DeliveryDashboard />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/delivery/dashboard" element={
                    <PrivateRoute requiredRole="delivery">
                      <DeliveryDashboard />
                    </PrivateRoute>
                  } />
                  
                  {/* Common Protected Routes */}
                  <Route path="/profile" element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/my-orders" element={
                    <PrivateRoute>
                      <MyOrdersPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/orders/:id" element={
                    <PrivateRoute>
                      <OrderDetailPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Catch all other routes */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </main>
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
