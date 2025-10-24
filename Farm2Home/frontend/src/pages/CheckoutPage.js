import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Card, Row, Col } from 'react-bootstrap';
import { FaArrowLeft, FaMapMarkerAlt, FaCreditCard, FaMoneyBillWave } from 'react-icons/fa';
import { useCart } from '../contexts/NewCartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const CheckoutPage = () => {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'cod',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  const DELIVERY_FEE = 29;
  
  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const total = subtotal + DELIVERY_FEE;
  
  // Set user data on component mount
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || ''
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const { name, phone, address, city, state, pincode } = formData;
    if (!name || !phone || !address || !city || !state || !pincode) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const shippingAddress = `${address}, ${city}, ${state} - ${pincode}`;
      
      const { data } = await api.post('/api/orders', {
        shippingAddress,
        paymentMethod: formData.paymentMethod
      });
      
      // Clear cart on successful order
      if (data.success) {
        await clearCart();
        setOrderDetails(data.order);
        setOrderSuccess(true);
      }
      
    } catch (error) {
      console.error('Error placing order:', error);
      setError(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  if (orderSuccess) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="mb-4">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#28a745"/>
            </svg>
          </div>
          <h2>Order Placed Successfully!</h2>
          <p className="lead">Thank you for your order.</p>
          <p>Your order ID is: <strong>{orderDetails?._id}</strong></p>
          <p>We've sent a confirmation email to {user?.email}</p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => navigate('/orders')} className="me-2">
              View Orders
            </Button>
            <Button variant="outline-primary" onClick={() => navigate('/products')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <div className="mb-4">
        <Button 
          variant="link" 
          onClick={() => navigate(-1)} 
          className="p-0 mb-3"
        >
          <FaArrowLeft className="me-2" /> Back to Cart
        </Button>
        <h2>Checkout</h2>
      </div>
      
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
      
      <Row>
        <Col lg={8} className="mb-4">
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="mb-4">
                <FaMapMarkerAlt className="me-2" />
                Shipping Information
              </Card.Title>
              
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="name">
                      <Form.Label>Full Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="phone">
                      <Form.Label>Phone <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="pincode">
                      <Form.Label>Pincode <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="address">
                  <Form.Label>Address <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="city">
                      <Form.Label>City <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Group controlId="state">
                      <Form.Label>State <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <hr className="my-4" />
                
                <h5 className="mb-3">
                  <FaCreditCard className="me-2" />
                  Payment Method
                </h5>
                
                <div className="mb-4">
                  <Form.Check
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    label={
                      <>
                        <FaMoneyBillWave className="me-2" />
                        Cash on Delivery (COD)
                      </>
                    }
                    checked={formData.paymentMethod === 'cod'}
                    onChange={handleChange}
                    className="mb-2"
                  />
                  <Form.Check
                    type="radio"
                    id="online"
                    name="paymentMethod"
                    value="online"
                    label={
                      <>
                        <FaCreditCard className="me-2" />
                        Pay Online (Credit/Debit Card, UPI, etc.)
                      </>
                    }
                    checked={formData.paymentMethod === 'online'}
                    onChange={handleChange}
                    disabled // Disabled for now, can be enabled when online payment is implemented
                  />
                </div>
                
                <div className="d-grid">
                  <Button 
                    type="submit" 
                    size="lg"
                    disabled={loading || items.length === 0}
                  >
                    {loading ? (
                      <>
                        <Spinner as="span" size="sm" animation="border" role="status" className="me-2" />
                        Placing Order...
                      </>
                    ) : (
                      `Place Order (₹${total.toFixed(2)})`
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card>
            <Card.Body>
              <h5 className="mb-4">Order Summary</h5>
              
              <div className="mb-3">
                {items.map(item => (
                  <div key={item._id} className="d-flex justify-content-between mb-2">
                    <div>
                      <span className="fw-bold">{item.name}</span>
                      <span className="text-muted ms-2">x {item.qty}</span>
                    </div>
                    <div>₹{(item.price * item.qty).toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              <hr />
              
              <div className="mb-2">
                <div className="d-flex justify-content-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Delivery Fee</span>
                  <span>₹{DELIVERY_FEE.toFixed(2)}</span>
                </div>
              </div>
              
              <hr />
              
              <div className="d-flex justify-content-between mb-3">
                <h5>Total</h5>
                <h5>₹{total.toFixed(2)}</h5>
              </div>
              
              {formData.paymentMethod === 'cod' && (
                <div className="alert alert-info small">
                  <FaMoneyBillWave className="me-2" />
                  Cash on Delivery: Pay when you receive your order
                </div>
              )}
              
              {formData.paymentMethod === 'online' && (
                <div className="alert alert-warning small">
                  <FaCreditCard className="me-2" />
                  You will be redirected to a secure payment gateway
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;
