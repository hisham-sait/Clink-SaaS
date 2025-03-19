import React, { useState, useEffect } from 'react';
import AllotmentModal from './AllotmentModal';
import ImportAllotmentModal from './ImportAllotmentModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaShareAlt, FaCheckCircle, FaTimesCircle, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';

import { Allotment, Activity } from '../../../../services/statutory/types';

const Allotments: React.FC = () => {
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

  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Cancelled'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedAllotment, setSelectedAllotment] = useState<Allotment | undefined>(undefined);

  useEffect(() => {
    fetchAllotments();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=allotment&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchAllotments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/allotments/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setAllotments(response.data);
      } else {
        setAllotments([]);
        console.error('Expected array of allotments but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load allotments');
      console.error('Error fetching allotments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/allotments/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `allotments.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting allotments:', error);
      alert('Failed to export allotments. Please try again.');
    }
  };

  const handleAddAllotment = () => {
    setSelectedAllotment(undefined);
    setShowAddModal(true);
  };

  const handleEditAllotment = (allotment: Allotment) => {
    setSelectedAllotment(allotment);
    setShowAddModal(true);
  };

  const handleDeleteAllotment = async (allotment: Allotment) => {
    if (window.confirm(`Are you sure you want to delete allotment ${allotment.allotmentId}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/allotments/${user?.companyId}/${allotment.id}`);
        fetchAllotments();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting allotment:', error);
        alert('Failed to delete allotment. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchAllotments();
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
      <AllotmentModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        allotment={selectedAllotment}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportAllotmentModal
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
            <h1 className="h3 mb-0">Share Allotments</h1>
            <p className="text-muted mb-0">Record and manage company share allotments and their details</p>
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
            <Button variant="primary" onClick={handleAddAllotment}>
              <FaPlus className="me-2" /> Add Allotment
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
                    <div className="text-muted mb-1">Total Allotments</div>
                    <h3 className="mb-0">{allotments.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaShareAlt className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Active Allotments</div>
                    <h3 className="mb-0">{allotments.filter(a => a.status === 'Active').length}</h3>
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
                    <div className="text-muted mb-1">Cancelled Allotments</div>
                    <h3 className="mb-0">{allotments.filter(a => a.status === 'Cancelled').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaTimesCircle className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Allotments Table */}
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
                  variant={statusFilter === 'Cancelled' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Cancelled')}
                >
                  Cancelled
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Allotment ID</th>
                  <th>Share Class</th>
                  <th>Number of Shares</th>
                    <th>Allottee</th>
                  <th>Payment Status</th>
                  <th>Status</th>
                  {user?.roles?.includes('Super Admin') && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allotments.map((allotment) => (
                  <tr key={allotment.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{allotment.allotmentId}</div>
                          <div className="text-muted small">
                            {new Date(allotment.allotmentDate).toLocaleDateString('en-IE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{allotment.shareClass}</td>
                    <td>{allotment.numberOfShares.toLocaleString()}</td>
                    <td>{allotment.allottee}</td>
                    <td>
                      <Badge bg={
                        allotment.paymentStatus === 'Paid' ? 'success' :
                        allotment.paymentStatus === 'Partially Paid' ? 'warning' :
                        'secondary'
                      }>
                        {allotment.paymentStatus}
                      </Badge>
                    </td>
                    <td>
                      <Badge bg={allotment.status === 'Active' ? 'success' : 'secondary'}>
                        {allotment.status}
                      </Badge>
                    </td>
                    {user?.roles?.includes('Super Admin') && (
                      <td>{allotment.company?.name || allotment.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditAllotment(allotment)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteAllotment(allotment)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {allotments.length === 0 && (
                  <tr>
                    <td colSpan={user?.roles?.includes('Super Admin') ? 8 : 7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaShareAlt className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Share Allotments Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first share allotment or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Allotments
                          </Button>
                          <Button variant="primary" onClick={handleAddAllotment}>
                            <FaPlus className="me-2" /> Add Allotment
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
              <h5 className="mb-0">Recent Activities</h5>
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
                          ) : activity.type === 'status_changed' ? (
                            <FaCheckCircle className="text-warning" />
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

export default Allotments;
