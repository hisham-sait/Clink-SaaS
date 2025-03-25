import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Stack } from 'react-bootstrap';
import { FaShareAlt, FaCalendar, FaMoneyBillWave, FaUser, FaReceipt, FaFileAlt } from 'react-icons/fa';
import DetailedView from '../../../shared/DetailedView';
import { Allotment, Activity } from '../../../../services/statutory/types';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';
import AllotmentModal from './AllotmentModal';

const AllotmentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [allotment, setAllotment] = useState<Allotment | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchAllotmentData();
    }
  }, [user?.companyId, id]);

  const fetchAllotmentData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get allotment details
      const response = await api.get(`/statutory/allotments/${user.companyId}/${id}`);
      setAllotment(response.data);

      // Get activities
      setActivitiesLoading(true);
      const activitiesResponse = await api.get(`/statutory/activities/${user.companyId}?entityType=allotment&limit=10`);
      const allotmentActivities = activitiesResponse.data.activities.filter((a: Activity) => a.entityId === id);
      setActivities(allotmentActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching allotment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchAllotmentData();
    setShowEditModal(false);
  };

  const renderAllotmentInfo = () => {
    if (!allotment) return null;
    
    return (
      <Stack gap={2}>
        {/* Basic Information */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Basic Information</div>
          
          <div className="mb-2">
            <Badge bg={
              allotment.status === 'Active' ? 'success' : 'secondary'
            } className="me-1">
              {allotment.status}
            </Badge>
            <Badge bg={
              allotment.paymentStatus === 'Paid' ? 'success' :
              allotment.paymentStatus === 'Partially Paid' ? 'warning' : 'danger'
            } className="me-1">
              {allotment.paymentStatus}
            </Badge>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaFileAlt className="me-1" />Allotment ID</div>
            <div>{allotment.allotmentId}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaShareAlt className="me-1" />Share Class</div>
            <div>{allotment.shareClass}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaShareAlt className="me-1" />Number of Shares</div>
            <div>{allotment.numberOfShares}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaMoneyBillWave className="me-1" />Price Per Share</div>
            <div>€{allotment.pricePerShare.toFixed(2)}</div>
          </div>

          <div className="mb-2">
            <div className="text-muted small"><FaMoneyBillWave className="me-1" />Total Value</div>
            <div>€{(allotment.numberOfShares * allotment.pricePerShare).toFixed(2)}</div>
          </div>
        </div>

        {/* Allottee */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Allottee</div>
          
          <div className="mb-2">
            <div className="text-muted small"><FaUser className="me-1" />Allottee</div>
            <div>{allotment.allottee}</div>
          </div>
        </div>

        {/* Dates and Payment */}
        <div className="border-bottom pb-2">
          <div className="text-muted small mb-2">Dates and Payment</div>
          
          <div className="mb-2">
            <div className="text-muted small"><FaCalendar className="me-1" />Allotment Date</div>
            <div>{new Date(allotment.allotmentDate).toLocaleDateString()}</div>
          </div>

          {allotment.paymentDate && (
            <div className="mb-2">
              <div className="text-muted small"><FaCalendar className="me-1" />Payment Date</div>
              <div>{new Date(allotment.paymentDate).toLocaleDateString()}</div>
            </div>
          )}

          {allotment.amountPaid !== undefined && (
            <div className="mb-2">
              <div className="text-muted small"><FaMoneyBillWave className="me-1" />Amount Paid</div>
              <div>€{allotment.amountPaid.toFixed(2)}</div>
            </div>
          )}
        </div>

        {/* Certificate */}
        {allotment.certificateNumber && (
          <div className="pb-2">
            <div className="text-muted small mb-2">Certificate</div>
            <div className="mb-2">
              <div className="text-muted small"><FaReceipt className="me-1" />Certificate Number</div>
              <div>{allotment.certificateNumber}</div>
            </div>
          </div>
        )}
      </Stack>
    );
  };

  return (
    <>
      <DetailedView
        title={allotment ? `Allotment: ${allotment.allotmentId}` : 'Allotment Details'}
        subtitle={allotment ? `${allotment.numberOfShares} ${allotment.shareClass} shares` : ''}
        entityType="allotment"
        onBack={() => navigate('/statutory/allotments')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderAllotmentInfo}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {allotment && (
        <AllotmentModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          allotment={allotment}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default AllotmentView;
