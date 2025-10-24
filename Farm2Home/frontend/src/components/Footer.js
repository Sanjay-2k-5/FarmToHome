import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';
import { 
  FaPhone, 
  FaEnvelope, 
  FaMapMarkerAlt, 
  FaFacebook, 
  FaTwitter, 
  FaInstagram, 
  FaLinkedin,
  FaLeaf,
  FaTruck,
  FaShieldAlt,
  FaHeadset
} from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-container">
          <div className="footer-section">
            <div className="footer-logo">
              <FaLeaf className="logo-icon" />
              <span>Farm2Home</span>
            </div>
            <p className="footer-about">
              Connecting farmers directly to consumers with fresh, organic, and locally-sourced produce.
              Our mission is to provide the highest quality products while supporting local agriculture.
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/products">Products</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/my-orders">My Orders</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Customer Service</h3>
            <ul className="footer-links">
              <li><Link to="/faq">FAQs</Link></li>
              <li><Link to="/shipping">Shipping Policy</Link></li>
              <li><Link to="/returns">Return & Refund</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3>Contact Us</h3>
            <ul className="contact-info">
              {/* <li>
                <FaMapMarkerAlt className="contact-icon" />
                <span>123 Farm Road, Agricultural Zone<br/>Chennai, Tamil Nadu 600001</span>
              </li> */}
              <li>
                <FaPhone className="contact-icon" />
                <span>+91 814 823 1583</span>
              </li>
              <li>
                <FaEnvelope className="contact-icon" />
                <span>info@farm2home.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-features">
        <div className="footer-container">
          <div className="feature">
            <FaTruck className="feature-icon" />
            <div>
              <h4>Free Delivery</h4>
              <p>On orders over ₹999</p>
            </div>
          </div>
          <div className="feature">
            <FaShieldAlt className="feature-icon" />
            <div>
              <h4>Secure Payment</h4>
              <p>100% secure payment</p>
            </div>
          </div>
          <div className="feature">
            <FaHeadset className="feature-icon" />
            <div>
              <h4>24/7 Support</h4>
              <p>Dedicated support</p>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <p>&copy; {currentYear} Farm2Home. All Rights Reserved.</p>
          <div className="payment-methods">
            <span>We accept:</span>
            <div className="payment-icons">
              <span className="payment-icon">Visa</span>
              <span className="payment-icon">Mastercard</span>
              <span className="payment-icon">UPI</span>
              <span className="payment-icon">Net Banking</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;