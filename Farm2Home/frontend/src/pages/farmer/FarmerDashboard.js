import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Badge, 
  Button, 
  ListGroup, 
  Alert, 
  Spinner,
  Modal
} from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
// Format date helper function
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const FarmerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  useAuth(); // Just to ensure auth context is available
  
  // Poll for new orders every 30 seconds
  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(() => {
      fetchOrders();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch farmer's pending orders
  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/farmer/my-orders');
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.message || 'Failed to load orders. Please check your connection.');
    } finally {
      setOrdersLoading(false);
    }
  };
  
  // Update order status
  const updateOrderStatus = async (orderId, status, reason = '') => {
    try {
      setUpdating(true);
      await api.put(`/farmer/update-order-status/${orderId}`, { status, reason });
      
      // Update local state
      setOrders(prevOrders => 
        status === 'accepted' || status === 'rejected'
          ? prevOrders.filter(order => order._id !== orderId)
          : prevOrders.map(order => 
              order._id === orderId 
                ? { ...order, status } 
                : order
            )
      );
      
      toast.success(`Order ${status} successfully`);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error(err.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };
  
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'accepted': return 'primary';
      case 'rejected': return 'danger';
      case 'shipped': return 'info';
      case 'delivered': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Farmer Dashboard</h2>
          <p className="text-muted">Manage incoming orders</p>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={12}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Orders</h5>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={fetchOrders}
                disabled={ordersLoading}
              >
                {ordersLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Card.Header>
            <Card.Body>
              {ordersLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" />
                  <p className="mt-2">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-muted text-center py-4">No pending orders</p>
              ) : (
                <ListGroup variant="flush">
                  {orders.map((order) => (
                    <ListGroup.Item key={order._id} className="py-3">
                      <Row className="align-items-center">
                        <Col md={3}>
                          <div className="fw-bold">Order #{order._id.slice(-6).toUpperCase()}</div>
                          <div className="small text-muted">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="small">
                            Customer: {order.user?.fname} {order.user?.lname}
                          </div>
                        </Col>
                        <Col md={3}>
                          <div className="fw-bold">{formatPrice(order.total)}</div>
                          <Badge bg={getStatusBadge(order.status)} className="mt-1">
                            {order.status}
                          </Badge>
                        </Col>
                        <Col md={4}>
                          <div className="small">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-truncate small" style={{ maxWidth: '250px' }}>
                            {order.items.map(item => item.name).join(', ')}
                          </div>
                        </Col>
                        <Col md={2} className="text-end">
                          <div className="d-grid gap-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => updateOrderStatus(order._id, 'accepted')}
                              disabled={updating}
                            >
                              {updating ? 'Processing...' : 'Accept Order'}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowRejectModal(true);
                              }}
                              disabled={updating}
                            >
                              Reject Order
                            </Button>
                          </div>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Reject Order Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Order #{selectedOrder?._id?.slice(-6)?.toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this order:</p>
          <textarea
            className="form-control"
            rows="3"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Enter reason for rejection..."
          />
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason('');
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={() => updateOrderStatus(selectedOrder?._id, 'rejected', rejectReason)}
            disabled={!rejectReason.trim() || updating}
          >
            {updating ? 'Processing...' : 'Confirm Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FarmerDashboard;
