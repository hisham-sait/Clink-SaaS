import React, { useState, useEffect } from 'react';
import DirectorModal from './DirectorModal';
import ResignDirectorModal from './ResignDirectorModal';
import ImportDirectorModal from './ImportDirectorModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaSignOutAlt, FaFileImport, FaUsers, FaUserCheck, FaUserMinus, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Director {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: 'Active' | 'Resigned';
  company?: {
    name: string;
    legalName: string;
  };
}

interface Activity {
  id: string;
  type: 'appointment' | 'update' | 'resignation' | 'deletion';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

const Directors: React.FC = () => {
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

  const [directors, setDirectors] = useState<Director[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Resigned'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showResignModal, setShowResignModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedDirector, setSelectedDirector] = useState<Director | undefined>(undefined);

  useEffect(() => {
    fetchDirectors();
    fetchRecentActivities();
  }, [statusFilter]); // Refresh when status filter changes

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=director&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchDirectors = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/directors/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setDirectors(response.data);
      } else {
        setDirectors([]);
        console.error('Expected array of directors but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load directors');
      console.error('Error fetching directors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/directors/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `directors.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting directors:', error);
      alert('Failed to export directors. Please try again.');
    }
  };

  const handleAddDirector = () => {
    setSelectedDirector(undefined);
    setShowAddModal(true);
  };

  const handleEditDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowAddModal(true);
  };

  const handleResignDirector = (director: Director) => {
    setSelectedDirector(director);
    setShowResignModal(true);
  };

  const handleDeleteDirector = async (director: Director) => {
    if (window.confirm(`Are you sure you want to delete ${director.firstName} ${director.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/directors/${user?.companyId}/${director.id}`);
        fetchDirectors();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting director:', error);
        alert('Failed to delete director. Please try again.');
      }
    }
  };

  const handleConfirmResign = async (resignationDate: string) => {
    try {
      await api.post(`/statutory/directors/${user?.companyId}/${selectedDirector?.id}/resign`, {
        resignationDate
      });
      setShowResignModal(false);
      fetchDirectors();
      fetchRecentActivities();
    } catch (err) {
      setError('Failed to resign director');
      console.error('Error resigning director:', err);
    }
  };

  const handleModalSuccess = () => {
    fetchDirectors();
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
      <DirectorModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        director={selectedDirector}
        onSuccess={handleModalSuccess}
      />
      {selectedDirector && (
        <ResignDirectorModal
          show={showResignModal}
          onHide={() => setShowResignModal(false)}
          director={selectedDirector}
          onConfirm={handleConfirmResign}
        />
      )}
      {user?.companyId && (
        <ImportDirectorModal
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
            <h1 className="h3 mb-0">Directors & Secretaries</h1>
            <p className="text-muted mb-0">Record and manage company directors, secretaries and their details</p>
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
            <Button variant="primary" onClick={handleAddDirector}>
              <FaPlus className="me-2" /> Add Director
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
                    <div className="text-muted mb-1">Total Directors</div>
                    <h3 className="mb-0">{directors.length}</h3>
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
                    <div className="text-muted mb-1">Active Directors</div>
                    <h3 className="mb-0">{directors.filter(d => d.status === 'Active').length}</h3>
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
                    <div className="text-muted mb-1">Resigned Directors</div>
                    <h3 className="mb-0">{directors.filter(d => d.status === 'Resigned').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaUserMinus className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Directors Table */}
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
                  variant={statusFilter === 'Resigned' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Resigned')}
                >
                  Resigned
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Appointment Date</th>
                  <th>Status</th>
                  {user?.roles.includes('Super Admin') && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {directors.map((director) => (
                  <tr key={director.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{`${director.title} ${director.firstName} ${director.lastName}`}</div>
                          <div className="text-muted small">{director.occupation}</div>
                        </div>
                      </div>
                    </td>
                    <td>{director.directorType}</td>
                    <td>{new Date(director.appointmentDate).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</td>
                    <td>
                      <Badge bg={director.status === 'Active' ? 'success' : 'secondary'}>
                        {director.status}
                      </Badge>
                    </td>
                    {user?.roles.includes('Super Admin') && (
                      <td>{director.company?.name || director.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditDirector(director)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      {director.status === 'Active' && (
                        <>
                          <Button
                            variant="link"
                            className="p-0 me-3"
                            onClick={() => handleResignDirector(director)}
                          >
                            <FaSignOutAlt className="text-danger" />
                          </Button>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() => handleDeleteDirector(director)}
                          >
                            <FaTrash className="text-danger" />
                          </Button>
                        </>
                      )}
                      {director.status === 'Resigned' && (
                        <Button
                          variant="link"
                          className="p-0"
                          onClick={() => handleDeleteDirector(director)}
                        >
                          <FaTrash className="text-danger" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {directors.length === 0 && (
                  <tr>
                    <td colSpan={user?.roles.includes('Super Admin') ? 6 : 5} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaUsers className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Directors Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first director or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Directors
                          </Button>
                          <Button variant="primary" onClick={handleAddDirector}>
                            <FaPlus className="me-2" /> Add Director
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
                          {activity.type === 'appointment' ? (
                            <FaPlus className="text-success" />
                          ) : activity.type === 'update' ? (
                            <FaEdit className="text-primary" />
                          ) : activity.type === 'resignation' ? (
                            <FaSignOutAlt className="text-danger" />
                          ) : activity.type === 'deletion' ? (
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

export default Directors;
