import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Form, Button, Alert, Card, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user', // user, admin, farmer, delivery
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAdmin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, role } = formData;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // If already authenticated, redirect to appropriate page
  useEffect(() => {
    // Only redirect if we have a user and they're not already on the correct page
    if (user && isAuthenticated && typeof isAuthenticated === 'function' && isAuthenticated()) {
      const currentPath = window.location.pathname;
      const userRole = user?.role || role;
      
      // Don't redirect if we're already on the correct page
      if (
        (userRole === 'admin' && currentPath.startsWith('/admin')) ||
        (userRole === 'farmer' && currentPath.startsWith('/farmer')) ||
        (userRole === 'delivery' && currentPath.startsWith('/delivery')) ||
        (userRole === 'user' && currentPath === '/home')
      ) {
        return;
      }
      
      // Only navigate if we're not already navigating
      switch(userRole) {
        case 'admin':
          navigate('/admin/dashboard', { replace: true });
          break;
        case 'farmer':
          navigate('/farmer/dashboard', { replace: true });
          break;
        case 'delivery':
          navigate('/delivery/dashboard', { replace: true });
          break;
        case 'user':
        default:
          navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const { success, user: loggedInUser, error: loginError } = await login({ 
        email: email.trim(), 
        password: password.trim(),
        role 
      });
      
      if (success && loggedInUser) {
        // The navigation will be handled by the useEffect above
        console.log('Login successful, waiting for redirect...');
      } else {
        setError(loginError || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', {
        error: err,
        response: err.response?.data
      });
      setError(err.response?.data?.message || 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <Row className="w-100 justify-content-center px-3">
        <Col md={6} lg={4} className="px-0">
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <h2>Login</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Password</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      minLength={6}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="role">
                  <Form.Label>Login as</Form.Label>
                  <Form.Select name="role" value={role} onChange={handleChange}>
                    <option value="user">User</option>
                    <option value="farmer">Farmer</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>

                <div className="text-center">
                  <p className="mb-0">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">
                      Register here
                    </Link>
                  </p>
                  <Link to="/forgot-password" className="text-muted small">
                    Forgot password?
                  </Link>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
