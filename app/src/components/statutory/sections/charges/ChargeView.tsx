import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaCalendar, FaInfoCircle, FaMoneyBillWave, FaCheckCircle } from 'react-icons/fa';
import DetailedView from '../../../shared/DetailedView';
import { Charge, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import ChargeModal from './ChargeModal';

const ChargeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [charge, setCharge] = useState<Charge | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchChargeData();
    }
  }, [user?.companyId, id]);

  const fetchChargeData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get charge details
      const response = await api.get(`/statutory/charges/${user.companyId}/${id}`);
      setCharge(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=charge&limit=10`);
      const chargeActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(chargeActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching charge data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchChargeData();
    setShowEditModal(false);
  };

  const renderChargeInfo = () => {
    if (!charge) return null;
    
    return (
      <Stack gap={2}>
        {/* Basic Information */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Basic Information</div>
          
          <div className="mb-2">
            <Badge bg={
              charge.status === 'Active' ? 'success' :
              charge.status === 'Satisfied' ? 'info' : 'secondary'
            } className="me-1">
              {charge.status}
            </Badge>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaFileInvoiceDollar className="me-1" />Charge ID</div>
            <div>{charge.chargeId}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaFileInvoiceDollar className="me-1" />Charge Type</div>
            <div>{charge.chargeType}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaMoneyBillWave className="me-1" />Amount</div>
            <div>€{charge.amount.toFixed(2)}</div>
          </div>
        </div>

        {/* Dates */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Dates</div>
          
          <div className="mb-2">
            <div className="text-muted small"><FaCalendar className="me-1" />Date Created</div>
            <div>{new Date(charge.dateCreated).toLocaleDateString()}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaCalendar className="me-1" />Registration Date</div>
            <div>{new Date(charge.registrationDate).toLocaleDateString()}</div>
          </div>
          
          {charge.satisfactionDate && (
            <div className="mb-2">
              <div className="text-muted small"><FaCheckCircle className="me-1" />Satisfaction Date</div>
              <div>{new Date(charge.satisfactionDate).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pb-2">
          <div className="text-muted small mb-2">Description</div>
          <div className="mb-2">
            <div className="text-muted small"><FaInfoCircle className="me-1" />Details</div>
            <div>{charge.description}</div>
          </div>
        </div>
      </Stack>
    );
  };

  return (
    <>
      <DetailedView
        title={charge ? `Charge: ${charge.chargeId}` : 'Charge Details'}
        subtitle={charge ? `${charge.chargeType} - €${charge.amount.toFixed(2)}` : ''}
        entityType="charge"
        onBack={() => navigate('/statutory/charges')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderChargeInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {charge && (
        <ChargeModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          charge={charge}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ChargeView;
