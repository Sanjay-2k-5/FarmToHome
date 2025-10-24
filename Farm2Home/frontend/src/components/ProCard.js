import './Pro.css'
import React from 'react'
import { useCart } from '../contexts/CartContext';

const ProCard = ({ product }) => {
  const { addItem } = useCart();
  const imgSrc = product.imageUrl || product.img;
  const name = product.name;
  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);
  return (
    <div className='project-card'>
            <img src={imgSrc} alt={name} onError={(e)=>{ e.currentTarget.style.visibility='hidden'; }} />
            <h2 className='project-title'>{name}</h2>
            <div className='pro-details'>
                <p>₹{price.toFixed(2)}</p>
                <p className='text-muted' style={{marginTop: '-0.5rem'}}>In stock: {stock} kg</p>
                <div className='pro-btns'>
                   <button className="btn" onClick={() => addItem(product, 1)}>Add To Cart</button>
                </div>
          </div>
    </div>
  )
}

export default ProCard;
