import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Spinner, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaInfoCircle, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import { Tooltip, OverlayTrigger, Badge } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const FarmerProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectionReason, setShowRejectionReason] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { user } = useAuth();

  // Function to get status badge with appropriate styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <Badge bg="success" className="d-flex align-items-center gap-1">
            <FaCheck size={12} /> Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge bg="danger" className="d-flex align-items-center gap-1">
            <FaTimes size={12} /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge bg="warning" text="dark" className="d-flex align-items-center gap-1">
            <FaClock size={12} /> Pending Review
          </Badge>
        );
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Check if user is authenticated
        if (!user) {
          setError('Please log in to view your products');
          return;
        }

        console.log('Fetching products for user:', user._id);
        
        const response = await api.get('/api/farmer/products');
        
        console.log('API Response:', {
          status: response.status,
          statusText: response.statusText,
          data: response.data
        });
        
        if (response.data && response.data.success) {
          // Check if products is an array, if not, convert it to an array
          const productsData = Array.isArray(response.data.products) 
            ? response.data.products 
            : [];
            
          setProducts(productsData);
          console.log('Products set:', productsData.length);
          
          if (productsData.length === 0) {
            setError('No products found. Add your first product to get started!');
          }
        } else {
          console.error('Unexpected response format:', response.data);
          setError('Failed to load products. Please try again later.');
          setProducts([]);
        }
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to load products. Please try again.';
        console.error('Error fetching products:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          config: err.config
        });
        setError(errorMsg);
        setProducts([]);
        
        // If unauthorized, redirect to login
        if (err.response?.status === 401) {
          // The interceptor should handle this, but just in case
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated
    if (user) {
      fetchProducts();
    } else {
      setLoading(false);
      setError('Please log in to view your products');
    }
  }, [user]); // Add user to dependency array

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/farmer/products/${productId}`);
        setProducts(products.filter(product => product._id !== productId));
      } catch (err) {
        setError('Failed to delete product');
        console.error('Error deleting product:', err);
      }
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="text-dark">My Products</h2>
          <Button 
            as={Link} 
            to="/farmer/products/new" 
            variant="primary" 
            className="mt-2 d-inline-flex align-items-center"
            style={{ padding: '0.25rem 0.75rem' }}
          >
            <FaPlus size={12} className="me-1" />
            <span>Add New Products</span>
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '80px' }}>Image</th>
                  <th>Name</th>
                  <th>Farmer</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-center" style={{ width: '200px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id} className="align-middle">
                      <td>
                        <div className="position-relative" style={{ width: '60px', height: '60px' }}>
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="img-fluid rounded"
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'cover' 
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/60?text=No+Image';
                              }}
                            />
                          ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center h-100 rounded">
                              <small className="text-muted">No Image</small>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="fw-medium">{product.name}</div>
                        <small className="text-muted">{product.category || 'No category'}</small>
                      </td>
                      <td className="align-middle">
                        {product.farmer?.name || 'Unknown Farmer'}
                        {product.farmer?.email && (
                          <div className="text-muted small">{product.farmer.email}</div>
                        )}
                      </td>
                      <td className="align-middle fw-bold">${product.price?.toFixed(2)}</td>
                      <td className="align-middle">
                        <span className={`badge ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`}>
                          {product.stock || 0} in stock
                        </span>
                      </td>
                      <td className="align-middle">
                        {getStatusBadge(product.status, product.rejectionReason)}
                      </td>
                      <td className="align-middle">
                        <div className="d-flex justify-content-center gap-2">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Edit Product</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              className="d-flex align-items-center justify-content-center p-2"
                              style={{ 
                                width: '40px', 
                                height: '40px',
                                transition: 'all 0.2s',
                                borderWidth: '2px',
                                opacity: product.status === 'approved' ? 0.6 : 1,
                                cursor: product.status === 'approved' ? 'not-allowed' : 'pointer'
                              }}
                              href={product.status !== 'approved' ? `/farmer/products/edit/${product._id}` : '#'}
                              disabled={product.status === 'approved'}
                            >
                              <FaEdit size={18} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {product.status === 'approved' 
                                  ? 'Approved products cannot be deleted' 
                                  : 'Delete Product'}
                              </Tooltip>
                            }
                          >
                            <div>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-2"
                                style={{ 
                                  width: '40px', 
                                  height: '40px',
                                  transition: 'all 0.2s',
                                  borderWidth: '2px',
                                  opacity: product.status === 'approved' ? 0.6 : 1,
                                  cursor: product.status === 'approved' ? 'not-allowed' : 'pointer'
                                }}
                                onClick={() => product.status !== 'approved' && handleDelete(product._id)}
                                disabled={product.status === 'approved'}
                              >
                                <FaTrash size={18} />
                              </Button>
                            </div>
                          </OverlayTrigger>
                          
                          {/* Rejection Reason Popover */}
                          {product.status === 'rejected' && product.rejectionReason && (
                            <OverlayTrigger
                              trigger="click"
                              placement="top"
                              overlay={
                                <Tooltip id={`rejection-tooltip-${product._id}`}>
                                  <div className="text-start">
                                    <h6>Rejection Reason:</h6>
                                    <p className="mb-0">{product.rejectionReason}</p>
                                  </div>
                                </Tooltip>
                              }
                            >
                              <Button
                                variant="outline-info"
                                size="sm"
                                className="d-flex align-items-center justify-content-center p-2"
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  transition: 'all 0.2s',
                                  borderWidth: '2px'
                                }}
                              >
                                <FaInfoCircle size={18} />
                              </Button>
                            </OverlayTrigger>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="py-4">
                        <FaPlus size={48} className="text-muted mb-3" />
                        <h5 className="text-muted mb-3">No products found</h5>
                        <Button 
                          variant="primary" 
                          href="/farmer/products/new"
                          className="px-4"
                        >
                          <FaPlus className="me-2" /> Add Your First Product
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default FarmerProducts;
