import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUpload } from 'react-icons/fa';
import api from '../../services/api';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    // Use category values that match backend enums: 'fruit','vegetable','other'
    category: 'fruit',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const { name, description, price, stock, category, imageUrl } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({
      ...formData,
      imageUrl: url
    });
    // Update preview if URL is valid
    if (url) {
      setPreview(url);
    } else {
      setPreview('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!name || !price || !stock || !category) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const parsedPrice = parseFloat(price);
      const parsedStock = parseInt(stock, 10);

      if (isNaN(parsedPrice) || isNaN(parsedStock)) {
        setError('Price and stock must be valid numbers');
        setLoading(false);
        return;
      }

      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: parsedPrice,
        stock: parsedStock,
        category: category,
        imageUrl: imageUrl.trim()
      };

      console.log('Form data being sent:', payload);

      const response = await api.post('/api/farmer/products', payload);

      if (response.data.success) {
        // Show success message and redirect to products page
        alert('Product submitted for admin approval');
        navigate('/farmer/products');
      } else {
        setError(response.data.message || 'Failed to add product. Please try again.');
      }
    } catch (err) {
      console.error('Error adding product:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.message || 'Failed to add product. Please check your input and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Button
        variant="outline-secondary"
        className="mb-3 d-flex align-items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <FaArrowLeft /> Back to Products
      </Button>

      <Card className="shadow-sm">
        <Card.Header className="bg-white py-3">
          <h4 className="mb-0">Add New Product</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (₹) *</Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={price}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                        placeholder="0.00"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock *</Form.Label>
                      <Form.Control
                        type="number"
                        name="stock"
                        value={stock}
                        onChange={handleChange}
                        min="0"
                        required
                        placeholder="0"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={category}
                    onChange={handleChange}
                    required
                  >
                    <option value="fruit">Fruits</option>
                    <option value="vegetable">Vegetables</option>
                    <option value="other">Other Groceries</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    name="imageUrl"
                    value={imageUrl}
                    onChange={handleImageUrlChange}
                    placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                  />
                  <small className="text-muted d-block mt-2">
                    Provide a direct URL to your product image
                  </small>
                </Form.Group>
                {preview && (
                  <div className="border rounded p-3 text-center mb-3">
                    <img
                      src={preview}
                      alt="Preview"
                      className="img-fluid"
                      style={{ maxHeight: '200px' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/200?text=Invalid+Image';
                      }}
                    />
                    <small className="text-muted d-block mt-2">Image Preview</small>
                  </div>
                )}
              </Col>
            </Row>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button
                variant="outline-secondary"
                onClick={() => navigate('/farmer/products')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Product'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddProduct;
