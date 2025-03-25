import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaPhone, FaCalendar, FaGlobe, FaMapMarkerAlt, FaShareAlt } from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { Shareholder, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import ShareholderModal from './ShareholderModal';

const ShareholderView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchShareholderData();
    }
  }, [user?.companyId, id]);

  const fetchShareholderData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get shareholder details
      const response = await api.get(`/statutory/shareholders/${user.companyId}/${id}`);
      setShareholder(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=shareholder&limit=10`);
      const shareholderActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(shareholderActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching shareholder data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchShareholderData();
    setShowEditModal(false);
  };

  const renderShareholderInfo = () => {
    if (!shareholder) return null;
    
    return (
      <div>
        {/* Status Badges */}
        <div className="mb-3">
          <StatusBadge status={shareholder.status} />
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaUserCircle className="me-1" />Full Name</>}
              value={`${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}`}
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Date of Birth</>}
              value={new Date(shareholder.dateOfBirth).toLocaleDateString()}
            />
            <InfoListItem 
              label={<><FaGlobe className="me-1" />Nationality</>}
              value={shareholder.nationality}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Contact Information */}
        <div className="mb-4">
          <SectionHeader title="Contact Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaEnvelope className="me-1" />Email</>}
              value={shareholder.email}
            />
            <InfoListItem 
              label={<><FaPhone className="me-1" />Phone</>}
              value={shareholder.phone}
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
              value={shareholder.address}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Shareholding Details */}
        <div className="mb-4">
          <SectionHeader title="Shareholding Details" />
          <InfoList>
            <InfoListItem 
              label={<><FaShareAlt className="me-1" />Ordinary Shares</>}
              value={shareholder.ordinaryShares}
            />
            <InfoListItem 
              label={<><FaShareAlt className="me-1" />Preferential Shares</>}
              value={shareholder.preferentialShares}
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Date Acquired</>}
              value={new Date(shareholder.dateAcquired).toLocaleDateString()}
              isLast={true}
            />
          </InfoList>
        </div>
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={shareholder ? `${shareholder.title} ${shareholder.firstName} ${shareholder.lastName}` : 'Shareholder Details'}
        subtitle="Member"
        entityType="shareholder"
        onBack={() => navigate('/statutory/shareholders')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderShareholderInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {shareholder && (
        <ShareholderModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          shareholder={shareholder}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ShareholderView;
