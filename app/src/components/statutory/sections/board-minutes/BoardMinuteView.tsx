import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack, Table } from 'react-bootstrap';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUser, FaUsers, FaFileAlt, FaComments, FaTasks } from 'react-icons/fa';
import DetailedView from '../../../shared/DetailedView';
import { BoardMinute, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import BoardMinuteModal from './BoardMinuteModal';

const BoardMinuteView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [boardMinute, setBoardMinute] = useState<BoardMinute | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchBoardMinuteData();
    }
  }, [user?.companyId, id]);

  const fetchBoardMinuteData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get board minute details
      const response = await api.get(`/statutory/board-minutes/${user.companyId}/${id}`);
      setBoardMinute(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=board-minute&limit=10`);
      const boardMinuteActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(boardMinuteActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching board minute data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchBoardMinuteData();
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

  const renderBoardMinuteInfo = () => {
    if (!boardMinute) return null;
    
    return (
      <Stack gap={2}>
        {/* Basic Information */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Basic Information</div>
          
          <div className="mb-2">
            <Badge bg={
              boardMinute.status === 'Final' ? 'success' :
              boardMinute.status === 'Draft' ? 'warning' :
              boardMinute.status === 'Signed' ? 'primary' : 'secondary'
            } className="me-1">
              {boardMinute.status}
            </Badge>
            <Badge bg="info" className="me-1">
              {boardMinute.meetingType}
            </Badge>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaFileAlt className="me-1" />Minute ID</div>
            <div>{boardMinute.minuteId}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaCalendarAlt className="me-1" />Meeting Date</div>
            <div>{new Date(boardMinute.meetingDate).toLocaleDateString()}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaClock className="me-1" />Time</div>
            <div>{formatTime(boardMinute.startTime)} - {formatTime(boardMinute.endTime)}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaMapMarkerAlt className="me-1" />Venue</div>
            <div>{boardMinute.venue}</div>
          </div>
        </div>

        {/* Attendees */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Attendees</div>
          
          <div className="mb-2">
            <div className="text-muted small"><FaUser className="me-1" />Chairperson</div>
            <div>{boardMinute.chairperson}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaUsers className="me-1" />Attendees</div>
            <div>
              {boardMinute.attendees.map((attendee, index) => (
                <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                  {attendee}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Content</div>
          <div className="mb-2">
            <div className="text-muted small"><FaFileAlt className="me-1" />Minute Content</div>
            <div style={{ whiteSpace: 'pre-line' }}>{boardMinute.content}</div>
          </div>
        </div>

        {/* Discussions */}
        {boardMinute.discussions && boardMinute.discussions.length > 0 && (
          <div className="border-bottom pb-2">
            <div className="text-muted small mb-2">Discussions</div>
            {boardMinute.discussions.map((discussion, index) => (
              <div key={index} className="mb-3 p-2 border rounded">
                <div className="fw-bold mb-1"><FaComments className="me-1" />{discussion.topic}</div>
                <div className="mb-2">{discussion.details}</div>
                <div className="mb-2">
                  <div className="text-muted small">Decisions:</div>
                  <div>{discussion.decisions}</div>
                </div>
                
                {discussion.actionItems && discussion.actionItems.length > 0 && (
                  <div>
                    <div className="text-muted small mb-1"><FaTasks className="me-1" />Action Items:</div>
                    <Table size="sm" className="border">
                      <thead className="bg-light">
                        <tr>
                          <th>Task</th>
                          <th>Assignee</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {discussion.actionItems.map((item, itemIndex) => (
                          <tr key={itemIndex}>
                            <td>{item.task}</td>
                            <td>{item.assignee}</td>
                            <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                            <td>
                              <Badge bg={
                                item.status === 'Completed' ? 'success' :
                                item.status === 'In Progress' ? 'info' :
                                item.status === 'Cancelled' ? 'danger' : 'warning'
                              }>
                                {item.status}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Resolutions */}
        {boardMinute.resolutions && boardMinute.resolutions.length > 0 && (
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
                {boardMinute.resolutions.map((resolution, index) => (
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
        title={boardMinute ? `${boardMinute.meetingType} Minutes` : 'Board Minute Details'}
        subtitle={boardMinute ? `${boardMinute.minuteId} - ${new Date(boardMinute.meetingDate).toLocaleDateString()}` : ''}
        entityType="board-minute"
        onBack={() => navigate('/statutory/board-minutes')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderBoardMinuteInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {boardMinute && (
        <BoardMinuteModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          minute={boardMinute}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default BoardMinuteView;
