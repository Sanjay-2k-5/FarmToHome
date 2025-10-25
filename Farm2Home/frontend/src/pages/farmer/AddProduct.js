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
    category: 'fruits',
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const { name, description, price, stock, category, image } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file
      });
      setPreview(URL.createObjectURL(file));
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
      const formDataToSend = new FormData();
      
      // Append all form fields
      formDataToSend.append('name', name.trim());
      formDataToSend.append('description', description.trim());
      formDataToSend.append('price', parseFloat(price));
      formDataToSend.append('stock', parseInt(stock, 10));
      formDataToSend.append('category', category);
      
      // Append the image file if it exists
      if (image) {
        formDataToSend.append('image', image);
      }

      console.log('Form data being sent:', {
        name: name.trim(),
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        category,
        hasImage: !!image
      });

      const response = await api.post('/api/farmer/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      
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
                    <option value="fruits">Fruits</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="other_groceries">Other Groceries</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Product Image</Form.Label>
                  <div className="border rounded p-3 text-center">
                    {preview ? (
                      <img 
                        src={preview} 
                        alt="Preview" 
                        className="img-fluid mb-3" 
                        style={{ maxHeight: '200px' }}
                      />
                    ) : (
                      <div className="py-5 text-muted">
                        <FaUpload size={48} className="mb-2" />
                        <p>Upload a product image</p>
                      </div>
                    )}
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="d-none"
                      id="product-image"
                    />
                    <Button 
                      variant="outline-primary" 
                      onClick={() => document.getElementById('product-image').click()}
                    >
                      {preview ? 'Change Image' : 'Choose Image'}
                    </Button>
                  </div>
                </Form.Group>
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
