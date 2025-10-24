import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Card, Row, Col } from 'react-bootstrap';

const Register = () => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // Default role is 'user'
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register, error } = useAuth();
  const navigate = useNavigate();

  const { fname, lname, email, password, confirmPassword, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!fname.trim()) newErrors.fname = 'First name is required';
    if (!lname.trim()) newErrors.lname = 'Last name is required';
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setLoading(true);
        await register({ fname, lname, email, password, role });
        // Redirect based on role
        if (role === 'farmer') {
          navigate('/farmer/dashboard');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Registration error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Create an Account</h2>
                <p className="text-muted">Join our community today</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="fname">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="fname"
                        value={fname}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        isInvalid={!!errors.fname}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.fname}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="lname">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="lname"
                        value={lname}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        isInvalid={!!errors.lname}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.lname}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    isInvalid={!!errors.password}
                  />
                  <Form.Text className="text-muted">
                    Must be at least 6 characters
                  </Form.Text>
                  <Form.Control.Feedback type="invalid">
                    {errors.password}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="confirmPassword" className="mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={handleChange}
                    isInvalid={!!errors.confirmPassword}
                    placeholder="Confirm your password"
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="role" className="mb-3">
                  <Form.Label>Account Type</Form.Label>
                  <Form.Select 
                    name="role"
                    value={role}
                    onChange={handleChange}
                  >
                    <option value="user">Regular User</option>
                    <option value="farmer">Farmer/Seller</option>
                    <option value="delivery">Delivery Personnel</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select 'Farmer/Seller' to sell products, or 'Delivery Personnel' to deliver orders.
                  </Form.Text>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                      Sign in
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;
