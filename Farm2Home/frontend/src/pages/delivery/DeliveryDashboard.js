import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../utils/api';

// Format date helper
const formatDate = (dateString) => {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return new Date(dateString).toLocaleString('en-US', options);
};
const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch orders that need delivery
  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/delivery/orders');
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      toast.error(error.response?.data?.message || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      await api.put(`/delivery/orders/${orderId}/status`, { status });
      
      // Update local state
      setOrders(prevOrders => 
        status === 'delivered'
          ? prevOrders.filter(order => order._id !== orderId)
          : prevOrders.map(order => 
              order._id === orderId 
                ? { ...order, status } 
                : order
            )
      );
      
      toast.success(`Order marked as ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  // Fetch orders on component mount
  useEffect(() => {
    fetchDeliveryOrders();
    
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchDeliveryOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return 'primary';
      case 'processing':
        return 'info';
      case 'shipped':
        return 'warning';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <h2>Delivery Dashboard</h2>
        <p>Loading orders...</p>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Delivery Dashboard</h2>
      
      {orders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <h4>No orders to deliver</h4>
            <p className="text-muted">New orders will appear here when they're ready for delivery.</p>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {orders.map((order) => (
            <Col key={order._id} md={6} lg={4} className="mb-4">
              <Card className="h-100">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                    <div className="small text-muted">{formatDate(order.updatedAt)}</div>
                  </div>
                  <Badge bg={getStatusBadge(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <strong>Customer:</strong> {order.user?.fname} {order.user?.lname}
                    <br />
                    <strong>Phone:</strong> {order.user?.phone || 'N/A'}
                    <br />
                    <strong>Address:</strong> {order.shippingAddress}
                  </div>
                  
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-2"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetails(!showDetails);
                    }}
                  >
                    {showDetails && selectedOrder?._id === order._id ? 'Hide Details' : 'View Details'}
                  </Button>

                  {order.status === 'accepted' && (
                    <Button 
                      variant="primary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => updateOrderStatus(order._id, 'processing')}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Start Processing'}
                    </Button>
                  )}

                  {order.status === 'processing' && (
                    <Button 
                      variant="warning" 
                      size="sm" 
                      className="me-2"
                      onClick={() => updateOrderStatus(order._id, 'shipped')}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Mark as Shipped'}
                    </Button>
                  )}

                  {order.status === 'shipped' && (
                    <Button 
                      variant="success" 
                      size="sm" 
                      onClick={() => updateOrderStatus(order._id, 'delivered')}
                      disabled={updating}
                    >
                      {updating ? 'Updating...' : 'Mark as Delivered'}
                    </Button>
                  )}

                  {showDetails && selectedOrder?._id === order._id && (
                    <div className="mt-3">
                      <h6>Order Items:</h6>
                      <ul className="list-unstyled">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="mb-2">
                            {item.qty} x {item.name} - ₹{item.price.toFixed(2)} each
                          </li>
                        ))}
                      </ul>
                      <div className="mt-2">
                        <strong>Total: ₹{order.total.toFixed(2)}</strong>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default DeliveryDashboard;
