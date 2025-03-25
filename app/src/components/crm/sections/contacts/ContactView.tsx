import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge, Button, Tab, Table, Row, Col, Card } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMobile, FaMapMarkerAlt, FaClock, FaTag, FaEdit, 
  FaBriefcase, FaBuilding, FaGlobe, FaCog, FaLinkedin, FaTwitter, FaFacebook, FaUserCircle } from 'react-icons/fa';
import DetailedView, { InfoList, InfoListItem, SectionHeader, StatusBadge } from '../../../shared/DetailedView';
import { getContacts, getActivities } from '../../../../services/crm';
import { Contact, Activity } from '../../types';
import { useAuth } from '../../../../contexts/AuthContext';
import ContactModal from './ContactModal';

const ContactView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (user?.companyId && id) {
      fetchContactData();
    }
  }, [user?.companyId, id]);

  const fetchContactData = async () => {
    try {
      setLoading(true);
      if (!user?.companyId || !id) return;

      // Get contact details
      const contacts = await getContacts(user.companyId);
      const contactData = contacts.find(c => c.id === id);
      if (contactData) {
        setContact(contactData);
      }

      // Get activities
      setActivitiesLoading(true);
      const activitiesData = await getActivities(user.companyId, 'contact');
      const contactActivities = activitiesData.filter(a => a.entityId === id);
      setActivities(contactActivities);
      setActivitiesLoading(false);
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSuccess = () => {
    fetchContactData();
    setShowEditModal(false);
  };

  const renderContactInfo = () => {
    if (!contact) return null;
    
    return (
      <div>
        {/* Status Badges */}
        <div className="mb-3">
          <StatusBadge 
            status={contact.status} 
          />
          {contact.type.map((type, index) => (
            <Badge key={index} bg="info" className="me-1">
              {type}
            </Badge>
          ))}
        </div>
        
        {/* Basic Information */}
        <div className="mb-4">
          <SectionHeader title="Basic Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaUserCircle className="me-1" />Title</>}
              value={contact.title}
            />
            <InfoListItem 
              label={<><FaBriefcase className="me-1" />Position</>}
              value={contact.position}
            />
            {contact.department && (
              <InfoListItem 
                label={<><FaBuilding className="me-1" />Department</>}
                value={contact.department}
              />
            )}
            {contact.source && (
              <InfoListItem 
                label={<><FaGlobe className="me-1" />Lead Source</>}
                value={contact.source}
                isLast={true}
              />
            )}
          </InfoList>
        </div>

        {/* Contact Details */}
        <div className="mb-4">
          <SectionHeader title="Contact Details" />
          <InfoList>
            <InfoListItem 
              label={<><FaEnvelope className="me-1" />Email</>}
              value={contact.email}
            />
            <InfoListItem 
              label={<><FaPhone className="me-1" />Phone</>}
              value={contact.phone}
            />
            {contact.mobile && (
              <InfoListItem 
                label={<><FaMobile className="me-1" />Mobile</>}
                value={contact.mobile}
              />
            )}
            {contact.timezone && (
              <InfoListItem 
                label={<><FaClock className="me-1" />Timezone</>}
                value={contact.timezone}
              />
            )}
            {contact.preferredTime && (
              <InfoListItem 
                label={<><FaCog className="me-1" />Preferred Contact Time</>}
                value={contact.preferredTime}
                isLast={true}
              />
            )}
          </InfoList>
        </div>

        {/* Social Profiles */}
        {contact.socialProfiles && (Object.values(contact.socialProfiles).some(value => value)) && (
          <div className="mb-4">
            <SectionHeader title="Social Profiles" />
            <InfoList>
              {contact.socialProfiles.linkedin && (
                <InfoListItem 
                  label={<><FaLinkedin className="me-1" />LinkedIn</>}
                  value={
                    <a href={contact.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer">
                      {contact.socialProfiles.linkedin}
                    </a>
                  }
                />
              )}
              {contact.socialProfiles.twitter && (
                <InfoListItem 
                  label={<><FaTwitter className="me-1" />Twitter</>}
                  value={
                    <a href={contact.socialProfiles.twitter} target="_blank" rel="noopener noreferrer">
                      {contact.socialProfiles.twitter}
                    </a>
                  }
                />
              )}
              {contact.socialProfiles.facebook && (
                <InfoListItem 
                  label={<><FaFacebook className="me-1" />Facebook</>}
                  value={
                    <a href={contact.socialProfiles.facebook} target="_blank" rel="noopener noreferrer">
                      {contact.socialProfiles.facebook}
                    </a>
                  }
                  isLast={true}
                />
              )}
            </InfoList>
          </div>
        )}

        {/* Addresses */}
        <div className="mb-4">
          <SectionHeader title="Addresses" />
          <InfoList>
            {contact.mailingAddress && (
              <InfoListItem 
                label={<><FaMapMarkerAlt className="me-1" />Mailing Address</>}
                value={contact.mailingAddress}
              />
            )}
            {contact.otherAddress && (
              <InfoListItem 
                label={<><FaMapMarkerAlt className="me-1" />Other Address</>}
                value={contact.otherAddress}
                isLast={true}
              />
            )}
          </InfoList>
        </div>

        {/* Follow-up Dates */}
        <div className="mb-4">
          <SectionHeader title="Follow-up Information" />
          <InfoList>
            <InfoListItem 
              label={<><FaClock className="me-1" />Last Contact</>}
              value={new Date(contact.lastContact).toLocaleDateString('en-IE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              })}
            />
            {contact.nextFollowUp && (
              <InfoListItem 
                label={<><FaClock className="me-1" />Next Follow-up</>}
                value={new Date(contact.nextFollowUp).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
                isLast={true}
              />
            )}
          </InfoList>
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="mb-4">
            <SectionHeader title="Tags" />
            <div>
              {contact.tags.map((tag, index) => (
                <Badge key={index} bg="light" text="dark" className="me-1 mb-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="mb-4">
            <SectionHeader title="Notes" />
            <p className="mb-0">{contact.notes}</p>
          </div>
        )}
      </div>
    );
  };

  const renderCustomTabs = () => {
    return (
      <div>
        <Row>
          <Col md={6}>
            <h5 className="mb-3">Quick Stats</h5>
            <div className="d-flex flex-wrap gap-3">
              <Card className="bg-light" style={{ minWidth: '150px' }}>
                <Card.Body className="p-3">
                  <div className="text-muted small">Total Deals</div>
                  <h3 className="mb-0">2</h3>
                </Card.Body>
              </Card>
            </div>
          </Col>
          <Col md={6}>
            <h5 className="mb-3">Notes</h5>
            <div className="note-item border-bottom pb-3 mb-3">
              <div className="d-flex align-items-start">
                <div className="me-2">
                  <img
                    src="https://via.placeholder.com/32"
                    className="rounded-circle"
                    alt="User"
                    width="32"
                    height="32"
                  />
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">Hisham Sait</strong>
                    <small className="text-muted">Sep 15, 2023, 03:00 PM</small>
                  </div>
                  <p className="mb-1">Here is a sample note for you!</p>
                  <p className="text-muted small mb-0">
                    ★ Notes are a great way to capture key information about your Contact/Deal internally.<br />
                    ★ Type "@" to mention fellow users in your organization and start a discussion right from a note.
                  </p>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    );
  };

  return (
    <>
      <DetailedView
        title={contact ? `${contact.title} ${contact.firstName} ${contact.lastName}` : 'Contact Details'}
        subtitle={contact ? `${contact.position} at ${contact.department || 'N/A'}` : ''}
        entityType="contact"
        onBack={() => navigate('/crm/contacts')}
        onEdit={() => setShowEditModal(true)}
        renderInfo={renderContactInfo}
        renderTabs={renderCustomTabs}
        loading={loading}
        activities={activities}
        activitiesLoading={activitiesLoading}
      />

      {contact && (
        <ContactModal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          contact={contact}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
};

export default ContactView;
