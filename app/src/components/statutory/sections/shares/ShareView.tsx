import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaShareAlt, FaMoneyBillWave, FaVoteYea, FaPercentage, FaExchangeAlt, FaInfoCircle } from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { Share, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import ShareModal from './ShareModal';

const ShareView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [share, setShare] = useState<Share | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchShareData();
    }
  }, [user?.companyId, id]);

  const fetchShareData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get share details
      const response = await api.get(`/statutory/shares/${user.companyId}/${id}`);
      setShare(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=share&limit=10`);
      const shareActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(shareActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching share data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchShareData();
    setShowEditModal(false);
  };

  const renderShareInfo = () => {
    if (!share) return null;
    
    return (
      <div>
        {/* Status Badges */}
        <div className="mb-3">
          <StatusBadge status={share.status} type={share.type} />
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaShareAlt className="me-1" />Share Class</>}
              value={share.class}
            />
            <InfoListItem 
              label={<><FaMoneyBillWave className="me-1" />Nominal Value</>}
              value={`${share.currency} ${share.nominalValue.toFixed(2)}`}
            />
            <InfoListItem 
              label={<><FaShareAlt className="me-1" />Total Issued</>}
              value={share.totalIssued}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Rights */}
        <div className="mb-4">
          <SectionHeader title="Rights" />
          <InfoList>
            <InfoListItem 
              label={<><FaVoteYea className="me-1" />Voting Rights</>}
              value={share.votingRights ? 'Yes' : 'No'}
            />
            <InfoListItem 
              label={<><FaPercentage className="me-1" />Dividend Rights</>}
              value={share.dividendRights ? 'Yes' : 'No'}
            />
            <InfoListItem 
              label={<><FaExchangeAlt className="me-1" />Transferable</>}
              value={share.transferable ? 'Yes' : 'No'}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Description */}
        {share.description && (
          <div className="mb-4">
            <SectionHeader title="Description" />
            <p>{share.description}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={share ? `${share.class} ${share.type} Shares` : 'Share Details'}
        subtitle={share ? `${share.currency} ${share.nominalValue.toFixed(2)} nominal value` : ''}
        entityType="share"
        onBack={() => navigate('/statutory/shares')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderShareInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {share && (
        <ShareModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          share={share}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ShareView;
