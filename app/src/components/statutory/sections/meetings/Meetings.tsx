import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MeetingModal from './MeetingModal';
import ImportMeetingModal from './ImportMeetingModal';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import { Table, Button, Badge, ButtonGroup } from 'react-bootstrap';
import { FaPlus, FaEdit, FaFileImport, FaCalendarAlt, FaCalendarCheck, FaCalendarTimes, FaTrash, FaEye } from 'react-icons/fa';
import MainView from '../../../shared/MainView';
import { Meeting } from '../../../../services/statutory/types';
import { formatDDMMYYYY } from '../../../../utils';

const Meetings: React.FC = () => {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Scheduled' | 'Completed' | 'Cancelled'>('All');
  const { user } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | undefined>(undefined);

  useEffect(() => {
    fetchMeetings();
  }, [statusFilter]);

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
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `meetings.${type === 'pdf' ? 'pdf' : 'xlsx'}`);
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
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
    if (window.confirm(`Are you sure you want to delete this meeting? This action cannot be undone.`)) {
      try {
        await api.delete(`/statutory/meetings/${user?.companyId}/${meeting.id}`);
        fetchMeetings();
      } catch (error) {
        console.error('Error deleting meeting:', error);
        alert('Failed to delete meeting. Please try again.');
      }
    }
  };

  const handleModalSuccess = () => {
    fetchMeetings();
  };

  // Format time
  const formatTime = (timeString: string) => {
    try {
      const date = new Date(`2000-01-01T${timeString}`);
      return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return timeString;
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Scheduled':
        return 'info';
      case 'In Progress':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Define summary cards
  const summaryCards = [
    {
      title: 'Total Meetings',
      value: meetings.length,
      icon: <FaCalendarAlt className="text-primary" size={24} />,
      color: 'primary'
    },
    {
      title: 'Upcoming Meetings',
      value: meetings.filter(m => m.status === 'Scheduled' || m.status === 'Draft').length,
      icon: <FaCalendarCheck className="text-success" size={24} />,
      color: 'success'
    },
    {
      title: 'Past Meetings',
      value: meetings.filter(m => m.status === 'Completed' || m.status === 'Cancelled').length,
      icon: <FaCalendarTimes className="text-secondary" size={24} />,
      color: 'secondary'
    }
  ];

  // Define action buttons
  const renderActions = () => (
    <>
      <Button variant="outline-primary" className="me-2" onClick={() => setShowImportModal(true)}>
        <FaFileImport className="me-2" /> Import
      </Button>
      <Button variant="primary" onClick={handleAddMeeting}>
        <FaPlus className="me-2" /> Add Meeting
      </Button>
    </>
  );

  // Define filters
  const renderFilters = () => (
    <ButtonGroup>
      <Button
        variant={statusFilter === 'All' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('All')}
      >
        All
      </Button>
      <Button
        variant={statusFilter === 'Scheduled' ? 'primary' : 'outline-primary'}
        onClick={() => setStatusFilter('Scheduled')}
      >
        Scheduled
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
    </ButtonGroup>
  );

  // Define table rendering
  const renderTable = () => (
    <>
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <Table responsive hover className="align-middle">
          <thead className="bg-light">
            <tr>
              <th>Meeting Type</th>
              <th>Date & Time</th>
              <th>Venue</th>
              <th>Chairperson</th>
              <th>Quorum</th>
              <th>Status</th>
              {user?.roles?.includes('super_admin') && <th>Company</th>}
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id}>
                <td>
                  <div className="fw-bold">{meeting.meetingType}</div>
                  <div className="text-muted small">
                    {meeting.attendees?.length || 0} attendees
                  </div>
                </td>
                <td>
                  <div>{formatDDMMYYYY(new Date(meeting.meetingDate))}</div>
                  <div className="text-muted small">
                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                  </div>
                </td>
                <td>{meeting.venue}</td>
                <td>{meeting.chairperson}</td>
                <td>
                  <div>
                    {meeting.quorumPresent}/{meeting.quorumRequired}
                  </div>
                  <div className="text-muted small">
                    {meeting.quorumAchieved ? 'Quorum achieved' : 'Quorum not achieved'}
                  </div>
                </td>
                <td>
                  <Badge bg={getStatusBadgeColor(meeting.status)}>
                    {meeting.status}
                  </Badge>
                </td>
                {user?.roles?.includes('super_admin') && (
                  <td>{meeting.company?.name || meeting.company?.legalName}</td>
                )}
                <td className="text-end">
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => navigate(`/statutory/meetings/${meeting.id}`)}
                    title="View details"
                  >
                    <FaEye className="text-info" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 me-3"
                    onClick={() => handleEditMeeting(meeting)}
                    title="Edit"
                  >
                    <FaEdit className="text-primary" />
                  </Button>
                  <Button
                    variant="link"
                    className="p-0"
                    onClick={() => handleDeleteMeeting(meeting)}
                    title="Delete"
                  >
                    <FaTrash className="text-danger" />
                  </Button>
                </td>
              </tr>
            ))}
            {meetings.length === 0 && (
              <tr>
                <td colSpan={user?.roles?.includes('super_admin') ? 8 : 7} className="text-center py-5">
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
      )}
    </>
  );

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
      
      <MainView
        title="General Meetings"
        description="Record and manage company general meetings"
        entityType="meeting"
        summaryCards={summaryCards}
        renderTable={renderTable}
        renderActions={renderActions}
        renderFilters={renderFilters}
        handleExport={handleExport}
      />
    </>
  );
};

export default Meetings;
