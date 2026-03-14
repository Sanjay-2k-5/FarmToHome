import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../utils/api';
import { FaTruck, FaBoxOpen, FaCheckCircle, FaClipboardList } from 'react-icons/fa';

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
  const [activeTab, setActiveTab] = useState('active');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [stats, setStats] = useState({ activeDeliveries: 0, completedDeliveries: 0 });
  const [updating, setUpdating] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch orders that need delivery
  const fetchDeliveryOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/delivery/orders');
      setOrders(data.orders || []);
      
      // Calculate basic stats from orders list
      if (data.orders) {
          const active = data.orders.filter(o => o.status !== 'delivered').length;
          const completed = data.orders.filter(o => o.status === 'delivered').length;
          setStats({
              activeDeliveries: active,
              completedDeliveries: completed
          });
      }
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      toast.error(error.response?.data?.message || 'Failed to load delivery orders');
    } finally {
      setLoading(false);
      setStatsLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      setUpdating(true);
      await api.put(`/delivery/orders/${orderId}/status`, { status });
      
      // Update local state and stats
      setOrders(prevOrders => {
        let newOrders;
        if (status === 'delivered') {
          newOrders = prevOrders.filter(order => order._id !== orderId);
          setStats(s => ({
              activeDeliveries: Math.max(0, s.activeDeliveries - 1),
              completedDeliveries: s.completedDeliveries + 1
          }));
        } else {
          newOrders = prevOrders.map(order => 
              order._id === orderId 
                ? { ...order, status } 
                : order
          );
        }
        return newOrders;
      });
      
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

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ color: 'black' }}>Delivery Dashboard</h2>
        <div>
          <Badge bg="light" text="dark" className="me-2">
            Last Updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

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
                       <div className="fs-4"><FaTruck className="text-warning" /></div>
                     </div>
                     <h3 className="mb-1">{stats.activeDeliveries}</h3>
                     <p className="text-muted mb-0">Active Deliveries</p>
                   </div>
                 </div>
               </Col>
               <Col md={6} className="mb-4">
                 <div className="card h-100 shadow-sm">
                   <div className="card-body">
                     <div className="d-flex justify-content-between align-items-center mb-3">
                       <div className="fs-4"><FaCheckCircle className="text-success" /></div>
                     </div>
                     <h3 className="mb-1">{stats.completedDeliveries}</h3>
                     <p className="text-muted mb-0">Completed Deliveries (Session)</p>
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
          eventKey="active"
          title={
            <div className="d-flex align-items-center">
              <FaBoxOpen className="me-2" />
              Active Deliveries
              {stats.activeDeliveries > 0 && (
                <Badge bg="danger" className="ms-2">
                  {stats.activeDeliveries}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-3">
                {loading && orders.length === 0 ? (
                    <div className="text-center py-5">
                        <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading Orders...</span>
                        </Spinner>
                    </div>
                ) : orders.length === 0 ? (
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
                        <Card className="h-100 shadow-sm">
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
                            className="me-2 mb-2"
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
                                className="me-2 mb-2"
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
                                className="me-2 mb-2"
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
                                className="me-2 mb-2"
                                onClick={() => updateOrderStatus(order._id, 'delivered')}
                                disabled={updating}
                            >
                                {updating ? 'Updating...' : 'Mark as Delivered'}
                            </Button>
                            )}

                            {showDetails && selectedOrder?._id === order._id && (
                            <div className="mt-3 p-2 bg-light rounded">
                                <h6>Order Items:</h6>
                                <ul className="list-unstyled mb-2">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="small">
                                    {item.qty} x {item.name} - ₹{item.price.toFixed(2)} each
                                    </li>
                                ))}
                                </ul>
                                <div className="border-top pt-2 mt-2">
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
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default DeliveryDashboard;
