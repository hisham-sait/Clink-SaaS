import React, { useState, useEffect } from 'react';
import ChargeModal from './ChargeModal';
import ImportChargeModal from './ImportChargeModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaMoneyBill, FaCheckCircle, FaTimesCircle, FaTrash, FaFileExport, FaFilePdf, FaFileExcel } from 'react-icons/fa';

interface Charge {
  id?: string;
  chargeId: string;
  chargeType: string;
  amount: number;
  dateCreated: string;
  registrationDate: string;
  description: string;
  status: 'Active' | 'Satisfied' | 'Released';
  satisfactionDate?: string;
  company?: {
    name: string;
    legalName: string;
  };
}

interface Activity {
  id: string;
  type: 'added' | 'update' | 'status_changed' | 'deletion';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

const Charges: React.FC = () => {
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

  const [charges, setCharges] = useState<Charge[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Satisfied' | 'Released'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | undefined>(undefined);

  useEffect(() => {
    fetchCharges();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=charge&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchCharges = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/charges/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setCharges(response.data);
      } else {
        setCharges([]);
        console.error('Expected array of charges but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load charges');
      console.error('Error fetching charges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/charges/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `charges.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting charges:', error);
      alert('Failed to export charges. Please try again.');
    }
  };

  const handleAddCharge = () => {
    setSelectedCharge(undefined);
    setShowAddModal(true);
  };

  const handleEditCharge = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowAddModal(true);
  };

  const handleDeleteCharge = async (charge: Charge) => {
    if (window.confirm(`Are you sure you want to delete charge ${charge.chargeId}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/charges/${user?.companyId}/${charge.id}`);
        fetchCharges();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting charge:', error);
        alert('Failed to delete charge. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchCharges();
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
      <ChargeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        charge={selectedCharge}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportChargeModal
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
            <h1 className="h3 mb-0">Charges Register</h1>
            <p className="text-muted mb-0">Record and manage company charges, mortgages and their details</p>
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
            <Button variant="primary" onClick={handleAddCharge}>
              <FaPlus className="me-2" /> Add Charge
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
                    <div className="text-muted mb-1">Total Charges</div>
                    <h3 className="mb-0">{charges.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaMoneyBill className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Active Charges</div>
                    <h3 className="mb-0">{charges.filter(c => c.status === 'Active').length}</h3>
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
                    <div className="text-muted mb-1">Satisfied/Released</div>
                    <h3 className="mb-0">{charges.filter(c => c.status !== 'Active').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaTimesCircle className="text-secondary" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Charges Table */}
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
                  variant={statusFilter === 'Satisfied' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Satisfied')}
                >
                  Satisfied
                </Button>
                <Button
                  variant={statusFilter === 'Released' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Released')}
                >
                  Released
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Charge ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date Created</th>
                  <th>Status</th>
                  {user?.role === 'super_admin' && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {charges.map((charge) => (
                  <tr key={charge.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{charge.chargeId}</div>
                          <div className="text-muted small">{charge.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{charge.chargeType}</td>
                    <td>€{charge.amount.toLocaleString('en-IE', { minimumFractionDigits: 2 })}</td>
                    <td>{new Date(charge.dateCreated).toLocaleDateString('en-IE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</td>
                    <td>
                      <Badge bg={charge.status === 'Active' ? 'success' : 'secondary'}>
                        {charge.status}
                      </Badge>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td>{charge.company?.name || charge.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditCharge(charge)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteCharge(charge)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {charges.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'super_admin' ? 7 : 6} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaMoneyBill className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Charges Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first charge or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Charges
                          </Button>
                          <Button variant="primary" onClick={handleAddCharge}>
                            <FaPlus className="me-2" /> Add Charge
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
                          ) : activity.type === 'update' ? (
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

export default Charges;
