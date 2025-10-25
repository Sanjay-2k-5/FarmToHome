import React from 'react';
import { Container, Alert, Button } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || '/';

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Alert variant="danger" className="text-center w-100" style={{ maxWidth: '600px' }}>
        <h2>Unauthorized Access</h2>
        <p>You don't have permission to access this page.</p>
        <div className="mt-3">
          <Button 
            variant="primary" 
            className="me-2"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            variant="outline-primary" 
            as={Link}
            to="/"
          >
            Go Home
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default Unauthorized;
