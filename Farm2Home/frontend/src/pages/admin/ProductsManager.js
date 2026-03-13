import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Badge, Form, Modal, InputGroup, Spinner, ButtonGroup, Row, Col } from 'react-bootstrap';
import api from '../../services/api';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'fruit',
    imageUrl: '',
    description: '',
    isActive: true,
    status: 'pending'
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products');
      setProducts(data);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');
    // Basic frontend validation
    if (!form.name || form.name.trim() === '') {
      setSaveError('Product name is required');
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) {
      setSaveError('Price must be a positive number');
      return;
    }
    const stock = parseInt(form.stock);
    if (isNaN(stock) || stock < 0) {
      setSaveError('Stock must be a non-negative number');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        price,
        stock,
        imageUrl: form.imageUrl,
        category: form.category,
        isActive: !!form.isActive,
        status: form.status
      };

      let res;
      if (editing) {
        res = await api.put(`/api/products/${editing._id}`, payload);
      } else {
        res = await api.post('/api/products', payload);
      }

      setSaveSuccess(editing ? 'Product updated successfully' : 'Product created successfully');
      setShowModal(false);
      // reload list
      await loadProducts();
    } catch (err) {
      console.error('Error saving product:', err);
      const serverMsg = err?.response?.data?.message || err?.message || 'Failed to save product';
      setSaveError(serverMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${id}`);
        await loadProducts();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  return (
    <Card>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <Card.Title>Products</Card.Title>
          <Button onClick={() => {
            setEditing(null);
            setForm({
              name: '',
              price: '',
              stock: '',
              category: 'fruit',
              imageUrl: '',
              description: '',
              isActive: true,
              status: 'pending'
            });
            setShowModal(true);
          }}>Add Product</Button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Visibility</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id} className="align-middle">
                  <td>
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="rounded"
                        style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                        }}
                      />
                    ) : (
                      <div className="bg-light rounded d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}>
                        <small className="text-muted" style={{ fontSize: '0.6rem' }}>No Img</small>
                      </div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.stock}</td>
                  <td>
                    <Badge bg={product.isActive ? 'success' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={
                        product.status === 'approved' ? 'success' :
                          product.status === 'rejected' ? 'danger' : 'warning'
                      }
                      text={product.status === 'pending' ? 'dark' : 'light'}
                    >
                      {product.status || 'pending'}
                    </Badge>
                  </td>
                  <td>
                    <ButtonGroup size="sm">
                      <Button
                        variant="outline-primary"
                        onClick={() => {
                          setEditing(product);
                          setForm({
                            name: product.name,
                            price: product.price,
                            stock: product.stock,
                            category: product.category,
                            imageUrl: product.imageUrl || '',
                            description: product.description || '',
                            isActive: product.isActive,
                            status: product.status || 'pending'
                          });
                          setShowModal(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDelete(product._id)}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Product' : 'Add New Product'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {saveError && (
              <div className="alert alert-danger">{saveError}</div>
            )}
            {saveSuccess && (
              <div className="alert alert-success">{saveSuccess}</div>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="fruit">Fruit</option>
                <option value="vegetable">Vegetable</option>
                <option value="other">Other</option>
              </Form.Select>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Price (₹)</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Image URL</Form.Label>
              <Form.Control
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Approval Status</Form.Label>
                  <Form.Select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Affects visibility to farmers and users.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3 d-flex flex-column justify-content-center h-100 mt-2">
                  <Form.Check
                    type="switch"
                    id="active-switch"
                    label="Active (Visible in Store)"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <Form.Text className="text-muted">
                    Manual override to hide products safely.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" /> Saving...
              </>
            ) : (editing ? 'Update' : 'Create')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default ProductsManager;
