import React from 'react'
import './Carousel.css'
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick"
import { dataBestSeller } from '../Carousel';

const Carousel = () => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    initialSlide: 0,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 3,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
  return (
  <div className='entire'>
    <h1 className= "mainnnn text-center mt-3">Recomended Products</h1>
    <hr
        style={{
            height: 5  
        } }   
    />
    <div className='appp'>
    <Slider {...settings}>
    {dataBestSeller.map((item)=>(
     <div className='cArd'>
      <div className='card-top'>
        <img src={item.img} alt={item.title} />
        <h1>{item.title}</h1>
      </div>
      <div className='card-bottom'>
        <h3>{item.price}</h3>
        <p className="category">{item.category}</p>
      </div>
      </div>
      ))}
    </Slider>
    </div>
  </div>
  )
}

export default Carousel
