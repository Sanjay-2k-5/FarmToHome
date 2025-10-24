import "./Footer.css"
import React from 'react'
import { FaPhone, FaMailBulk, FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa"

const Footer = () => {
  return (
    <div className="footer">
      <div className="footer-container">
        <div className="left">
          <div className="Phone">
            <h4><FaPhone size={15} style={{ color: "fff", marginRight: "2rem" }} />
              +91-9042837885</h4>
          </div>
          <div className="Mail">
            <h4><FaMailBulk size={15} style={{ color: "fff", marginRight: "2rem" }} />
              Farm2Home.com</h4>
          </div>
        </div>
        <div className="right">
          <h4> About Us </h4>
          <h4>We aim to produce the best quality product for our customers , and deliver the products at the earlist.</h4>
          <div className="social">
            <FaFacebook size={20} style={{ color: "#fff", marginRight: "1rem" }} />
            <FaTwitter size={20} style={{ color: "#fff", marginRight: "1rem" }} />
            <FaInstagram size={20} style={{ color: "#fff", marginRight: "1rem" }} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Footer