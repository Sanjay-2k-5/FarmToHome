import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FaShoppingCart, FaTruck, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft } from 'react-icons/fa';
import api from '../services/api';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/api/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        setError('Failed to load order details. Please try again later.');
        console.error('Error fetching order:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { variant: 'warning', icon: <FaShoppingCart className="me-1" /> },
      'processing': { variant: 'info', icon: <FaTruck className="me-1" /> },
      'shipped': { variant: 'primary', icon: <FaTruck className="me-1" /> },
      'delivered': { variant: 'success', icon: <FaCheckCircle className="me-1" /> },
      'cancelled': { variant: 'danger', icon: <FaTimesCircle className="me-1" /> },
      'rejected': { variant: 'danger', icon: <FaTimesCircle className="me-1" /> },
    };

    const statusConfig = statusMap[status] || { variant: 'secondary', icon: <FaInfoCircle className="me-1" /> };
    
    return (
      <Badge bg={statusConfig.variant} className="d-inline-flex align-items-center">
        {statusConfig.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading order details...</p>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">
          {error || 'Order not found'}
        </Alert>
        <Button as={Link} to="/my-orders" variant="outline-primary" className="mt-3">
          Back to My Orders
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Button 
        variant="link" 
        onClick={() => navigate(-1)} 
        className="mb-3 d-flex align-items-center p-0"
      >
        <FaArrowLeft className="me-2" /> Back to Orders
      </Button>
      
      <h2 className="mb-4" style={{color: 'black'}}>Order #{order.orderNumber || order._id.substring(18).toUpperCase()}</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="mb-4">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Order Items</Card.Header>
            <Card.Body>
              <Table hover>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <div className="d-flex align-items-center">
                          <img 
                            src={item.product?.image || '/images/placeholder.png'} 
                            alt={item.name} 
                            style={{ width: '50px', height: '50px', objectFit: 'cover', marginRight: '15px' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = '/images/placeholder.png';
                            }}
                          />
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            {item.variant && (
                              <small className="text-muted">
                                {Object.entries(item.variant).map(([key, value]) => (
                                  <span key={key} className="me-2">{key}: {value}</span>
                                ))}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{formatCurrency(item.price)}</td>
                      <td>{item.qty}</td>
                      <td className="text-end">{formatCurrency(item.price * item.qty)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
          
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <Card.Header as="h5">Order Status History</Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  {[...order.statusHistory].reverse().map((status, index) => (
                    <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">
                          {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                        </div>
                        <small className="text-muted">
                          {status.note || 'Status updated'}
                        </small>
                      </div>
                      <small className="text-muted">
                        {formatDate(status.changedAt)}
                      </small>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header as="h5">Order Summary</Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Order Status:</span>
                  <span>{getStatusBadge(order.status)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Order Date:</span>
                  <span>{formatDate(order.createdAt)}</span>
                </ListGroup.Item>
                {order.deliveredAt && (
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Delivered On:</span>
                    <span>{formatDate(order.deliveredAt)}</span>
                  </ListGroup.Item>
                )}
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.items.reduce((sum, item) => sum + (item.price * item.qty), 0))}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(order.deliveryFee || 0)}</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total)}</span>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header as="h5">Delivery Address</Card.Header>
            <Card.Body>
              {order.shippingAddress ? (
                <div>
                  <p className="mb-1"><strong>{order.shippingAddress.name}</strong></p>
                  <p className="mb-1">{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && (
                    <p className="mb-1">{order.shippingAddress.addressLine2}</p>
                  )}
                  <p className="mb-1">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="mb-0">
                    <strong>Phone:</strong> {order.shippingAddress.phone}
                  </p>
                </div>
              ) : (
                <p>No shipping address provided</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderDetailPage;
