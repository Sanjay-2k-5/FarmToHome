<<<<<<< HEAD
import './Pro.css'
import React, { useEffect, useState } from 'react'
import ProCard from './ProCard';
import api from '../services/api';
=======
import './Pro.css';
import React, { useEffect, useState, useMemo } from 'react';
import ProCard from './ProCard';
import api from '../services/api';
import { FaSearch } from 'react-icons/fa';
import { Form } from 'react-bootstrap';
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))

const Pro = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
<<<<<<< HEAD
=======
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Category options - must match the database enum values exactly
  const categories = [
    { value: 'all', label: 'All Products' },
    { value: 'fruit', label: 'Fruits' },
    { value: 'vegetable', label: 'Vegetables' },
    { value: 'other', label: 'Other Groceries' },
    { value: 'general', label: 'General' }
  ];

  // Filter products based on search term and category
  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    console.log('Filtering with category:', categoryFilter);
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(product => {
        const productCategory = String(product.category || '').toLowerCase().trim();
        const match = productCategory === categoryFilter.toLowerCase();
        if (!match) {
          console.log(`Product ${product.name} (${product._id}) has category '${productCategory}' which does not match '${categoryFilter}'`);
        }
        return match;
      });
    } else {
      console.log('Showing all categories');
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(term) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
    
    return result;
  }, [products, searchTerm, categoryFilter]);
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/api/products?availability=active&sort=newest');
<<<<<<< HEAD
        setProducts(Array.isArray(data) ? data : []);
=======
        const productsData = Array.isArray(data) ? data : [];
        console.log('Products with categories:', productsData.map(p => ({
          name: p.name,
          category: p.category,
          id: p._id
        })));
        setProducts(productsData);
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
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
<<<<<<< HEAD
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
=======
    <div className='work-container text-color white'>
      <h1 className='project-heading'>Our Products</h1>
      
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search products..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Category Filter */}
        <div className="category-filter">
          <Form.Select 
            aria-label="Filter by category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="category-select"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>
      
      <div className='project-container'>
        {loading ? (
          <div className="text-muted" style={{ padding: '2rem', gridColumn: '1 / -1', textAlign: 'center' }}>
            Loading products...
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <ProCard key={p._id} product={p} />
          ))
        ) : (
          <div className="no-products" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
            {searchTerm ? 'No products match your search.' : 'No products available.'}
          </div>
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
        )}
      </div>
    </div>
  );
<<<<<<< HEAD
}

export default Pro
=======
};

export default Pro;
>>>>>>> 9516d0b (Add local files and apply local edits (branch: muthu-sbranch))
