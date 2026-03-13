import './Pro.css';
import React, { useState } from 'react';
import { useCart } from '../contexts/NewCartContext';
import { FaShoppingCart, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProCard = ({ product }) => {
  const { addOrUpdateItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState(null);

  // Use imageUrl, fallback to placeholder if not available
  const imgSrc = product.imageUrl ? product.imageUrl : 'https://via.placeholder.com/300x200?text=Product+Image';
  const name = product.name;
  const price = Number(product.price || 0);
  const stock = Number(product.stock || 0);
  const description = product.description || '';

  const handleAddToCart = async () => {
    if (isAdding || added || stock <= 0) return;

    setIsAdding(true);
    setError(null);

    try {
      const success = await addOrUpdateItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl || 'https://via.placeholder.com/300x200?text=Product+Image',
        description: product.description
      }, 1);

      if (success) {
        setAdded(true);
        toast.success(`${product.name} added to cart!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });

        // Reset the added state after 2 seconds
        setTimeout(() => setAdded(false), 2000);
      } else {
        throw new Error('Failed to add item to cart');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setError('Failed to add item to cart. Please try again.');
      toast.error('Failed to add item to cart', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className='project-card'>
      <div className='card-image-container' style={{ position: 'relative' }}>
        <img
          src={imgSrc}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
        {product.status === 'pending' && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#ff9800',
            color: 'white',
            padding: '4px 8px',
            fontSize: '12px',
            fontWeight: 'bold',
            borderRadius: '4px',
            zIndex: 10
          }}>
            Pending
          </div>
        )}
      </div>
      <h2 className='project-title'>{name}</h2>
      <div className='pro-details'>
        {description && <p className='description'>{description.length > 80 ? `${description.substring(0, 80)}...` : description}</p>}
        <p className='price'>₹{price.toFixed(2)}</p>
        <p className='stock' style={{ color: stock > 0 ? '#4CAF50' : '#f44336' }}>
          {stock > 0 ? `In Stock: ${stock} kg` : 'Out of Stock'}
        </p>
        <div className='pro-btns'>
          <button
            className={`btn ${added ? 'added' : ''}`}
            onClick={handleAddToCart}
            disabled={isAdding || stock <= 0 || product.status === 'pending'}
            title={product.status === 'pending' ? 'Product pending admin approval' : ''}
          >
            {product.status === 'pending' ? (
              'Pending Approval'
            ) : isAdding ? (
              'Adding...'
            ) : added ? (
              <>
                <FaCheck className="mr-1" /> Added!
              </>
            ) : (
              <>
                <FaShoppingCart className="mr-1" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProCard;
