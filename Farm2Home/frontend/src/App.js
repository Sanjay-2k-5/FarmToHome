import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/NewCartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./routes/Home";
import Blog from "./routes/Blog";
import Profile from "./routes/Profile";
import ProductPage from "./routes/ProductPage";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/NewCartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <div className="app-container d-flex flex-column min-vh-100">
            <Navbar />
            <main className="main-content flex-grow-1">
              <ToastContainer position="top-right" autoClose={5000} />
              <div className="content-wrapper">
                <Routes>
                  {/* Default to Login */}
                  <Route path="/" element={<Navigate to="/login" replace />} />

                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/products" element={<ProductPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />

                  {/* Protected Routes - Only accessible when logged in */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/my-orders" element={<MyOrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailPage />} />
                    {/* Role-based dashboards */}
                    <Route path="/admin/*" element={<AdminDashboard />} />
                    <Route path="/farmer/*" element={<FarmerDashboard />} />
                    <Route path="/delivery/*" element={<DeliveryDashboard />} />
                    <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
                  </Route>

                  {/* Redirect unknown routes to login */}
                  <Route path="*" element={<Navigate to="/login" replace />} />
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
