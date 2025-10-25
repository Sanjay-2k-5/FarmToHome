import "./Navbar.css";
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FaBars, FaTimes, FaShoppingCart, FaHome, FaLeaf, FaBlog, FaUserCircle, FaSignInAlt, FaSignOutAlt, FaUserCog, FaTachometerAlt, FaClipboardList } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from '../contexts/NewCartContext';

const Navbar = () => {
  const [click, setClick] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, isAdmin, logout, user } = useAuth();
  const { items = [] } = useCart?.() || {};
  const itemCount = items?.reduce((total, item) => total + (item?.qty || 0), 0) || 0;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Helper function to check if a path matches the current route
  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };
  
  // Check if current page is login or register
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const changeNavbar = () => {
    if (window.scrollY >= 80) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", changeNavbar);
    return () => window.removeEventListener("scroll", changeNavbar);
  }, []);

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    navigate('/');
  };

  // Check if current user is admin
  const isUserAdmin = isAuthenticated() && isAdmin && isAdmin();

  return (
    <nav className={scrolled ? "navbar scrolled" : "navbar"}>
      <div className="navbar-container">
        <Link to={isUserAdmin ? "/admin" : "/"} className="navbar-logo" onClick={closeMobileMenu}>
          <FaLeaf className="navbar-icon" /> Farm2Home
        </Link>

        {!isUserAdmin && (
          <div className="menu-icon" onClick={handleClick}>
            {click ? <FaTimes /> : <FaBars />}
          </div>
        )}

        <ul className={click || isUserAdmin ? "nav-menu active" : "nav-menu"}>
          {!isUserAdmin && !isAuthPage && (
            <>
              {(!isAuthenticated() || (user?.role !== 'delivery' && user?.role !== 'farmer')) && (
                <li className="nav-item">
                  <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                    <FaHome className="nav-icon" /> Home
                  </Link>
                </li>
              )}
              {(!isAuthenticated() || (user?.role !== 'delivery' && user?.role !== 'farmer')) && (
                <li className="nav-item">
                  <Link to="/products" className="nav-links" onClick={closeMobileMenu}>
                    <FaShoppingCart className="nav-icon" /> Products
                  </Link>
                </li>
              )}
              {isAuthenticated() && user?.role === 'farmer' ? (
                <>
                  <li className="nav-item">
                    <Link to="/farmer/dashboard" className="nav-links" onClick={closeMobileMenu}>
                      <FaTachometerAlt className="nav-icon" /> Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link to="/farmer/products" className="nav-links" onClick={closeMobileMenu}>
                      <FaClipboardList className="nav-icon" /> My Products
                    </Link>
                  </li>
                </>
              ) : isAuthenticated() && user?.role === 'delivery' ? (
                <li className="nav-item">
                  <Link to="/delivery" className="nav-links" onClick={closeMobileMenu}>
                    <FaTachometerAlt className="nav-icon" /> Delivery Dashboard
                  </Link>
                </li>
              ) : isAuthenticated() && (!isAdmin || !isAdmin()) && (
                <li className="nav-item">
                  <Link to="/cart" className="nav-links" onClick={closeMobileMenu}>
                    <FaShoppingCart className="nav-icon" /> Cart
                    {itemCount > 0 && <span className="badge bg-primary ms-1">{itemCount}</span>}
                  </Link>
                </li>
              )}
              {(!isAuthenticated() || (user?.role !== 'delivery' && user?.role !== 'farmer')) && (
                <li className="nav-item">
                  <Link to="/blog" className="nav-links" onClick={closeMobileMenu}>
                    <FaBlog className="nav-icon" /> Blog
                  </Link>
                </li>
              )}
            </>
          )}

          {isAuthenticated() ? (
            <>
              {!isUserAdmin && (
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-links" onClick={closeMobileMenu}>
                    <FaUserCircle className="nav-icon" /> Dashboard
                  </Link>
                </li>
              )}
              {isUserAdmin && (
                <li className="nav-item">
                  <Link to="/admin" className="nav-links" onClick={closeMobileMenu}>
                    <FaTachometerAlt className="nav-icon" /> Dashboard
                  </Link>
                </li>
              )}
              {!isUserAdmin && user?.role === 'user' && (
                <li className="nav-item">
                  <Link to="/my-orders" className="nav-links" onClick={closeMobileMenu}>
                    <FaClipboardList className="nav-icon" /> My Orders
                  </Link>
                </li>
              )}
              <li className="nav-item">
                <button className="nav-links-btn" onClick={handleLogout}>
                  <FaSignOutAlt className="nav-icon" /> Logout
                </button>
              </li>
            </>
          ) : (
            <li className="nav-item">
              <Link to="/login" className="nav-links" onClick={closeMobileMenu}>
                <FaSignInAlt className="nav-icon" /> Login / Register
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
