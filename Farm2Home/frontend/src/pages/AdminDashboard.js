import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Row, Col, Card, Button, Badge, Tab, Nav, Spinner, Form, Table, Modal, InputGroup, ButtonGroup } from 'react-bootstrap';
import api, { getRevenueStats, processRevenue, getDeliveredOrdersRevenue } from '../services/api';

const AdminDashboard = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [sales, setSales] = useState([]);
  const [range, setRange] = useState('30');

  useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s1, s2] = await Promise.all([
          api.get('/api/admin/stats'),
          api.get(`/api/admin/sales?range=${range}d`),
        ]);
        setStats(s1.data);
        setSales(s2.data.data || []);
      } catch (e) {
        console.error('Admin data load failed', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [range]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col className="d-flex justify-content-between align-items-center text-color-black">
          <h1 style={{ color: 'black' }}>Admin Dashboard {user ? <Badge bg="success" className="ms-2">Admin</Badge> : null}</h1>
          <Button variant="outline-danger" onClick={handleLogout}>Logout</Button>
        </Col>
      </Row>

      {loading ? (
        <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Users</Card.Title>
                  <Card.Text className="display-6 fw-bold">{stats?.userCount ?? 0}</Card.Text>
                  <div className="text-muted">Total registered users</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Products</Card.Title>
                  <Card.Text className="display-6 fw-bold">{stats?.productCount ?? 0}</Card.Text>
                  <div className="text-muted">Active products</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="h-100">
                <Card.Body>
                  <Card.Title>Revenue</Card.Title>
                  <Card.Text className="display-6 fw-bold">₹{Number(stats?.totalRevenue || 0).toFixed(2)}</Card.Text>
                  <div className="text-muted">Total sales</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tab.Container defaultActiveKey="products">
            <Nav variant="tabs" className="mb-3">
              <Nav.Item>
                <Nav.Link eventKey="products">Products</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="users">Users</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="reports">Reports</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="revenue">Revenue</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="products">
                <ProductsManager />
              </Tab.Pane>
              <Tab.Pane eventKey="users">
                <UsersPanel />
              </Tab.Pane>
              <Tab.Pane eventKey="reports">
                <ReportsPanel sales={sales} range={range} setRange={setRange} />
              </Tab.Pane>
              <Tab.Pane eventKey="revenue">
                <RevenuePanel />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;

// Products manager component
const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0, stock: 0, category: 'fruit', imageUrl: '', description: '', isActive: true });
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter && categoryFilter !== 'all') params.set('category', categoryFilter);
      if (availabilityFilter && availabilityFilter !== 'all') params.set('availability', availabilityFilter);
      if (sortOrder) params.set('sort', sortOrder === 'oldest' ? 'oldest' : 'newest');
      const qs = params.toString();
      const { data } = await api.get(`/api/products${qs ? `?${qs}` : ''}`);
      setProducts(data);
    } catch (e) {
      console.error('Load products failed', e);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount and whenever filters change
  useEffect(() => { load(); }, [categoryFilter, availabilityFilter, sortOrder]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', price: 0, stock: 0, category: 'fruit', imageUrl: '', description: '', isActive: true });
    setShowModal(true);
  };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, stock: p.stock, category: p.category || 'other', imageUrl: p.imageUrl || '', description: p.description || '', isActive: p.isActive });
    setShowModal(true);
  };
  const save = async () => {
    try {
      if (editing) {
        await api.put(`/api/products/${editing._id}`, form);
      } else {
        await api.post('/api/products', form);
      }
      setShowModal(false);
      await load();
    } catch (e) {
      console.error('Save failed', e);
    }
  };
  const del = async (p) => {
    if (!window.confirm(`Delete product "${p.name}"?`)) return;
    try {
      await api.delete(`/api/products/${p._id}`);
      await load();
    } catch (e) {
      console.error('Delete failed', e);
    }
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Products</Card.Title>
          <div className="d-flex align-items-center">
            <Form.Select size="sm" className="me-2" style={{ width: 160 }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              <option value="fruit">Fruit</option>
              <option value="vegetable">Vegetable</option>
              <option value="other">Other groceries</option>
            </Form.Select>
            <Form.Select size="sm" className="me-2" style={{ width: 160 }} value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
              <option value="all">All availability</option>
              <option value="active">Available</option>
              <option value="inactive">Unavailable</option>
            </Form.Select>
            <Form.Select size="sm" className="me-3" style={{ width: 140 }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </Form.Select>
            <Button onClick={openNew}>Add Product</Button>
          </div>
        </div>
        {loading ? (
          <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Image</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Stock</th>
                  <th>Status</th>
                  <th>Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.category}</td>
                    <td>
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                          onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                        />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-end">₹{Number(p.price).toFixed(2)}</td>
                    <td className="text-end">{p.stock}</td>
                    <td>{p.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="secondary">Inactive</Badge>}</td>
                    <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <ButtonGroup size="sm">
                        <Button variant="outline-primary" onClick={() => openEdit(p)}>Edit</Button>
                        <Button variant="outline-danger" onClick={() => del(p)}>Delete</Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan={8} className="text-center text-muted">No products found</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        )}

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editing ? 'Edit Product' : 'Add Product'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>₹</InputGroup.Text>
                      <Form.Control type="number" min="0" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Stock</Form.Label>
                    <Form.Control type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="fruit">Fruit</option>
                      <option value="vegetable">Vegetable</option>
                      <option value="other">Other groceries</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Availability</Form.Label>
                    <div>
                      <Form.Check
                        type="switch"
                        id="isActiveSwitch"
                        label={form.isActive ? 'Active' : 'Inactive'}
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Image URL</Form.Label>
                <Form.Control value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? 'Update' : 'Create'}</Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

// Users panel component
const UsersPanel = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/admin/users');
      setUsers(data.users || []);
    } catch (e) {
      console.error('Load users failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Users</Card.Title>
        </div>
        {loading ? (
          <div className="d-flex justify-content-center py-5"><Spinner animation="border" /></div>
        ) : (
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th className="text-end">Orders</th>
                  <th className="text-end">Items</th>
                  <th className="text-end">Total Spent</th>
                  <th>Recent Purchases</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><Badge bg={u.role === 'admin' ? 'success' : 'secondary'}>{u.role}</Badge></td>
                    <td className="text-end">{u.orders || 0}</td>
                    <td className="text-end">{u.items || 0}</td>
                    <td className="text-end">₹{Number(u.totalSpent || 0).toFixed(2)}</td>
                    <td>
                      {(u.recentPurchases || []).slice(0, 3).map((r, idx) => (
                        <Badge bg="light" text="dark" key={idx} className="me-1">
                          {r.productName} ×{r.quantity}
                        </Badge>
                      ))}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="text-center text-muted">No users</td></tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

// Revenue management panel
const RevenuePanel = () => {
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState({
    total: 0,
    monthly: [],
    pending: [],
    delivered: {
      totalRevenue: 0,
      orderCount: 0
    }
  });
  const [processing, setProcessing] = useState({});

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      // Load regular revenue data
      const [revenueRes, deliveredRes] = await Promise.all([
        getRevenueStats(),
        getDeliveredOrdersRevenue()
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
    } catch (error) {
      console.error('Failed to load revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRevenue = async (id) => {
    try {
        setProcessing(prev => ({ ...prev, [id]: true }));
      await processRevenue(id);
      await loadRevenueData();
    } catch (error) {
      console.error('Failed to process revenue:', error);
    } finally {
      setProcessing(prev => ({ ...prev, [id]: false }));
    }
  };

  useEffect(() => {
    loadRevenueData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div>
      <Row className="mb-4">
        <Col md={3}>
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
        <Col md={3}>
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
        <Col md={3}>
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
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <Card.Title>Last Month</Card.Title>
              <Card.Text className="display-6 fw-bold">
                {revenueData.monthly.length > 0 
                  ? formatCurrency(revenueData.monthly[0]?.total || 0)
                  : '₹0.00'}
              </Card.Text>
              <div className="text-muted">Revenue from last month</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Pending Revenue</Card.Title>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : revenueData.pending.length > 0 ? (
            <Table hover responsive>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th className="text-end">Amount</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {revenueData.pending.map((item) => (
                  <tr key={item._id}>
                    <td>{item.order?.orderNumber || 'N/A'}</td>
                    <td>{formatDate(item.date)}</td>
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
                          <Spinner size="sm" animation="border" />
                        ) : (
                          'Mark as Processed'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-4">
              No pending revenue records
            </div>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Monthly Revenue</Card.Title>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : revenueData.monthly.length > 0 ? (
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
                  <tr key={`${month._id?.year}-${month._id?.month}`}>
                    <td>
                      {new Date(2000, (month._id?.month || 1) - 1, 1).toLocaleString('default', { month: 'long' })} {month._id?.year}
                    </td>
                    <td className="text-end">{month.count || 0}</td>
                    <td className="text-end">{formatCurrency(month.total || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center text-muted py-4">
              No revenue data available
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

// Reports panel with simple SVG line chart
const ReportsPanel = ({ sales, range, setRange }) => {
  const data = sales || [];
  const chart = useMemo(() => {
    if (!data.length) return { points: '', yMax: 10, yTicks: [0, 5, 10] };
    const yMax = Math.max(...data.map(d => d.revenue)) || 10;
    const pad = 20;
    const w = 700, h = 240;
    const xStep = (w - pad * 2) / Math.max(1, data.length - 1);
    const yScale = (val) => h - pad - (val / (yMax || 1)) * (h - pad * 2);
    const points = data.map((d, i) => `${pad + i * xStep},${yScale(d.revenue)}`).join(' ');
    const yTicks = [0, yMax / 2, yMax];
    return { points, yMax, yTicks, pad, w, h, xStep, yScale };
  }, [data]);

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title className="mb-0">Sales (₹) over time</Card.Title>
          <Form.Select style={{ width: 140 }} value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </Form.Select>
        </div>
        {data.length === 0 ? (
          <div className="text-center text-muted py-5">No sales data yet</div>
        ) : (
          <div className="overflow-auto">
            <svg width={chart.w} height={chart.h} style={{ background: '#fff' }}>
              {/* Axes */}
              <line x1={chart.pad} y1={chart.h - chart.pad} x2={chart.w - chart.pad} y2={chart.h - chart.pad} stroke="#ccc" />
              <line x1={chart.pad} y1={chart.pad} x2={chart.pad} y2={chart.h - chart.pad} stroke="#ccc" />
              {/* Line */}
              <polyline fill="none" stroke="#0d6efd" strokeWidth="2" points={chart.points} />
            </svg>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};
