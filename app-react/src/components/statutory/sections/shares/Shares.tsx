import React, { useState, useEffect } from 'react';
import ShareModal from './ShareModal';
import ImportShareModal from './ImportShareModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaClock, FaTrash, FaFileExport, FaFilePdf, FaFileExcel, FaCoins, FaCheckCircle, FaArchive, FaFileImport } from 'react-icons/fa';

interface Share {
  id?: string;
  class: string;
  type: 'Ordinary' | 'Preferential' | 'Deferred';
  nominalValue: number;
  currency: string;
  votingRights: boolean;
  dividendRights: boolean;
  transferable: boolean;
  totalIssued: number;
  status: 'Active' | 'Inactive' | 'Archived';
  description?: string;
  company?: {
    name: string;
    legalName: string;
  };
}

interface Activity {
  id: string;
  type: 'added' | 'updated' | 'status_changed' | 'removed';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

const Shares: React.FC = () => {
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

  const [shares, setShares] = useState<Share[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Archived'>('All');
  const { user } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedShare, setSelectedShare] = useState<Share | undefined>(undefined);

  useEffect(() => {
    fetchShares();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=share&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchShares = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/shares/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setShares(response.data);
      } else {
        setShares([]);
        console.error('Expected array of shares but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load share classes');
      console.error('Error fetching shares:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/shares/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shares.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting shares:', error);
      alert('Failed to export shares. Please try again.');
    }
  };

  const handleAddShare = () => {
    setSelectedShare(undefined);
    setShowModal(true);
  };

  const handleEditShare = (share: Share) => {
    setSelectedShare(share);
    setShowModal(true);
  };

  const handleDeleteShare = async (share: Share) => {
    if (window.confirm(`Are you sure you want to delete the ${share.class} share class? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/shares/${user?.companyId}/${share.id}`);
        fetchShares();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting share:', error);
        alert('Failed to delete share class. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchShares();
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
      <ShareModal
        show={showModal}
        onHide={() => setShowModal(false)}
        share={selectedShare}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportShareModal
          show={showImportModal}
          onHide={() => setShowImportModal(false)}
          onSuccess={handleModalSuccess}
          companyId={user.companyId}
        />
      )}
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">Shares Register</h1>
          <div className="d-flex">
            <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
              <FaFileImport className="me-2" /> Import
            </Button>
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
            <Button variant="primary" onClick={handleAddShare}>
              <FaPlus className="me-2" /> Add Share Class
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
                    <div className="text-muted mb-1">Total Share Classes</div>
                    <h3 className="mb-0">{shares.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaCoins className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Active Share Classes</div>
                    <h3 className="mb-0">{shares.filter(s => s.status === 'Active').length}</h3>
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
                    <div className="text-muted mb-1">Archived Share Classes</div>
                    <h3 className="mb-0">{shares.filter(s => s.status === 'Archived').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaArchive className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Shares Table */}
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
                  <th>Share Class</th>
                  <th>Type</th>
                  <th>Nominal Value</th>
                  <th>Total Issued</th>
                  <th>Rights</th>
                  <th>Status</th>
                  {user?.role === 'super_admin' && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((share) => (
                  <tr key={share.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{share.class}</div>
                          <div className="text-muted small">{share.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{share.type}</td>
                    <td>{`${share.nominalValue} ${share.currency}`}</td>
                    <td>{share.totalIssued.toLocaleString()}</td>
                    <td>
                      <div className="small">
                        {share.votingRights && <Badge bg="info" className="me-1">Voting</Badge>}
                        {share.dividendRights && <Badge bg="info" className="me-1">Dividend</Badge>}
                        {share.transferable && <Badge bg="info">Transferable</Badge>}
                      </div>
                    </td>
                    <td>
                      <Badge bg={
                        share.status === 'Active' ? 'success' :
                        share.status === 'Inactive' ? 'warning' :
                        'secondary'
                      }>
                        {share.status}
                      </Badge>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td>{share.company?.name || share.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditShare(share)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteShare(share)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {shares.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'super_admin' ? 8 : 7} className="text-center py-4">
                      <div className="text-muted">No share classes found</div>
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
                          ) : activity.type === 'status_changed' ? (
                            <FaEdit className="text-warning" />
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

export default Shares;
