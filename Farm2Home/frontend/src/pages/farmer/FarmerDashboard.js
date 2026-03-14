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
  Modal,
  Tabs,
  Tab
} from 'react-bootstrap';
import { FaBox, FaShoppingCart, FaRupeeSign, FaCheckCircle, FaClipboardList, FaRobot } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import FarmerProducts from './FarmerProducts';
import PricePredictor from './PricePredictor';

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
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ pendingOrdersCount: 0, productsCount: 0 });
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  useAuth();
  
  // Poll for new orders every 30 seconds
  useEffect(() => {
    fetchOrders();
    fetchStats();
    
    const interval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
        setStatsLoading(true);
        // We will approximate stats or fetch from separate endpoints if combined endpoint doesn't exist
        const productsRes = await api.get('/farmer/products');
        const ordersRes = await api.get('/farmer/my-orders');

        const productsCount = Array.isArray(productsRes.data?.products) ? productsRes.data.products.length : 0;
        const pendingOrdersCount = Array.isArray(ordersRes.data?.orders) ? ordersRes.data.orders.length : 0;

        setStats({
            productsCount,
            pendingOrdersCount
        });
    } catch (err) {
        console.error("Error fetching stats:", err);
    } finally {
        setStatsLoading(false);
    }
  }

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
      fetchStats(); // Update stats after order change
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
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'black' }}>Farmer Dashboard</h2>
        <div>
          <Badge bg="light" text="dark" className="me-2">
            Last Updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {statsLoading ? (
         <div className="text-center py-5">
         <Spinner animation="border" role="status">
           <span className="visually-hidden">Loading Stats...</span>
         </Spinner>
       </div>
      ) : (
          <Row className="mb-4">
               <Col md={6} className="mb-4">
                 <div className="card h-100 shadow-sm">
                   <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                       <div className="fs-4"><FaClipboardList className="text-warning" /></div>
                     </div>
                     <h3 className="mb-1">{stats.pendingOrdersCount}</h3>
                     <p className="text-muted mb-0">Pending Orders</p>
                   </div>
                 </div>
               </Col>
               <Col md={6} className="mb-4">
                 <div className="card h-100 shadow-sm">
                   <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                       <div className="fs-4"><FaBox className="text-primary" /></div>
                     </div>
                     <h3 className="mb-1">{stats.productsCount}</h3>
                     <p className="text-muted mb-0">Total Products</p>
                   </div>
                 </div>
               </Col>
             </Row>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        fill
      >
        <Tab
          eventKey="orders"
          title={
            <div className="d-flex align-items-center">
              <FaShoppingCart className="me-2" />
              Orders
              {stats.pendingOrdersCount > 0 && (
                <Badge bg="danger" className="ms-2">
                  {stats.pendingOrdersCount}
                </Badge>
              )}
            </div>
          }
        >
            <div className="mt-3">
              <Card className="mb-4">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0" style={{ color: 'black' }}>Pending Orders</h5>
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
                                  {updating ? 'Processing...' : 'Accept'}
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
                                  Reject
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
            </div>
        </Tab>
        <Tab
          eventKey="products"
          title={
            <span>
              <FaBox className="me-2" />
              Products
            </span>
          }
        >
          <div className="mt-3">
              <FarmerProducts />
          </div>
        </Tab>
        <Tab
          eventKey="predictor"
          title={
            <span>
              <FaRobot className="me-2" />
              Price Predictor (AI)
            </span>
          }
        >
          <div className="mt-3">
              <PricePredictor />
          </div>
        </Tab>
      </Tabs>
      
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
