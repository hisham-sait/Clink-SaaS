import React, { useState, useEffect } from 'react';
import { UsersService, handleApiError, formatTimeAgo } from '../../../../services/settings';
import type { User } from '../../../../services/settings/types';
import UserModal from '../../sections/users/UserModal';
import InviteUserModal from '../../sections/users/InviteUserModal';
import ViewUserModal from '../../sections/users/ViewUserModal';
import ConfirmModal from '../../sections/users/ConfirmModal';
import { Button, Row, Col, Card, Dropdown, ButtonGroup, Table, Form } from 'react-bootstrap';

const Users: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    buttonText: string;
    buttonClass: string;
    onConfirm: () => Promise<void>;
  }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<User['status'] | 'all'>('all');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await UsersService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleView = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setConfirmAction({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
      buttonText: 'Delete',
      buttonClass: 'btn-danger',
      onConfirm: async () => {
        try {
          await UsersService.deleteUser(user.id);
          await loadUsers();
        } catch (err) {
          setError(handleApiError(err));
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleSuspend = (user: User) => {
    setSelectedUser(user);
    setConfirmAction({
      title: 'Suspend User',
      message: `Are you sure you want to suspend ${user.firstName} ${user.lastName}?`,
      buttonText: 'Suspend',
      buttonClass: 'btn-warning',
      onConfirm: async () => {
        try {
          await UsersService.suspendUser(user.id);
          await loadUsers();
        } catch (err) {
          setError(handleApiError(err));
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleActivate = (user: User) => {
    setSelectedUser(user);
    setConfirmAction({
      title: 'Activate User',
      message: `Are you sure you want to activate ${user.firstName} ${user.lastName}?`,
      buttonText: 'Activate',
      buttonClass: 'btn-success',
      onConfirm: async () => {
        try {
          await UsersService.activateUser(user.id);
          await loadUsers();
        } catch (err) {
          setError(handleApiError(err));
        }
      }
    });
    setShowConfirmModal(true);
  };

  const handleResendInvite = (user: User) => {
    setSelectedUser(user);
    setConfirmAction({
      title: 'Resend Invitation',
      message: `Are you sure you want to resend the invitation to ${user.firstName} ${user.lastName}?`,
      buttonText: 'Resend',
      buttonClass: 'btn-primary',
      onConfirm: async () => {
        try {
          await UsersService.resendInvite(user.id);
          alert('Invitation sent successfully');
        } catch (err) {
          setError(handleApiError(err));
        }
      }
    });
    setShowConfirmModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesRole = !roleFilter || user.roles.some(role => role.name === roleFilter);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Users</h1>
          <p className="text-muted mb-0">Manage users and their access permissions</p>
        </div>
        <div className="d-flex">
          <Button variant="outline-primary" className="me-2" onClick={() => setShowModal(true)}>
            <i className="bi bi-person-plus me-2"></i>
            Add User
          </Button>
          <Button variant="primary" onClick={() => setShowInviteModal(true)}>
            <i className="bi bi-envelope-plus me-2"></i>
            Invite User
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
          <button className="btn btn-link text-danger" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Users</div>
                  <h3 className="mb-0">{users.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-people text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Active Users</div>
                  <h3 className="mb-0">{users.filter(user => user.status === 'Active').length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person-check text-success" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Pending Invites</div>
                  <h3 className="mb-0">{users.filter(user => user.status === 'Pending').length}</h3>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-envelope text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Admins</div>
                  <h3 className="mb-0">
                    {users.filter(user => user.roles.some(role => role.name === 'Super Administrator')).length}
                  </h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-shield-lock text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">All Users</h5>
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="text"
                className="border-start-0"
                placeholder="Search users..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Form.Select
              className="w-auto"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Super Administrator">Super Administrator</option>
              <option value="Administrator">Administrator</option>
              <option value="Billing Administrator">Billing Administrator</option>
              <option value="User Manager">User Manager</option>
            </Form.Select>
            <Form.Select
              className="w-auto"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as User['status'] | 'all')}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Suspended">Suspended</option>
              <option value="Inactive">Inactive</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
          <div className="table-responsive">
            <Table hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">User</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Role</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Plan</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Billing Company</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Last Login</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-person-circle text-secondary"></i>
                        <div>
                          <a href="#" className="text-decoration-none" onClick={(e) => {
                            e.preventDefault();
                            handleView(user);
                          }}>
                            {[user.title, user.firstName, user.lastName].filter(Boolean).join(' ')}
                          </a>
                          <small className="d-block text-muted">{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      {user.roles.map(role => (
                        <span key={role.id} className="badge bg-info me-1">
                          {role.name}
                        </span>
                      ))}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <i className={`bi ${user.plan?.isCustom ? 'bi-gear' : 'bi-box-seam'}`}></i>
                        <span>{user.plan?.name || 'No Plan'}</span>
                      </div>
                    </td>
                    <td>{user.billingCompany?.name || 'Not Set'}</td>
                    <td>
                      <small className="text-muted">
                        {user.lastLogin ? formatTimeAgo(user.lastLogin) : 'Never'}
                      </small>
                    </td>
                    <td>
                      <span className={`badge bg-${UsersService.getUserStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group">
                        <Button
                          variant="link"
                          className="btn-sm text-body px-2"
                          onClick={() => handleEdit(user)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button
                          variant="link"
                          className="btn-sm text-danger px-2"
                          onClick={() => handleDelete(user)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                        <Dropdown as={ButtonGroup}>
                          <Dropdown.Toggle split variant="link" className="btn-sm text-body px-2">
                            <i className="bi bi-three-dots-vertical"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu align="end">
                            {user.status === 'Pending' && (
                              <Dropdown.Item onClick={() => handleResendInvite(user)}>
                                <i className="bi bi-envelope me-2"></i>
                                Resend Invite
                              </Dropdown.Item>
                            )}
                            {user.status === 'Active' ? (
                              <Dropdown.Item onClick={() => handleSuspend(user)}>
                                <i className="bi bi-pause-circle me-2"></i>
                                Suspend User
                              </Dropdown.Item>
                            ) : user.status === 'Suspended' && (
                              <Dropdown.Item onClick={() => handleActivate(user)}>
                                <i className="bi bi-play-circle me-2"></i>
                                Activate User
                              </Dropdown.Item>
                            )}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-muted">
                      <i className="bi bi-info-circle me-2"></i>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          )}
        </Card.Body>
      </Card>

      <UserModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedUser(undefined);
        }}
        user={selectedUser}
        onSuccess={() => {
          loadUsers();
          setShowModal(false);
          setSelectedUser(undefined);
        }}
      />

      <InviteUserModal
        show={showInviteModal}
        onHide={() => setShowInviteModal(false)}
        onSuccess={() => {
          loadUsers();
          setShowInviteModal(false);
        }}
      />

      <ViewUserModal
        show={showViewModal}
        onHide={() => {
          setShowViewModal(false);
          setSelectedUser(undefined);
        }}
        user={selectedUser}
        onEdit={() => {
          setShowViewModal(false);
          setShowModal(true);
        }}
      />

      <ConfirmModal
        show={showConfirmModal && !!confirmAction}
        onHide={() => {
          setShowConfirmModal(false);
          setConfirmAction(undefined);
        }}
        onConfirm={confirmAction?.onConfirm || (() => {})}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmButtonText={confirmAction?.buttonText || ''}
        confirmButtonClass={confirmAction?.buttonClass || ''}
      />
    </div>
  );
};

export default Users;
