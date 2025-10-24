import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">Please log in to view this page.</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h1>Welcome, {user.fname}!</h1>
            <Button variant="outline-danger" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          {isAdmin() && (
            <div className="mt-2">
              <span className="badge bg-success">Admin</span>
            </div>
          )}
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title>Profile Information</Card.Title>
              <Card.Text>
                <strong>Name:</strong> {user.fname} {user.lname}<br />
                <strong>Email:</strong> {user.email}<br />
                <strong>Role:</strong> {user.role}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>Quick Actions</Card.Title>
              <div className="d-grid gap-2">
                <Button variant="outline-primary">View Profile</Button>
                <Button variant="outline-secondary">Edit Profile</Button>
                {isAdmin() && (
                  <Button variant="outline-success">Admin Dashboard</Button>
                )}
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body>
              <Card.Title>Recent Activity</Card.Title>
              <Card.Text>
                Welcome to your dashboard! You can start by updating your profile or exploring the features available to you.
                {isAdmin() && (
                  <span> As an admin, you have access to additional features.</span>
                )}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
