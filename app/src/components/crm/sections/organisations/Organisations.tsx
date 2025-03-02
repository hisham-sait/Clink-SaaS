import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaBuilding, FaCheckCircle, FaTimesCircle, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel, FaStar } from 'react-icons/fa';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { Organisation, Activity } from '../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import OrganisationModal from './OrganisationModal';
import ImportOrganisationModal from './ImportOrganisationModal';

const Organisations: React.FC = () => {
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

  const [organisations, setOrganisations] = useState<Organisation[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedOrganisation, setSelectedOrganisation] = useState<Organisation | undefined>(undefined);

  useEffect(() => {
    fetchOrganisations();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      if (user?.companyId) {
        const activities = await crmService.getActivities(user.companyId, 'organisation');
        setRecentActivities(activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchOrganisations = async () => {
    try {
      setLoading(true);
      if (user?.companyId) {
        const organisations = await crmService.getOrganisations(user.companyId, statusFilter);
        setOrganisations(organisations);
        setError('');
      }
    } catch (err) {
      setError('Failed to load organisations');
      console.error('Error fetching organisations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/crm/organisations/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `organisations.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting organisations:', error);
      alert('Failed to export organisations. Please try again.');
    }
  };

  const handleAddOrganisation = () => {
    setSelectedOrganisation(undefined);
    setShowAddModal(true);
  };

  const handleEditOrganisation = (organisation: Organisation) => {
    setSelectedOrganisation(organisation);
    setShowAddModal(true);
  };

  const handleDeleteOrganisation = async (organisation: Organisation) => {
    if (window.confirm(`Are you sure you want to delete ${organisation.name}? This action cannot be undone.`)) {
      try {
        await api.delete(`/crm/organisations/${user?.companyId}/${organisation.id}`);
        fetchOrganisations();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting organisation:', error);
        alert('Failed to delete organisation. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchOrganisations();
    fetchRecentActivities();
  };

  const renderRating = (rating?: number) => {
    if (!rating) return '-';
    return [...Array(rating)].map((_, i) => (
      <FaStar key={i} className="text-warning" />
    ));
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
      <OrganisationModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        organisation={selectedOrganisation}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportOrganisationModal
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
            <h1 className="h3 mb-0">Organisation Management</h1>
            <p className="text-muted mb-0">Manage and track all your business organisations</p>
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
            <Button variant="primary" onClick={handleAddOrganisation}>
              <FaPlus className="me-2" /> Add Organisation
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
                    <div className="text-muted mb-1">Total Organisations</div>
                    <h3 className="mb-0">{organisations.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaBuilding className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Active Organisations</div>
                    <h3 className="mb-0">{organisations.filter(o => o.status === 'Active').length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaCheckCircle className="text-success" size={24} />
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
                    <h3 className="mb-0">{organisations.filter(o => o.status !== 'Active').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaTimesCircle className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Organisations Table */}
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
                  <th>Industry</th>
                  <th>Type</th>
                  <th>Rating</th>
                  <th>Last Contact</th>
                  <th>Next Follow-up</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {organisations.map((organisation) => (
                  <tr key={organisation.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{organisation.name}</div>
                          <div className="text-muted small">
                            {organisation.email}
                            {organisation.phone && <span className="ms-2">{organisation.phone}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {organisation.industry}
                      {organisation.subIndustry && (
                        <div className="text-muted small">{organisation.subIndustry}</div>
                      )}
                    </td>
                    <td>{organisation.type.join(', ')}</td>
                    <td>{renderRating(organisation.rating)}</td>
                    <td>{organisation.lastContact ? new Date(organisation.lastContact).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : '-'}</td>
                    <td>{organisation.nextFollowUp ? new Date(organisation.nextFollowUp).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : '-'}</td>
                    <td>
                      <Badge bg={
                        organisation.status === 'Active' ? 'success' :
                        organisation.status === 'Inactive' ? 'warning' :
                        'secondary'
                      }>
                        {organisation.status}
                      </Badge>
                    </td>
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditOrganisation(organisation)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteOrganisation(organisation)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {organisations.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaBuilding className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Organisations Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first organisation or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Organisations
                          </Button>
                          <Button variant="primary" onClick={handleAddOrganisation}>
                            <FaPlus className="me-2" /> Add Organisation
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
                {recentActivities.map((activity: Activity, index: number) => (
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

export default Organisations;
