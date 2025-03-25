import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaUsers, FaCheckCircle, FaTimesCircle, FaFileAlt } from 'react-icons/fa';
import DetailedView from '../../../shared/DetailedView';
import { Meeting, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import MeetingModal from './MeetingModal';

const MeetingView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchMeetingData();
    }
  }, [user?.companyId, id]);

  const fetchMeetingData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get meeting details
      const response = await api.get(`/statutory/meetings/${user.companyId}/${id}`);
      setMeeting(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=meeting&limit=10`);
      const meetingActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(meetingActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching meeting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchMeetingData();
    setShowEditModal(false);
  };

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (e) {
      return timeString;
    }
  };

  const renderMeetingInfo = () => {
    if (!meeting) return null;
    
    return (
      <Stack gap={2}>
        {/* Basic Information */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Basic Information</div>
          
          <div className="mb-2">
            <Badge bg={
              meeting.status === 'Completed' ? 'success' :
              meeting.status === 'Scheduled' ? 'primary' :
              meeting.status === 'In Progress' ? 'info' :
              meeting.status === 'Cancelled' ? 'danger' : 'secondary'
            } className="me-1">
              {meeting.status}
            </Badge>
            <Badge bg="info" className="me-1">
              {meeting.meetingType}
            </Badge>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaCalendarAlt className="me-1" />Meeting Date</div>
            <div>{new Date(meeting.meetingDate).toLocaleDateString()}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaClock className="me-1" />Time</div>
            <div>{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaMapMarkerAlt className="me-1" />Venue</div>
            <div>{meeting.venue}</div>
          </div>
        </div>

        {/* Attendees */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Attendees</div>
          
          <div className="mb-2">
            <div className="text-muted small"><FaUser className="me-1" />Chairperson</div>
            <div>{meeting.chairperson}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaUsers className="me-1" />Attendees</div>
            <div>
              {meeting.attendees.map((attendee, index) => (
                <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                  {attendee}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Quorum */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Quorum</div>
          
          <div className="mb-2">
            <div className="text-muted small">Quorum Status</div>
            <div>
              {meeting.quorumAchieved ? (
                <Badge bg="success">
                  <FaCheckCircle className="me-1" /> Quorum Achieved
                </Badge>
              ) : (
                <Badge bg="danger">
                  <FaTimesCircle className="me-1" /> Quorum Not Achieved
                </Badge>
              )}
            </div>
          </div>

          <div className="mb-2">
            <div className="text-muted small">Required / Present</div>
            <div>{meeting.quorumRequired} / {meeting.quorumPresent}</div>
          </div>
        </div>

        {/* Agenda */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Agenda</div>
          <div className="mb-2">
            <div className="text-muted small"><FaFileAlt className="me-1" />Meeting Agenda</div>
            <div style={{ whiteSpace: 'pre-line' }}>{meeting.agenda}</div>
          </div>
        </div>

        {/* Resolutions */}
        {meeting.resolutions && meeting.resolutions.length > 0 && (
          <div className="pb-2">
            <div className="text-muted small mb-2">Resolutions</div>
            <Table size="sm" className="border">
              <thead className="bg-light">
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Outcome</th>
                  <th>Proposed By</th>
                </tr>
              </thead>
              <tbody>
                {meeting.resolutions.map((resolution, index) => (
                  <tr key={index}>
                    <td>{resolution.title}</td>
                    <td>{resolution.type}</td>
                    <td>
                      <Badge bg={
                        resolution.outcome === 'Passed' ? 'success' :
                        resolution.outcome === 'Failed' ? 'danger' :
                        resolution.outcome === 'Withdrawn' ? 'warning' : 'secondary'
                      }>
                        {resolution.outcome}
                      </Badge>
                    </td>
                    <td>{resolution.proposedBy}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Stack>
    );
  };

  return (
    <>
      <DetailedView
        title={meeting ? `${meeting.meetingType}` : 'Meeting Details'}
        subtitle={meeting ? `${new Date(meeting.meetingDate).toLocaleDateString()}` : ''}
        entityType="meeting"
        onBack={() => navigate('/statutory/meetings')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderMeetingInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {meeting && (
        <MeetingModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          meeting={meeting}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default MeetingView;
