import "./HeroImg.css";
import React from "react";
import video from "../assets/home.mp4";
import { Link } from "react-router-dom";
const HeroImg = () => {
  return (
    <div className='hero'>
      <div className='mask'></div>
      <video src={video} muted autoPlay loop type='video/mp4'></video>
      <div className='content'>
        <h2>FRESH FROM THE FARM</h2>
        <div>
          <Link to='/Products' className='btn'>
            {" "}
            PRODUCTS{" "}
          </Link>
        </div>
        <div>
          <Link to='/cart' className='btn btn-light'>
            {" "}
            CART{" "}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HeroImg;
