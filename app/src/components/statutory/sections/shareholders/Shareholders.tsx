import React, { useState, useEffect } from 'react';
import ShareholderModal from './ShareholderModal';
import ImportShareholderModal from './ImportShareholderModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaUsers, FaUserCheck, FaUserMinus, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';

import { Shareholder, Activity } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '@bradan/shared';

const Shareholders: React.FC = () => {
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

  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState<Shareholder | undefined>(undefined);

  useEffect(() => {
    fetchShareholders();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=shareholder&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchShareholders = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/shareholders/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setShareholders(response.data);
      } else {
        setShareholders([]);
        console.error('Expected array of shareholders but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load shareholders');
      console.error('Error fetching shareholders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/shareholders/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shareholders.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting shareholders:', error);
      alert('Failed to export shareholders. Please try again.');
    }
  };

  const handleAddShareholder = () => {
    setSelectedShareholder(undefined);
    setShowAddModal(true);
  };

  const handleEditShareholder = (shareholder: Shareholder) => {
    setSelectedShareholder(shareholder);
    setShowAddModal(true);
  };

  const handleDeleteShareholder = async (shareholder: Shareholder) => {
    if (window.confirm(`Are you sure you want to delete ${shareholder.firstName} ${shareholder.lastName}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/shareholders/${user?.companyId}/${shareholder.id}`);
        fetchShareholders();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting shareholder:', error);
        alert('Failed to delete shareholder. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchShareholders();
    fetchRecentActivities();
  };

  const getTotalOrdinaryShares = () => {
    return shareholders.reduce((sum, s) => sum + (s.ordinaryShares || 0), 0);
  };

  const getTotalPreferentialShares = () => {
    return shareholders.reduce((sum, s) => sum + (s.preferentialShares || 0), 0);
  };

  const getTotalShares = () => {
    return getTotalOrdinaryShares() + getTotalPreferentialShares();
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
      <ShareholderModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        shareholder={selectedShareholder}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportShareholderModal
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
            <h1 className="h3 mb-0">Shareholders Register</h1>
            <p className="text-muted mb-0">Record and manage company shareholders and their holdings</p>
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
            <Button variant="primary" onClick={handleAddShareholder}>
              <FaPlus className="me-2" /> Add Shareholder
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
          <Col md={3}>
            <Card className="h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted mb-1">Active Shareholders</div>
                    <h3 className="mb-0">{shareholders.filter(s => s.status === 'Active').length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaUsers className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Ordinary Shares</div>
                    <h3 className="mb-0">{getTotalOrdinaryShares()}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaUserCheck className="text-success" size={24} />
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
                    <div className="text-muted mb-1">Preferential Shares</div>
                    <h3 className="mb-0">{getTotalPreferentialShares()}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaUserCheck className="text-info" size={24} />
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
                    <div className="text-muted mb-1">Total Shares</div>
                    <h3 className="mb-0">{getTotalShares()}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaUserMinus className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Shareholders Table */}
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
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Ordinary Shares</th>
                  <th>Preferential Shares</th>
                  <th>Total Shares</th>
                  <th>Date Acquired</th>
                  <th>Status</th>
                  {user?.roles?.includes('super_admin') && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shareholders.map((shareholder) => (
                  <tr key={shareholder.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{`${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`}</div>
                          <div className="text-muted small">{shareholder.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{shareholder.ordinaryShares}</td>
                    <td>{shareholder.preferentialShares}</td>
                    <td>{shareholder.ordinaryShares + shareholder.preferentialShares}</td>
                    <td>{formatDDMMYYYY(new Date(shareholder.dateAcquired))}</td>
                    <td>
                      <Badge bg={shareholder.status === 'Active' ? 'success' : 'secondary'}>
                        {shareholder.status}
                      </Badge>
                    </td>
                    {user?.roles?.includes('super_admin') && (
                      <td>{shareholder.company?.name || shareholder.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditShareholder(shareholder)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteShareholder(shareholder)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {shareholders.length === 0 && (
                  <tr>
                    <td colSpan={user?.roles?.includes('super_admin') ? 8 : 7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaUsers className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Shareholders Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first shareholder or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Shareholders
                          </Button>
                          <Button variant="primary" onClick={handleAddShareholder}>
                            <FaPlus className="me-2" /> Add Shareholder
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
                          {formatDDMMYYYY(new Date(activity.time))}
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

export default Shareholders;
