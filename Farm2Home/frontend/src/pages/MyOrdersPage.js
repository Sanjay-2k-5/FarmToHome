import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaTruck, FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import api from '../services/api';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/my-orders');
        setOrders(data.orders || []);
      } catch (err) {
        setError('Failed to load orders. Please try again later.');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

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
      <Badge bg={statusConfig.variant} className="d-flex align-items-center">
        {statusConfig.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
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
        <p className="mt-2">Loading your orders...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4" style={{ color: 'black' }}>My Orders</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {orders.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <div className="display-1 text-muted mb-3">
              <FaShoppingCart />
            </div>
            <h4>No Orders Yet</h4>
            <p className="text-muted mb-4">You haven't placed any orders yet.</p>
            <Button as={Link} to="/products" variant="primary">
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order.orderNumber || order._id.substring(18).toUpperCase()}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items.reduce((sum, item) => sum + item.qty, 0)}</td>
                      <td>{formatCurrency(order.total)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td className="text-end">
                        <Button 
                          as={Link} 
                          to={`/orders/${order._id}`} 
                          variant="outline-primary" 
                          size="sm"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default MyOrdersPage;
