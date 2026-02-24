import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Spinner, Form } from 'react-bootstrap';
import api from '../../services/api';

const UsersPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([
    { value: 'user', label: 'User', color: 'secondary' },
    { value: 'farmer', label: 'Farmer', color: 'success' },
    { value: 'vendor', label: 'Vendor', color: 'primary' },
    { value: 'delivery', label: 'Delivery', color: 'info' },
    { value: 'admin', label: 'Admin', color: 'danger' }
  ]);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedUser, setEditedUser] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(false);

  const getRoleInfo = (roleValue) => {
    const role = roles.find(r => r.value === roleValue);
    return role || { value: roleValue, label: roleValue, color: 'light' };
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/admin/users');
      const usersData = response.data?.users || response.data || [];
      
      // Use role value directly from the backend user document.
      // Do not coerce unknown roles to 'user' here — let getRoleInfo handle unknown labels/colors.
      const processedUsers = usersData.map(user => ({
        ...user,
        role: user.role || 'user',
        fname: user.fname || user.name?.split(' ')[0] || 'User',
        lname: user.lname || user.name?.split(' ').slice(1).join(' ') || ''
      }));
      
      setUsers(processedUsers);
    } catch (err) {
      console.error('Error loading users:', {
        error: err,
        response: err.response?.data
      });
      setError('Failed to load users. Please try again.');
      setUsers([]); // Ensure users is always an array
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles from the backend
  const fetchRoles = async () => {
    setLoadingRoles(true);
    try {
      const response = await api.get('/api/admin/roles');
      if (response.data && Array.isArray(response.data)) {
        setRoles(response.data);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      // Keep the default roles if API fails
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadUsers();
    fetchRoles();
  }, []);

  const handleEditClick = (user) => {
    setEditingId(user._id);
    setEditedUser({
      role: user.role,
      isActive: user.isActive
    });
  };

  const handleSaveChanges = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}`, editedUser);
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, ...editedUser } 
          : user
      ));
      setEditingId(null);
      setEditedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Failed to update user. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedUser(null);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/api/admin/users/${userId}`, { 
        isActive: newStatus 
      });
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isActive: newStatus } 
          : user
      ));
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  const getUserRoleBadge = (role) => {
    const roleInfo = getRoleInfo(role);
    return <Badge bg={roleInfo.color} className="text-capitalize">{roleInfo.label}</Badge>;
  };

  const handleRoleChange = (e) => {
    setEditedUser({
      ...editedUser,
      role: e.target.value
    });
  };

  if (loadingRoles) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" />
        <span className="ms-2">Loading roles...</span>
      </div>
    );
  }

  return (
    <Card>
      <Card.Body>
        <Card.Title>Users Management</Card.Title>
        
        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th style={{ width: '35%' }}>User</th>
                  <th style={{ width: '40%' }}>Email</th>
                  <th style={{ width: '25%' }}>Role {editingId && <span className="text-muted small">(editing)</span>}</th>
                </tr>
              </thead>
              <tbody>
                {users && users.length > 0 ? (
                  users.map(user => (
                    <tr key={user._id} className="align-middle">
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="avatar-sm bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '36px', height: '36px' }}>
                            <span className="text-dark fw-bold">
                              {user.fname?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="fw-medium">{user.fname} {user.lname}</div>
                            <div className="text-muted small">ID: {user._id?.substring(0, 8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div className="text-truncate" style={{ maxWidth: '300px' }} title={user.email}>
                          {user.email}
                        </div>
                      </td>
                      <td className="align-middle">
                        {editingId === user._id ? (
                          <Form.Select 
                            size="sm" 
                            value={editedUser.role} 
                            onChange={handleRoleChange}
                            style={{ width: 'auto', display: 'inline-block' }}
                          >
                            {roles.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </Form.Select>
                        ) : (
                          <div className="d-flex align-items-center">
                            {getUserRoleBadge(user.role)}
                            <button 
                              className="btn btn-link btn-sm ms-2 p-0"
                              onClick={() => handleEditClick(user)}
                              title="Edit role"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-3">
                      {loading ? 'Loading users...' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default UsersPanel;
