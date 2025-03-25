import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaUserCircle, FaBriefcase, FaBuilding, FaCalendar, FaGlobe, FaMapMarkerAlt } from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { Director, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import DirectorModal from './DirectorModal';

const DirectorView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [director, setDirector] = useState<Director | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchDirectorData();
    }
  }, [user?.companyId, id]);

  const fetchDirectorData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get director details
      const response = await api.get(`/statutory/directors/${user.companyId}/${id}`);
      setDirector(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=director&limit=10`);
      const directorActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(directorActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching director data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchDirectorData();
    setShowEditModal(false);
  };

  const renderDirectorInfo = () => {
    if (!director) return null;
    
    return (
      <div>
        {/* Status Badges */}
        <div className="mb-3">
          <StatusBadge status={director.status} type={director.directorType} />
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaUserCircle className="me-1" />Full Name</>}
              value={`${director.title} ${director.firstName} ${director.lastName}`}
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Date of Birth</>}
              value={new Date(director.dateOfBirth).toLocaleDateString()}
            />
            <InfoListItem 
              label={<><FaGlobe className="me-1" />Nationality</>}
              value={director.nationality}
            />
            <InfoListItem 
              label={<><FaBriefcase className="me-1" />Occupation</>}
              value={director.occupation}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Address */}
        <div className="mb-4">
          <SectionHeader title="Address" />
          <InfoList>
            <InfoListItem 
              label={<><FaMapMarkerAlt className="me-1" />Address</>}
              value={director.address}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Appointment Details */}
        <div className="mb-4">
          <SectionHeader title="Appointment Details" />
          <InfoList>
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Appointment Date</>}
              value={new Date(director.appointmentDate).toLocaleDateString()}
              isLast={!director.resignationDate}
            />
            {director.resignationDate && (
              <InfoListItem 
                label={<><FaCalendar className="me-1" />Resignation Date</>}
                value={new Date(director.resignationDate).toLocaleDateString()}
                isLast={true}
              />
            )}
          </InfoList>
        </div>

        {/* Other Directorships */}
        {director.otherDirectorships && (
          <div className="mb-4">
            <SectionHeader title="Other Directorships" />
            <p>{director.otherDirectorships}</p>
          </div>
        )}

        {/* Shareholding */}
        {director.shareholding && (
          <div className="mb-4">
            <SectionHeader title="Shareholding" />
            <p>{director.shareholding}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={director ? `${director.title} ${director.firstName} ${director.lastName}` : 'Director Details'}
        subtitle={director ? director.directorType : ''}
        entityType="director"
        onBack={() => navigate('/statutory/directors')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderDirectorInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {director && (
        <DirectorModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          director={director}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default DirectorView;
