import React, { useState, useEffect } from 'react';
import BeneficialOwnerModal from './BeneficialOwnerModal';
import ImportBeneficialOwnerModal from './ImportBeneficialOwnerModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaUsers, FaUserCheck, FaUserMinus, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';

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
      <div className="container-fluid py-4">
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
            <h1 className="h3 mb-0">Beneficial Owners Register</h1>
            <p className="text-muted mb-0">Record and manage company beneficial owners and their ownership details</p>
          </div>
          <div className="d-flex">
            <Dropdown className="me-2">
              <Dropdown.Toggle variant="outline-primary" id="export-dropdown">
                <FaFileExport className="me-2" /> Export
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => handleExport('pdf')}>
                  <FaFilePdf className="me-2" /> Export as PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleExport('excel')}>
                  <FaFileExcel className="me-2" /> Export as Excel
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
              <FaFileImport className="me-2" /> Import
            </Button>
            <Button variant="primary" onClick={handleAddOwner}>
              <FaPlus className="me-2" /> Add Beneficial Owner
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
                    <div className="text-muted mb-1">Total Beneficial Owners</div>
                    <h3 className="mb-0">{owners.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaUsers className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Active Owners</div>
                    <h3 className="mb-0">{owners.filter(o => o.status === 'Active').length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaUserCheck className="text-success" size={24} />
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
                    <div className="text-muted mb-1">Inactive/Archived</div>
                    <h3 className="mb-0">{owners.filter(o => o.status !== 'Active').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaUserMinus className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Beneficial Owners Table */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-end mb-3">
              <div className="btn-group">
                <Button
                  variant={statusFilter === 'All' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('All')}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === 'Active' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Active')}
                >
                  Active
                </Button>
                <Button
                  variant={statusFilter === 'Inactive' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Inactive')}
                >
                  Inactive
                </Button>
                <Button
                  variant={statusFilter === 'Archived' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Archived')}
                >
                  Archived
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Nature of Control</th>
                  <th>Ownership %</th>
                  <th>Registration Date</th>
                  <th>Status</th>
                  {user?.role === 'super_admin' && <th>Company</th>}
                  <th className="text-end">Actions</th>
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
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditOwner(owner)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteOwner(owner)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
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
                <FaClock className="me-2" />
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
                            <FaPlus className="text-success" />
                          ) : activity.type === 'updated' ? (
                            <FaEdit className="text-primary" />
                          ) : activity.type === 'removed' ? (
                            <FaTrash className="text-danger" />
                          ) : (
                            <FaEdit className="text-primary" />
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
