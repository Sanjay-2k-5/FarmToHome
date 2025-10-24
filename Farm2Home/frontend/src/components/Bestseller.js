import './Bestseller.css'
import React from 'react'
import RecPro1 from '../images/Rice.jpg'
import RecPro2 from '../images/Apple.jpg'
import RecPro3 from '../images/Carrot.jpg'

const Bestseller = () => {
  return (
    <>
    <h1 className= "hey">Recomended Products</h1>
    <hr
        style={{height: 5}}   
    />
    <div className='mainnn'>
        <div className="row justify-content-center">
        <div className="card-coll">
            <img className="Rp1" src={RecPro1} alt="img" />
            <h3>BE-U Ulta Sheer SPF50 Sunscreen</h3>
            <p>Recommended for Normal Skin Type</p>
            <a href=" " className="btn btn-primary">Add to Cart</a>
        </div>
        <div className="card-coll">
            <img className="Rp2" src={RecPro2} alt="img" />
            <h3>BE-U Unisex Teatree Facewash</h3>
            <p>Recommended for Normal Skin Type</p>
            <a href=" " className="btn btn-primary">Add to Cart</a>
        </div>
        <div className="card-coll">
            <img className="Rp3" src={RecPro3} alt="img" />
            <h3>Hair Conditioner and Serum</h3>
            <p>Recommended for Dandruff Hair</p>
            <a href=" " className="btn btn-primary">Add to Cart</a>
        </div>
        </div>
        </div>
    </>
  )
}

export default Bestseller
