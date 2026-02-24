import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Spinner, Button, Badge } from 'react-bootstrap';
import api from '../../services/api';

const RevenuePanel = () => {
  const [revenueData, setRevenueData] = useState({
    total: 0,
    monthly: [],
    pending: [],
    delivered: { totalRevenue: 0, orderCount: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState({});

  const loadRevenueData = async () => {
    setLoading(true);
    try {
      const [revenueRes, deliveredRes] = await Promise.all([
        api.get('/api/admin/revenue'),
        api.get('/api/orders/revenue')
      ]);
      
      setRevenueData({
        total: revenueRes.data?.total || 0,
        monthly: revenueRes.data?.monthly || [],
        pending: revenueRes.data?.pending || [],
        delivered: {
          totalRevenue: deliveredRes.data?.totalRevenue || 0,
          orderCount: deliveredRes.data?.orderCount || 0
        }
      });
    } catch (err) {
      console.error('Error loading revenue data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRevenue = async (id) => {
    try {
      setProcessing(prev => ({ ...prev, [id]: true }));
      await api.post(`/api/admin/revenue/process/${id}`);
      await loadRevenueData();
    } catch (err) {
      console.error('Error processing revenue:', err);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Total Revenue</Card.Title>
              <Card.Text className="display-6 fw-bold">
                {formatCurrency(revenueData.total)}
              </Card.Text>
              <div className="text-muted">All time processed revenue</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Delivered Orders</Card.Title>
              <Card.Text className="display-6 fw-bold">
                {revenueData.delivered.orderCount}
              </Card.Text>
              <div className="text-muted">Total delivered orders</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Delivered Revenue</Card.Title>
              <Card.Text className="display-6 fw-bold">
                {formatCurrency(revenueData.delivered.totalRevenue)}
              </Card.Text>
              <div className="text-muted">Total from delivered orders</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Pending Revenue</Card.Title>
          {revenueData.pending.length === 0 ? (
            <div className="text-center text-muted py-4">No pending revenue records</div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.pending.map((item) => (
                  <tr key={item._id}>
                    <td>{item.orderId}</td>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.customerName || 'N/A'}</td>
                    <td className="text-end">{formatCurrency(item.amount)}</td>
                    <td>
                      <Badge bg="warning">Pending</Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="success"
                        size="sm"
                        disabled={processing[item._id]}
                        onClick={() => handleProcessRevenue(item._id)}
                      >
                        {processing[item._id] ? (
                          <>
                            <Spinner as="span" size="sm" animation="border" role="status" />
                            <span className="ms-1">Processing...</span>
                          </>
                        ) : (
                          'Mark as Processed'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Monthly Revenue</Card.Title>
          {revenueData.monthly.length === 0 ? (
            <div className="text-center text-muted py-4">No revenue data available</div>
          ) : (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="text-end">Orders</th>
                  <th className="text-end">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.monthly.map((month) => (
                  <tr key={`${month.year}-${month.month}`}>
                    <td>
                      {new Date(2000, month.month - 1, 1).toLocaleString('default', { month: 'long' })}{' '}
                      {month.year}
                    </td>
                    <td className="text-end">{month.count || 0}</td>
                    <td className="text-end">{formatCurrency(month.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default RevenuePanel;
