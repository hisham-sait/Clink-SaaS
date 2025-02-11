import React, { useState, useEffect } from 'react';
import MeetingModal from './MeetingModal';
import ImportMeetingModal from './ImportMeetingModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, Row, Col, Card, Dropdown } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaUsers, FaCheckCircle, FaTimesCircle, FaTrash, FaFileExport, FaFilePdf, FaFileExcel, FaCalendarAlt } from 'react-icons/fa';

interface Meeting {
  id?: string;
  meetingType: 'AGM' | 'EGM' | 'Board Meeting' | 'Committee Meeting';
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  quorumRequired: number;
  quorumPresent: number;
  quorumAchieved: boolean;
  attendees: string[];
  agenda: string;
  status: 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  resolutions: Resolution[];
  company?: {
    name: string;
    legalName: string;
  };
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

const Meetings: React.FC = () => {
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

  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>(undefined);

  useEffect(() => {
    fetchMeetings();
    fetchRecentActivities();
  }, [statusFilter]);

  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const response = await api.get(`/statutory/activities/${user?.companyId}?entityType=meeting&limit=5`);
      if (response.data?.activities) {
        setRecentActivities(response.data.activities);
      }
    } catch (err) {
      console.error('Error fetching recent activities:', err);
    } finally {
      setActivitiesLoading(false);
    }
  };

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/statutory/meetings/${user?.companyId}?status=${statusFilter}`);
      if (Array.isArray(response.data)) {
        setMeetings(response.data);
      } else {
        setMeetings([]);
        console.error('Expected array of meetings but got:', response.data);
      }
      setError('');
    } catch (err) {
      setError('Failed to load meetings');
      console.error('Error fetching meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type: 'pdf' | 'excel') => {
    try {
      const response = await api.get(`/statutory/meetings/${user?.companyId}/export/${type}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meetings.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error exporting meetings:', error);
      alert('Failed to export meetings. Please try again.');
    }
  };

  const handleAddMeeting = () => {
    setSelectedMeeting(undefined);
    setShowAddModal(true);
  };

  const handleEditMeeting = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowAddModal(true);
  };

  const handleDeleteMeeting = async (meeting: Meeting) => {
    if (window.confirm(`Are you sure you want to delete this ${meeting.meetingType}? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/meetings/${user?.companyId}/${meeting.id}`);
        fetchMeetings();
        fetchRecentActivities();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchMeetings();
    fetchRecentActivities();
  };

  const getStatusBadgeVariant = (status: Meeting['status']) => {
    switch (status) {
      case 'Draft': return 'secondary';
      case 'Scheduled': return 'info';
      case 'In Progress': return 'warning';
      case 'Completed': return 'success';
      case 'Cancelled': return 'danger';
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
      <MeetingModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        meeting={selectedMeeting}
        onSuccess={handleModalSuccess}
      />
      {user?.companyId && (
        <ImportMeetingModal
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
            <h1 className="h3 mb-0">Meetings</h1>
            <p className="text-muted mb-0">Record and manage company meetings, resolutions and their details</p>
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
            <Button variant="primary" onClick={handleAddMeeting}>
              <FaPlus className="me-2" /> Add Meeting
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
                    <div className="text-muted mb-1">Total Meetings</div>
                    <h3 className="mb-0">{meetings.length}</h3>
                  </div>
                  <div className="bg-primary bg-opacity-10 p-3 rounded">
                    <FaCalendarAlt className="text-primary" size={24} />
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
                    <div className="text-muted mb-1">Upcoming</div>
                    <h3 className="mb-0">{meetings.filter(m => m.status === 'Scheduled').length}</h3>
                  </div>
                  <div className="bg-info bg-opacity-10 p-3 rounded">
                    <FaUsers className="text-info" size={24} />
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
                    <div className="text-muted mb-1">Completed</div>
                    <h3 className="mb-0">{meetings.filter(m => m.status === 'Completed').length}</h3>
                  </div>
                  <div className="bg-success bg-opacity-10 p-3 rounded">
                    <FaCheckCircle className="text-success" size={24} />
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
                    <div className="text-muted mb-1">Cancelled</div>
                    <h3 className="mb-0">{meetings.filter(m => m.status === 'Cancelled').length}</h3>
                  </div>
                  <div className="bg-danger bg-opacity-10 p-3 rounded">
                    <FaTimesCircle className="text-danger" size={24} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Meetings Table */}
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
                  variant={statusFilter === 'Scheduled' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Scheduled')}
                >
                  Scheduled
                </Button>
                <Button
                  variant={statusFilter === 'In Progress' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('In Progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={statusFilter === 'Completed' ? 'primary' : 'outline-primary'}
                  onClick={() => setStatusFilter('Completed')}
                >
                  Completed
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
                  <th>Meeting Type</th>
                  <th>Date & Time</th>
                  <th>Venue</th>
                  <th>Chairperson</th>
                  <th>Quorum</th>
                  <th>Status</th>
                  {user?.role === 'super_admin' && <th>Company</th>}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => (
                  <tr key={meeting.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div>
                          <div className="fw-bold">{meeting.meetingType}</div>
                          <div className="text-muted small">
                            {meeting.resolutions.length} Resolution{meeting.resolutions.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        {new Date(meeting.meetingDate).toLocaleDateString('en-IE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="text-muted small">
                        {new Date(meeting.startTime).toLocaleTimeString('en-IE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {new Date(meeting.endTime).toLocaleTimeString('en-IE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </td>
                    <td>{meeting.venue}</td>
                    <td>{meeting.chairperson}</td>
                    <td>
                      <div>
                        {meeting.quorumPresent}/{meeting.quorumRequired}
                      </div>
                      <div className="text-muted small">
                        {meeting.quorumAchieved ? 'Achieved' : 'Not Achieved'}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(meeting.status)}>
                        {meeting.status}
                      </Badge>
                    </td>
                    {user?.role === 'super_admin' && (
                      <td>{meeting.company?.name || meeting.company?.legalName}</td>
                    )}
                    <td className="text-end">
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditMeeting(meeting)}
                      >
                        <FaEdit className="text-primary" />
                      </Button>
                      <Button
                        variant="link"
                        className="p-0"
                        onClick={() => handleDeleteMeeting(meeting)}
                      >
                        <FaTrash className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {meetings.length === 0 && (
                  <tr>
                    <td colSpan={user?.role === 'super_admin' ? 8 : 7} className="text-center py-5">
                      <div className="d-flex flex-column align-items-center">
                        <div className="bg-light p-4 rounded-circle mb-3">
                          <FaCalendarAlt className="text-muted" size={32} />
                        </div>
                        <h5 className="text-muted mb-2">No Meetings Found</h5>
                        <p className="text-muted mb-4">Get started by adding your first meeting or importing data</p>
                        <div>
                          <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
                            <FaFileImport className="me-2" /> Import Meetings
                          </Button>
                          <Button variant="primary" onClick={handleAddMeeting}>
                            <FaPlus className="me-2" /> Add Meeting
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

export default Meetings;
