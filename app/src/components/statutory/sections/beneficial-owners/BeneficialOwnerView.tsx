import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaUserCircle, FaEnvelope, FaPhone, FaCalendar, FaGlobe, FaMapMarkerAlt, FaPercentage, FaShieldAlt } from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { BeneficialOwner, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import BeneficialOwnerModal from './BeneficialOwnerModal';

const BeneficialOwnerView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [beneficialOwner, setBeneficialOwner] = useState<BeneficialOwner | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchBeneficialOwnerData();
    }
  }, [user?.companyId, id]);

  const fetchBeneficialOwnerData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get beneficial owner details
      const response = await api.get(`/statutory/beneficial-owners/${user.companyId}/${id}`);
      setBeneficialOwner(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=beneficial-owner&limit=10`);
      const ownerActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(ownerActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching beneficial owner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchBeneficialOwnerData();
    setShowEditModal(false);
  };

  const renderBeneficialOwnerInfo = () => {
    if (!beneficialOwner) return null;
    
    return (
      <div>
        {/* Status Badges */}
        <div className="mb-3">
          <StatusBadge status={beneficialOwner.status} />
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaUserCircle className="me-1" />Full Name</>}
              value={`${beneficialOwner.title} ${beneficialOwner.firstName} ${beneficialOwner.lastName}`}
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Date of Birth</>}
              value={new Date(beneficialOwner.dateOfBirth).toLocaleDateString()}
            />
            <InfoListItem 
              label={<><FaGlobe className="me-1" />Nationality</>}
              value={beneficialOwner.nationality}
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
              value={beneficialOwner.email}
            />
            <InfoListItem 
              label={<><FaPhone className="me-1" />Phone</>}
              value={beneficialOwner.phone}
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
              value={beneficialOwner.address}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Ownership Details */}
        <div className="mb-4">
          <SectionHeader title="Ownership Details" />
          <InfoList>
            <InfoListItem 
              label={<><FaPercentage className="me-1" />Ownership Percentage</>}
              value={`${beneficialOwner.ownershipPercentage}%`}
            />
            <InfoListItem 
              label={<><FaShieldAlt className="me-1" />Nature of Control</>}
              value={
                beneficialOwner.natureOfControl.map((control, index) => (
                  <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                    {control}
                  </Badge>
                ))
              }
            />
            <InfoListItem 
              label={<><FaCalendar className="me-1" />Registration Date</>}
              value={new Date(beneficialOwner.registrationDate).toLocaleDateString()}
              isLast={true}
            />
          </InfoList>
        </div>

        {/* Description */}
        {beneficialOwner.description && (
          <div className="mb-4">
            <SectionHeader title="Additional Information" />
            <p>{beneficialOwner.description}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={beneficialOwner ? `${beneficialOwner.title} ${beneficialOwner.firstName} ${beneficialOwner.lastName}` : 'Beneficial Owner Details'}
        subtitle={beneficialOwner ? `${beneficialOwner.ownershipPercentage}% ownership` : ''}
        entityType="beneficial-owner"
        onBack={() => navigate('/statutory/beneficial-owners')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderBeneficialOwnerInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {beneficialOwner && (
        <BeneficialOwnerModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          owner={beneficialOwner}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default BeneficialOwnerView;
