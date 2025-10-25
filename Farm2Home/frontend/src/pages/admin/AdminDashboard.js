import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Container, Row, Col, Badge, Spinner, Alert } from 'react-bootstrap';
import { FaBox, FaUsers, FaRupeeSign, FaChartLine, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import ProductsManager from './ProductsManager';
import UsersPanel from './UsersPanel';
import RevenuePanel from './RevenuePanel';
import ReportsPanel from './ReportsPanel';
import ProductApprovals from './ProductApprovals';
import api from '../../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dashboard stats from API with error handling
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      // Make parallel API calls to get all stats with error handling
      const [productsRes, usersRes, revenueRes, ordersRes] = await Promise.all([
        api.get('/api/admin/stats/products').catch(e => ({ data: { total: 0, change: '0%' } })),
        api.get('/api/admin/stats/users').catch(e => ({ data: { active: 0, change: '0%' } })),
        api.get('/api/admin/stats/revenue').catch(e => ({ data: { currentMonth: 0, change: '0%' } })),
        api.get('/api/admin/stats/orders').catch(e => ({ data: { pending: 0, change: '0%' } }))
      ]);

      setStats([
        { 
          title: 'Total Products', 
          value: productsRes?.data?.total?.toLocaleString() || '0',
          icon: <FaBox className="text-primary" />,
          change: productsRes?.data?.change || '0%',
          trend: productsRes?.data?.change?.startsWith('+') ? 'up' : 'down'
        },
        { 
          title: 'Active Users', 
          value: usersRes?.data?.active?.toLocaleString() || '0',
          icon: <FaUsers className="text-success" />,
          change: usersRes?.data?.change || '0%',
          trend: usersRes?.data?.change?.startsWith('+') ? 'up' : 'down'
        },
        { 
          title: 'Monthly Revenue', 
          value: `₹${(revenueRes?.data?.currentMonth || 0).toLocaleString('en-IN')}`,
          icon: <FaRupeeSign className="text-warning" />,
          change: revenueRes?.data?.change || '0%',
          trend: revenueRes?.data?.change?.startsWith('+') ? 'up' : 'down'
        },
        { 
          title: 'Pending Orders', 
          value: (ordersRes?.data?.pending || 0).toString(),
          icon: <FaShoppingCart className="text-info" />,
          change: ordersRes?.data?.change || '0%',
          trend: ordersRes?.data?.change?.startsWith('+') ? 'up' : 'down'
        }
      ]);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError('Failed to load dashboard statistics. Some features may be limited.');
      // Set default stats if API fails completely
      setStats([
        { title: 'Total Products', value: '0', icon: <FaBox className="text-primary" />, change: '0%', trend: 'up' },
        { title: 'Active Users', value: '0', icon: <FaUsers className="text-success" />, change: '0%', trend: 'up' },
        { title: 'Monthly Revenue', value: '₹0', icon: <FaRupeeSign className="text-warning" />, change: '0%', trend: 'up' },
        { title: 'Pending Orders', value: '0', icon: <FaShoppingCart className="text-info" />, change: '0%', trend: 'down' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handler functions
  const handleApprove = async (productId) => {
    try {
      console.log(`Approving product ${productId}`);
      // await api.put(`/api/admin/products/${productId}/status`, { status: 'approved' });
      // Refresh dashboard data after approval
      await fetchDashboardStats();
    } catch (err) {
      console.error('Error approving product:', err);
    }
  };

  const handleReject = async (productId, reason) => {
    try {
      console.log(`Rejecting product ${productId} with reason: ${reason}`);
      // await api.put(`/api/admin/products/${productId}/status`, { status: 'rejected', reason });
      // Refresh dashboard data after rejection
      await fetchDashboardStats();
    } catch (err) {
      console.error('Error rejecting product:', err);
    }
  };

  return (
    <Container fluid className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <div>
          <Badge bg="light" text="dark" className="me-2">
            Last Updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <Row className="mb-4">
          {stats.map((stat, index) => (
            <Col key={index} md={3} className="mb-4">
              <div className="card h-100 shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="fs-4">{stat.icon}</div>
                    <div className={`badge bg-${stat.trend === 'up' ? 'success' : 'danger'}-subtle text-${stat.trend === 'up' ? 'success' : 'danger'} fw-medium`}>
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="mb-1">{stat.value}</h3>
                  <p className="text-muted mb-0">{stat.title}</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      )}

      {/* Main Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        fill
      >
        <Tab 
          eventKey="approvals" 
          title={
            <div className="d-flex align-items-center">
              <FaCheckCircle className="me-2" />
              Approvals
              {stats?.some(stat => stat.pendingCount > 0) && (
                <Badge bg="danger" className="ms-2">
                  {stats.find(stat => stat.pendingCount > 0)?.pendingCount}
                </Badge>
              )}
            </div>
          }
        >
          <div className="mt-3">
            <ProductApprovals />
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
            <ProductsManager 
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        </Tab>
        
        <Tab 
          eventKey="users" 
          title={
            <span>
              <FaUsers className="me-2" />
              Users
            </span>
          }
        >
          <div className="mt-3">
            <UsersPanel />
          </div>
        </Tab>
        
        <Tab 
          eventKey="revenue" 
          title={
            <span>
              <FaRupeeSign className="me-2" />
              Revenue
            </span>
          }
        >
          <div className="mt-3">
            <RevenuePanel />
          </div>
        </Tab>
        
        <Tab 
          eventKey="reports" 
          title={
            <span>
              <FaChartLine className="me-2" />
              Reports
            </span>
          }
        >
          <div className="mt-3">
            <ReportsPanel />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default AdminDashboard;
