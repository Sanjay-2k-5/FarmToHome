import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
<<<<<<< HEAD
=======
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./routes/Home";
import Blog from "./routes/Blog";
import Profile from "./routes/Profile";
import ProductPage from "./routes/ProductPage";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/CartPage";
<<<<<<< HEAD
=======
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
<<<<<<< HEAD
      <Routes>
          {/* Default to Login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes - Only accessible when logged in */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            {/* Main app pages after login */}
            <Route path="/home" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/products" element={<ProductPage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* Admin area (component will re-check role) */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          {/* Redirect unknown routes to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
=======
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
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

              {/* Protected Routes - Only accessible when logged in */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                {/* Admin area (component will re-check role) */}
                <Route path="/admin" element={<AdminDashboard />} />
              </Route>

              {/* Redirect unknown routes to login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
