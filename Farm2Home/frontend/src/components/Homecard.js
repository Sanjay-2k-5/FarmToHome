import "./Homecard.css";
import Card from "../images/Caard.png";
// import card from '../assets/cardd.mp4'
import React from "react";
import { Link } from "react-router-dom";

const Homecard = () => {
  return (
    <>
      <div className='heroo'>
        <div className='masksk'>
          {/* <video src={card} muted autoPlay loop type="video/mp4"></video> */}
          <img className='intro-img' src={Card} alt='Banner' />
          <div className='contentt'>
            {/* Quick links to main sections */}
            <div className='d-flex gap-2 justify-content-center'>
              <Link to='/products'>
                <button className='normal'>Products</button>
              </Link>
              <Link to='/blog'>
                <button className='normal'>Blog</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Homecard;
