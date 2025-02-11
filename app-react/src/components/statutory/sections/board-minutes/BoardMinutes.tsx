import React, { useState, useEffect } from 'react';
import BoardMinuteModal from './BoardMinuteModal';
import ImportBoardMinuteModal from './ImportBoardMinuteModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaBook, FaCheckCircle, FaTimesCircle, FaTrash, FaFileExport, FaFilePdf, FaFileExcel, FaCalendarAlt } from 'react-icons/fa';

interface BoardMinute {
  id?: string;
  meetingType: 'AGM' | 'EGM' | 'Board Meeting' | 'Committee Meeting';
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  content: string;
  discussions: Discussion[];
  resolutions: Resolution[];
  status: 'Draft' | 'Final' | 'Signed';
  company?: {
    name: string;
    legalName: string;
  };
}

interface Discussion {
  id?: string;
  topic: string;
  details: string;
  decisions: string;
  actionItems: ActionItem[];
}

interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

interface Resolution {
  id?: string;
  title: string;
  type: 'Ordinary' | 'Special';
  description: string;
  outcome: 'Pending' | 'Passed' | 'Failed' | 'Withdrawn';
  proposedBy: string;
  secondedBy: string;
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

const BoardMinutes: React.FC = () => {
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

  const [minutes, setMinutes] = useState<BoardMinute[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Final' | 'Signed'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMinute, setSelectedMinute] = useState<BoardMinute | undefined>(undefined);

  useEffect(() => {
    fetchMinutes();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=board-minute&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchMinutes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/board-minutes/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setMinutes(response.data);
      } else {
        setMinutes([]);
        console.error('Expected array of board minutes but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load board minutes');
      console.error('Error fetching board minutes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/board-minutes/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `board-minutes.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting board minutes:', error);
      alert('Failed to export board minutes. Please try again.');
    }
  };

  const handleAddMinute = () => {
    setSelectedMinute(undefined);
    setShowAddModal(true);
  };

  const handleEditMinute = (minute: BoardMinute) => {
    setSelectedMinute(minute);
    setShowAddModal(true);
  };

  const handleDeleteMinute = async (minute: BoardMinute) => {
    if (window.confirm(`Are you sure you want to delete this ${minute.meetingType} minute? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/board-minutes/${user?.companyId}/${minute.id}`);
        fetchMinutes();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting board minute:', error);
        alert('Failed to delete board minute. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchMinutes();
    fetchRecentActivities();
  };

  const getStatusBadgeVariant = (status: BoardMinute['status']) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Final': return 'primary';
      case 'Signed': return 'success';
      default: return 'secondary';
    }
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
      <BoardMinuteModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        minute={selectedMinute}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportBoardMinuteModal
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
            <h1 className="h3 mb-0">Board Minutes</h1>
            <p className="text-muted mb-0">Record and manage board meeting minutes, discussions and their resolutions</p>
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
            <Button variant="primary" onClick={handleAddMinute}>
              <FaPlus className="me-2" /> Add Minute
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
                    <div className="text-muted mb-1">Total Minutes</div>
                    <h3 className="mb-0">{minutes.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaBook className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Draft</div>
                    <h3 className="mb-0">{minutes.filter(m => m.status === 'Draft').length}</h3>
                  </div>
                  <div className="bg-secondary bg-opacity-10 p-3 rounded">
                    <FaCalendarAlt className="text-secondary" size={24} />
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
                    <div className="text-muted mb-1">Final</div>
                    <h3 className="mb-0">{minutes.filter(m => m.status === 'Final').length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaCheckCircle className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Signed</div>
                    <h3 className="mb-0">{minutes.filter(m => m.status === 'Signed').length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaTimesCircle className="text-success" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Board Minutes Table */}
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
                  variant={statusFilter === 'Draft' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Draft')}
                >
                  Draft
                </Button>
                <Button
                  variant={statusFilter === 'Final' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Final')}
                >
                  Final
                </Button>
                <Button
                  variant={statusFilter === 'Signed' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Signed')}
                >
                  Signed
                </Button>
              </div>
            </div>
            <Table responsive hover className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th>Meeting Type</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Chairperson</th>
                  <th>Discussions</th>
                  <th>Status</th>
                  {user?.role === 'super_admin' && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {minutes.map((minute) => (
                  <tr key={minute.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{minute.meetingType}</div>
                          <div className="text-muted small">
                            {minute.resolutions.length} Resolution{minute.resolutions.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {new Date(minute.meetingDate).toLocaleDateString('en-IE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-muted small">
                        {new Date(minute.startTime).toLocaleTimeString('en-IE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(minute.endTime).toLocaleTimeString('en-IE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>{minute.venue}</td>
                    <td>{minute.chairperson}</td>
                    <td>
                      <div>
                        {minute.discussions.length} Discussion{minute.discussions.length !== 1 ? 's' : ''}
                      </div>
                      <div className="text-muted small">
                        {minute.discussions.reduce((total, d) => total + d.actionItems.length, 0)} Action Item{minute.discussions.reduce((total, d) => total + d.actionItems.length, 0) !== 1 ? 's' : ''}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(minute.status)}>
                        {minute.status}
                      </Badge>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td>{minute.company?.name || minute.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditMinute(minute)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteMinute(minute)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {minutes.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'super_admin' ? 8 : 7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaBook className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Board Minutes Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first board minute or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Minutes
                          </Button>
                          <Button variant="primary" onClick={handleAddMinute}>
                            <FaPlus className="me-2" /> Add Minute
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

export default BoardMinutes;
