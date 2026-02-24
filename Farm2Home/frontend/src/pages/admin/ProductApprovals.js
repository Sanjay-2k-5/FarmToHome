import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Button, Badge, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { FaCheck, FaTimes, FaEye } from 'react-icons/fa';
import api from '../../services/api';

const ProductApprovals = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPendingProducts();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/admin/products/pending');
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to fetch pending products');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (productId) => {
    try {
      setProcessing(true);
      await api.put(`/api/admin/products/${productId}/status`, { status: 'approved' });
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      setError('Failed to approve product');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setProcessing(true);
      await api.put(`/api/admin/products/${selectedProduct._id}/status`, {
        status: 'rejected',
        rejectionReason
      });
      setProducts(products.filter(p => p._id !== selectedProduct._id));
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (err) {
      setError('Failed to reject product');
      console.error('Error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const openRejectModal = (product) => {
    setSelectedProduct(product);
    setShowRejectModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Product Approvals</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">Pending Product Approvals</h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Farmer</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Date Submitted</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length > 0 ? (
                  products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name}
                              className="rounded me-3"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center me-3" 
                                 style={{ width: '50px', height: '50px' }}>
                              <small>No Image</small>
                            </div>
                          )}
                          <div>
                            <div className="fw-medium">{product.name}</div>
                            <small className="text-muted">{product.description?.substring(0, 50)}{product.description?.length > 50 ? '...' : ''}</small>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        {product.farmer?.name || 'Unknown'}
                        {product.farmer?.email && (
                          <div className="text-muted small">{product.farmer.email}</div>
                        )}
                      </td>
                      <td className="align-middle">
                        <span className="text-capitalize">{product.category}</span>
                      </td>
                      <td className="align-middle fw-bold">${product.price?.toFixed(2)}</td>
                      <td className="align-middle">{product.stock || 0}</td>
                      <td className="align-middle">
                        <div className="small">{formatDate(product.createdAt)}</div>
                      </td>
                      <td className="align-middle">
                        <div className="d-flex gap-2 justify-content-center">
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleApprove(product._id)}
                            disabled={processing}
                            className="d-flex align-items-center"
                          >
                            <FaCheck className="me-1" /> Approve
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => openRejectModal(product)}
                            disabled={processing}
                            className="d-flex align-items-center"
                          >
                            <FaTimes className="me-1" /> Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      <div className="text-muted">No pending products for approval</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Rejection Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reject Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this product:</p>
          <Form.Group className="mb-3">
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </Form.Group>
          {error && <Alert variant="danger">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowRejectModal(false);
              setError('');
            }}
            disabled={processing}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReject}
            disabled={processing || !rejectionReason.trim()}
          >
            {processing ? 'Processing...' : 'Confirm Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ProductApprovals;
