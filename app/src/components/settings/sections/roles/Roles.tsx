import React, { useState, useEffect } from 'react';
import { RolesService, handleApiError, formatDateShort } from '../../../../services/settings';
import type { Role } from '../../../../services/settings/roles';
import RoleModal from './RoleModal';
import { Button, Card, Row, Col, Badge, Table, Form, Dropdown, ButtonGroup } from 'react-bootstrap';

const Roles: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'system' | 'custom'>('all');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await RolesService.getRoles();
      setRoles(data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleEdit = (role: Role) => {
    if (role.isSystem) return;
    setSelectedRole(role);
    setShowModal(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem || (role.userCount || 0) > 0) return;
    
    if (!window.confirm(`Are you sure you want to delete the ${role.name} role?`)) {
      return;
    }

    try {
      await RolesService.deleteRole(role.id);
      await loadRoles();
    } catch (err) {
      setError(handleApiError(err));
    }
  };

  const filteredRoles = roles.filter(role => {
    const matchesSearch = (
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (role.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesType = typeFilter === 'all' || 
      (typeFilter === 'system' && role.isSystem) || 
      (typeFilter === 'custom' && !role.isSystem);
    return matchesSearch && matchesType;
  });

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Roles</h1>
          <p className="text-muted mb-0">Manage roles and their permissions</p>
        </div>
        <Button 
          variant="primary"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-shield-plus"></i>
          <span>Add Role</span>
        </Button>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Roles</div>
                  <h3 className="mb-0">{roles.length}</h3>
                  <small className="text-muted">All roles</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-shield text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Active Roles</div>
                  <h3 className="mb-0">{roles.filter(r => r.status === 'Active').length}</h3>
                  <small className="text-muted">Currently active roles</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-shield-check text-success" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">Custom Roles</div>
                  <h3 className="mb-0">{roles.filter(r => r.isCustom).length}</h3>
                  <small className="text-muted">User-defined roles</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-shield-plus text-primary" style={{ fontSize: '24px' }}></i>
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
                  <div className="text-muted mb-1">System Roles</div>
                  <h3 className="mb-0">{roles.filter(r => r.isSystem).length}</h3>
                  <small className="text-muted">Built-in roles</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-shield-lock text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3">
          <h5 className="mb-0">All Roles</h5>
          <div className="d-flex gap-2">
            <div className="input-group">
              <span className="input-group-text border-end-0 bg-white">
                <i className="bi bi-search text-muted"></i>
              </span>
              <Form.Control
                type="text"
                className="border-start-0"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Form.Select
              className="w-auto"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as 'all' | 'system' | 'custom')}
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="custom">Custom</option>
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
                    <th className="text-uppercase small fw-semibold text-secondary">Role</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Scope</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Permissions</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Users</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                    <th className="text-uppercase small fw-semibold text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map(role => (
                    <tr key={role.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <i className={`bi ${role.isSystem ? 'bi-shield-lock' : 'bi-shield'} ${role.isSystem ? 'text-primary' : 'text-secondary'}`}></i>
                          <div>
                            <span>{RolesService.formatRoleName(role)}</span>
                            <small className="d-block text-muted">{role.description || '-'}</small>
                          </div>
                        </div>
                      </td>
                      <td>{RolesService.formatRoleScope(role.scope)}</td>
                      <td>{role.permissions.length}</td>
                      <td>
                        <span className="text-muted">
                          {role.userCount || 0}
                        </span>
                      </td>
                      <td>
                        <Badge bg={RolesService.getRoleStatusBadgeColor(role.status)}>
                          {role.status}
                        </Badge>
                      </td>
                      <td className="text-end position-relative">
                        <ButtonGroup style={{ position: 'static' }}>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-body px-2"
                            onClick={() => handleEdit(role)}
                            disabled={role.isSystem}
                            title={role.isSystem ? 'System roles cannot be modified' : 'Edit role'}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger px-2"
                            onClick={() => handleDelete(role)}
                            disabled={role.isSystem || (role.userCount || 0) > 0}
                            title={
                              role.isSystem ? 'System roles cannot be deleted' :
                              (role.userCount || 0) > 0 ? 'Cannot delete role with assigned users' :
                              'Delete role'
                            }
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                          {!role.isSystem && (
                            <div className="dropdown">
                              <button
                                type="button"
                                className="btn btn-link btn-sm text-body px-2"
                                onClick={() => setOpenDropdownId(openDropdownId === role.id ? null : role.id)}
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>
                              {openDropdownId === role.id && (
                                <div className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', zIndex: 1000 }}>
                                  <button
                                    type="button"
                                    className="dropdown-item"
                                    onClick={() => {
                                      handleEdit(role);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <i className="bi bi-pencil me-2"></i>
                                    Edit Role
                                  </button>
                                  <button
                                    type="button"
                                    className={`dropdown-item text-danger ${(role.userCount || 0) > 0 ? 'disabled' : ''}`}
                                    onClick={() => {
                                      handleDelete(role);
                                      setOpenDropdownId(null);
                                    }}
                                  >
                                    <i className="bi bi-trash me-2"></i>
                                    Delete Role
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                  {filteredRoles.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        <i className="bi bi-info-circle me-2"></i>
                        No roles found
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <RoleModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setSelectedRole(undefined);
        }}
        role={selectedRole}
        onSuccess={() => {
          loadRoles();
          setShowModal(false);
          setSelectedRole(undefined);
        }}
      />
    </div>
  );
};

export default Roles;
