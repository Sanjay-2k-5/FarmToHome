import './Pro.css'
import React, { useEffect, useState } from 'react'
import ProCard from './ProCard';
import api from '../services/api';

const Pro = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/products?availability=active&sort=newest');
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load products', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className='work-container'>
      <h1 className='project-heading'> Our Products </h1>
      <div className='project-container'>
        {loading ? (
          <div className="text-muted" style={{ padding: '2rem' }}>Loading products...</div>
        ) : (
          products.map((p) => (
            <ProCard key={p._id} product={p} />
          ))
        )}
        {!loading && products.length === 0 && (
          <div className="text-muted" style={{ padding: '2rem' }}>No products available</div>
        )}
      </div>
    </div>
  );
}

export default Pro
