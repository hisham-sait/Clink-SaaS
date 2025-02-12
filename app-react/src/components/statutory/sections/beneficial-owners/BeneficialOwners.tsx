import React, { useState, useEffect } from 'react';
import BeneficialOwnerModal from './BeneficialOwnerModal';
import ImportBeneficialOwnerModal from './ImportBeneficialOwnerModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';

interface BeneficialOwner {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  natureOfControl: string[];
  ownershipPercentage: number;
  registrationDate: string;
  status: 'Active' | 'Inactive' | 'Archived';
  description?: string;
  company?: {
    name: string;
    legalName: string;
  };
}

interface Activity {
  id: string;
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

const BeneficialOwners: React.FC = () => {
  const timelineStyles = {
    timeline: {
      position: 'relative' as const,
      padding: 0,
      margin: 0,
      listStyle: 'none'
    },
    timelineItem: {
      position: 'relative' as const,
      borderLeft: '2px solid #e9ecef',
      marginLeft: '1rem',
      paddingLeft: '1.5rem'
    }
  };

  const [owners, setOwners] = useState<BeneficialOwner[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<BeneficialOwner | undefined>(undefined);

  useEffect(() => {
    fetchOwners();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=beneficial-owner&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/beneficial-owners/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setOwners(response.data);
      } else {
        setOwners([]);
        console.error('Expected array of beneficial owners but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load beneficial owners');
      console.error('Error fetching beneficial owners:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/beneficial-owners/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `beneficial-owners.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting beneficial owners:', error);
      alert('Failed to export beneficial owners. Please try again.');
    }
  };

  const handleAddOwner = () => {
    setSelectedOwner(undefined);
    setShowAddModal(true);
  };

  const handleEditOwner = (owner: BeneficialOwner) => {
    setSelectedOwner(owner);
    setShowAddModal(true);
  };

  const handleDeleteOwner = async (owner: BeneficialOwner) => {
    if (window.confirm(`Are you sure you want to delete ${owner.firstName} ${owner.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/beneficial-owners/${user?.companyId}/${owner.id}`);
        fetchOwners();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting beneficial owner:', error);
        alert('Failed to delete beneficial owner. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchOwners();
    fetchRecentActivities();
  };

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <BeneficialOwnerModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        owner={selectedOwner}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportBeneficialOwnerModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-2">Beneficial Owners Register</h1>
            <p className="text-muted mb-0">Record and manage company beneficial owners and their ownership details</p>
          </div>
          <div className="d-flex gap-2">
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary" id="export-dropdown" className="d-inline-flex align-items-center gap-2">
                <i className="bi bi-download"></i>
                <span>Export</span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('pdf')} className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-pdf"></i>
                  <span>Export as PDF</span>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('excel')} className="d-flex align-items-center gap-2">
                  <i className="bi bi-file-excel"></i>
                  <span>Export as Excel</span>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-primary" className="d-inline-flex align-items-center gap-2" onClick={() => setShowImportModal(true)}>
              <i className="bi bi-upload"></i>
              <span>Import</span>
            </Button>
            <Button variant="primary" className="d-inline-flex align-items-center gap-2" onClick={handleAddOwner}>
              <i className="bi bi-plus-lg"></i>
              <span>Add Beneficial Owner</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Total Beneficial Owners</span>
                    <h3 className="mb-0">{owners.length}</h3>
                    <small className="text-muted">All registered owners</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <i className="bi bi-people fs-4 text-primary"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Active Owners</span>
                    <h3 className="mb-0">{owners.filter(o => o.status === 'Active').length}</h3>
                    <small className="text-muted">Currently active owners</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <i className="bi bi-person-check fs-4 text-success"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted">Inactive/Archived</span>
                    <h3 className="mb-0">{owners.filter(o => o.status !== 'Active').length}</h3>
                    <small className="text-muted">Inactive or archived owners</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <i className="bi bi-person-dash fs-4 text-secondary"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Beneficial Owners Table */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <h5 className="mb-0">All Beneficial Owners</h5>
              <div className="d-flex gap-2">
                <div className="input-group">
                  <span className="input-group-text border-end-0 bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search owners..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="form-select w-auto"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive' | 'Archived')}
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-uppercase small fw-semibold text-secondary">Name</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Nature of Control</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Ownership %</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Registration Date</th>
                  <th className="text-uppercase small fw-semibold text-secondary">Status</th>
                  {user?.role === 'super_admin' && <th className="text-uppercase small fw-semibold text-secondary">Company</th>}
                  <th className="text-uppercase small fw-semibold text-secondary text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((owner) => (
                  <tr key={owner.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{`${owner.title} ${owner.firstName} ${owner.lastName}`}</div>
                          <div className="text-muted small">{owner.nationality}</div>
                        </div>
                      </div>
                    </td>
                    <td>{owner.natureOfControl.join(', ')}</td>
                    <td>{owner.ownershipPercentage}%</td>
                    <td>{new Date(owner.registrationDate).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</td>
                    <td>
                      <Badge bg={
                        owner.status === 'Active' ? 'success' :
                        owner.status === 'Inactive' ? 'warning' :
                        'secondary'
                      }>
                        {owner.status}
                      </Badge>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td>{owner.company?.name || owner.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <div className="btn-group">
                        <button
                          className="btn btn-link btn-sm text-body px-2"
                          onClick={() => handleEditOwner(owner)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-link btn-sm text-danger px-2"
                          onClick={() => handleDeleteOwner(owner)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'super_admin' ? 7 : 6} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaUsers className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Beneficial Owners Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first beneficial owner or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Beneficial Owners
                          </Button>
                          <Button variant="primary" onClick={handleAddOwner}>
                            <FaPlus className="me-2" /> Add Beneficial Owner
                          </Button>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* Recent Activities */}
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                <i className="bi bi-clock-history me-2"></i>
                Recent Activities
              </h5>
            </div>
            {activitiesLoading ? (
              <div className="text-center py-4">
                <div className="spinner-border spinner-border-sm text-primary"></div>
                <p className="text-muted small mt-2 mb-0">Loading activities...</p>
              </div>
            ) : recentActivities.length > 0 ? (
              <div style={timelineStyles.timeline}>
                {recentActivities.map((activity, index) => (
                  <div key={index} style={timelineStyles.timelineItem} className="pb-3">
                    <div className="d-flex">
                      <div className="me-3">
                        <Badge bg="light" className="p-2">
                          {activity.type === 'added' ? (
                            <i className="bi bi-plus-circle text-success"></i>
                          ) : activity.type === 'updated' ? (
                            <i className="bi bi-pencil text-primary"></i>
                          ) : activity.type === 'removed' ? (
                            <i className="bi bi-trash text-danger"></i>
                          ) : (
                            <i className="bi bi-pencil text-primary"></i>
                          )}
                        </Badge>
                      </div>
                      <div>
                        <p className="mb-0">{activity.description}</p>
                        <small className="text-muted">
                          {new Date(activity.time).toLocaleString('en-IE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted mb-0">No recent activities</p>
            )}
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default BeneficialOwners;
