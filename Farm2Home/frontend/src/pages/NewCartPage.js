import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Table, Button, Form, Card, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus, FaArrowLeft } from 'react-icons/fa';
import { useCart } from '../contexts/NewCartContext';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { items, removeItem, updateQty, clearCart, isLoading, refreshCart: loadCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isRemoving, setIsRemoving] = useState({});
  const [error, setError] = useState('');
  const DELIVERY_FEE = 29;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 0.5) return; // Minimum quantity is 0.5
    
    try {
      // Find the item to check stock
      const item = items.find(item => item._id === productId);
      if (!item) {
        console.warn('Item not found in cart, refreshing...');
        await loadCart(); // Try to refresh the cart
        return;
      }
      
      // Ensure we don't exceed available stock
      const quantity = Math.min(newQty, item.stock || Infinity);
      
      // Update the quantity
      const success = await updateQty(productId, quantity);
      
      // If update failed, refresh the cart
      if (!success) {
        await loadCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      // Show a more specific error message if available
      setError(error.message || 'Failed to update quantity');
    }
  };

  const handleIncrement = async (item) => {
    await handleQuantityChange(item._id, item.qty + 1);
  };

  const handleDecrement = async (item) => {
    const newQty = Math.max(0.5, item.qty - 1); // Don't go below 0.5
    if (newQty !== item.qty) {
      await handleQuantityChange(item._id, newQty);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      setIsRemoving(prev => ({ ...prev, [productId]: true }));
      const success = await removeItem(productId);
      if (!success) {
        throw new Error('Failed to remove item');
      }
      // Show success message
      alert('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error.message || 'Failed to remove item');
    } finally {
      setIsRemoving(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const success = await clearCart();
        if (!success) {
          throw new Error('Failed to clear cart');
        }
        alert('Cart cleared successfully');
      } catch (error) {
        console.error('Error clearing cart:', error);
        setError(error.message || 'Failed to clear cart');
      }
    }
  };

  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.qty), 0);
  };

  const subtotal = calculateSubtotal();
  const total = subtotal + DELIVERY_FEE;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Your Shopping Cart</h2>
        <Link to="/products" className="btn btn-outline-primary">
          <FaArrowLeft className="me-2" /> Continue Shopping
        </Link>
      </div>

      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}

      {isLoading && !items.length ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading your cart...</p>
        </div>
      ) : items.length === 0 ? (
        <Card className="mb-4">
          <Card.Body className="text-center py-5">
            <h4>Your cart is empty</h4>
            <p className="text-muted">Looks like you haven't added any items to your cart yet.</p>
            <Button as={Link} to="/products" variant="primary">
              Browse Products
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          <Col lg={8} className="mb-4">
            <Card className="mb-4">
              <Card.Body>
                <Table hover responsive>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th className="text-end">Total</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.imageUrl || '/placeholder-product.jpg'} 
                              alt={item.name}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', marginRight: '15px' }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                            <div>
                              <h6 className="mb-0">{item.name}</h6>
                              <small className="text-muted">In Stock: {item.stock} kg</small>
                            </div>
                          </div>
                        </td>
                        <td>₹{item.price.toFixed(2)}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleDecrement(item)}
                              disabled={item.qty <= 1 || isRemoving[item._id]}
                            >
                              <FaMinus />
                            </Button>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.stock}
                              value={item.qty}
                              onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                              className="mx-2 text-center"
                              style={{ width: '70px' }}
                            />
                            <Button 
                              variant="outline-secondary" 
                              size="sm"
                              onClick={() => handleIncrement(item)}
                              disabled={item.qty >= item.stock || isRemoving[item._id]}
                            >
                              <FaPlus />
                            </Button>
                          </div>
                        </td>
                        <td className="text-end">₹{(item.price * item.qty).toFixed(2)}</td>
                        <td className="text-end">
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleRemoveItem(item._id)}
                            disabled={isRemoving[item._id]}
                          >
                            {isRemoving[item._id] ? (
                              <Spinner as="span" size="sm" animation="border" role="status" />
                            ) : (
                              <FaTrash />
                            )}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <div className="d-flex justify-content-end">
                  <Button 
                    variant="outline-danger" 
                    onClick={handleClearCart}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Clearing...' : 'Clear Cart'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          
          <Col lg={4}>
            <Card>
              <Card.Body>
                <h5 className="mb-4">Order Summary</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Delivery Fee</span>
                  <span>₹{DELIVERY_FEE.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-4">
                  <h5>Total</h5>
                  <h5>₹{total.toFixed(2)}</h5>
                </div>
                {isAuthenticated ? (
                  <Button 
                    variant="primary" 
                    className="w-100 mb-2"
                    onClick={() => navigate('/checkout')}
                    disabled={items.length === 0 || isLoading}
                  >
                    {isLoading ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                ) : (
                  <div className="text-center">
                    <Button 
                      variant="primary" 
                      className="w-100 mb-2"
                      onClick={() => navigate('/login', { state: { from: '/checkout' }})}
                      disabled={items.length === 0 || isLoading}
                    >
                      Login to Checkout
                    </Button>
                    <p className="text-muted small mt-2">
                      <Link to="/register">Create an account</Link> for a faster checkout experience
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default CartPage;
