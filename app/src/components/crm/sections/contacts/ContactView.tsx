import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Badge, Button, ButtonGroup, Tab, Table, Stack } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMobile, FaMapMarkerAlt, FaClock, FaTag, FaEdit, FaArrowLeft, 
  FaBriefcase, FaBuilding, FaGlobe, FaCog, FaLinkedin, FaTwitter, FaFacebook, FaUserCircle } from 'react-icons/fa';
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      const activitiesData = await getActivities(user.companyId, 'contact');
      const contactActivities = activitiesData.filter(a => a.entityId === id);
      setActivities(contactActivities);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-5">
        <h3>Contact not found</h3>
        <Button variant="link" onClick={() => navigate('/crm/contacts')}>
          <FaArrowLeft className="me-2" /> Back to Contacts
        </Button>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button variant="link" className="p-0 me-3" onClick={() => navigate('/crm/contacts')}>
            <FaArrowLeft className="text-primary" size={20} />
          </Button>
          <div>
            <h1 className="h3 mb-1">{`${contact.title} ${contact.firstName} ${contact.lastName}`}</h1>
            <p className="text-muted mb-0">{contact.position} at {contact.department || 'N/A'}</p>
          </div>
        </div>
        <div>
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            <FaEdit className="me-2" /> Edit Contact
          </Button>
        </div>
      </div>

      <Row>
        {/* Left Column - Contact Info */}
        <Col lg={3}>
          <Stack gap={2}>
            {/* Basic Information */}
            <div className="border-bottom pb-2">
              <div className="text-muted small mb-2">Basic Information</div>
              
              <div className="mb-2">
                <Badge bg={
                  contact.status === 'Active' ? 'success' :
                  contact.status === 'Inactive' ? 'warning' :
                  'secondary'
                } className="me-1">
                  {contact.status}
                </Badge>
                {contact.type.map((type, index) => (
                  <Badge key={index} bg="info" className="me-1">
                    {type}
                  </Badge>
                ))}
              </div>

              <div className="mb-2">
                <div className="text-muted small"><FaUserCircle className="me-1" />Title</div>
                <div>{contact.title}</div>
              </div>

              <div className="mb-2">
                <div className="text-muted small"><FaBriefcase className="me-1" />Position</div>
                <div>{contact.position}</div>
              </div>

              {contact.department && (
                <div className="mb-2">
                  <div className="text-muted small"><FaBuilding className="me-1" />Department</div>
                  <div>{contact.department}</div>
                </div>
              )}

              {contact.source && (
                <div className="mb-2">
                  <div className="text-muted small"><FaGlobe className="me-1" />Lead Source</div>
                  <div>{contact.source}</div>
                </div>
              )}
            </div>

            {/* Contact Details */}
            <div className="border-bottom pb-2">
              <div className="text-muted small mb-2">Contact Details</div>

              <div className="mb-2">
                <div className="text-muted small"><FaEnvelope className="me-1" />Email</div>
                <div>{contact.email}</div>
              </div>

              <div className="mb-2">
                <div className="text-muted small"><FaPhone className="me-1" />Phone</div>
                <div>{contact.phone}</div>
              </div>

              {contact.mobile && (
                <div className="mb-2">
                  <div className="text-muted small"><FaMobile className="me-1" />Mobile</div>
                  <div>{contact.mobile}</div>
                </div>
              )}

              {contact.timezone && (
                <div className="mb-2">
                  <div className="text-muted small"><FaClock className="me-1" />Timezone</div>
                  <div>{contact.timezone}</div>
                </div>
              )}

              {contact.preferredTime && (
                <div className="mb-2">
                  <div className="text-muted small"><FaCog className="me-1" />Preferred Contact Time</div>
                  <div>{contact.preferredTime}</div>
                </div>
              )}
            </div>

            {/* Social Profiles */}
            {contact.socialProfiles && (Object.values(contact.socialProfiles).some(value => value)) && (
              <div className="border-bottom pb-2">
                <div className="text-muted small mb-2">Social Profiles</div>
                
                {contact.socialProfiles.linkedin && (
                  <div className="mb-2">
                    <div className="text-muted small"><FaLinkedin className="me-1" />LinkedIn</div>
                    <div>
                      <a href={contact.socialProfiles.linkedin} target="_blank" rel="noopener noreferrer">
                        {contact.socialProfiles.linkedin}
                      </a>
                    </div>
                  </div>
                )}

                {contact.socialProfiles.twitter && (
                  <div className="mb-2">
                    <div className="text-muted small"><FaTwitter className="me-1" />Twitter</div>
                    <div>
                      <a href={contact.socialProfiles.twitter} target="_blank" rel="noopener noreferrer">
                        {contact.socialProfiles.twitter}
                      </a>
                    </div>
                  </div>
                )}

                {contact.socialProfiles.facebook && (
                  <div className="mb-2">
                    <div className="text-muted small"><FaFacebook className="me-1" />Facebook</div>
                    <div>
                      <a href={contact.socialProfiles.facebook} target="_blank" rel="noopener noreferrer">
                        {contact.socialProfiles.facebook}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Addresses */}
            <div className="border-bottom pb-2">
              <div className="text-muted small mb-2">Addresses</div>

              {contact.mailingAddress && (
                <div className="mb-2">
                  <div className="text-muted small"><FaMapMarkerAlt className="me-1" />Mailing Address</div>
                  <div>{contact.mailingAddress}</div>
                </div>
              )}

              {contact.otherAddress && (
                <div className="mb-2">
                  <div className="text-muted small"><FaMapMarkerAlt className="me-1" />Other Address</div>
                  <div>{contact.otherAddress}</div>
                </div>
              )}
            </div>

            {/* Follow-up Dates */}
            <div className="border-bottom pb-2">
              <div className="text-muted small mb-2">Follow-up Information</div>

              <div className="mb-2">
                <div className="text-muted small"><FaClock className="me-1" />Last Contact</div>
                <div>{new Date(contact.lastContact).toLocaleDateString('en-IE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</div>
              </div>

              {contact.nextFollowUp && (
                <div className="mb-2">
                  <div className="text-muted small"><FaClock className="me-1" />Next Follow-up</div>
                  <div>{new Date(contact.nextFollowUp).toLocaleDateString('en-IE', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}</div>
                </div>
              )}
            </div>

            {/* Tags */}
            {contact.tags.length > 0 && (
              <div className="border-bottom pb-2">
                <div className="text-muted small mb-2">Tags</div>
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
              <div className="pb-2">
                <div className="text-muted small mb-2">Notes</div>
                <p className="mb-0 small">{contact.notes}</p>
              </div>
            )}
          </Stack>
        </Col>

        {/* Right Column - Tabs */}
        <Col lg={9}>
          <div>
            <ButtonGroup className="mb-3">
              <Button variant="light" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
                Overview
              </Button>
              <Button variant="light" active={activeTab === 'timeline'} onClick={() => setActiveTab('timeline')}>
                Timeline
              </Button>
              <Button variant="light" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>
                Notes <Badge bg="secondary">1</Badge>
              </Button>
              <Button variant="light" active={activeTab === 'activities'} onClick={() => setActiveTab('activities')}>
                Activities
              </Button>
              <Button variant="light" active={activeTab === 'emails'} onClick={() => setActiveTab('emails')}>
                Emails
              </Button>
              <Button variant="light" active={activeTab === 'files'} onClick={() => setActiveTab('files')}>
                Files
              </Button>
            </ButtonGroup>

            <div>
              {activeTab === 'overview' && (
                <Card>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6 className="mb-3">Recent Activities</h6>
                        {activities.length > 0 ? (
                          <div className="timeline">
                            {activities.slice(0, 3).map((activity, index) => (
                              <div key={index} className="timeline-item border-start border-2 ps-3 pb-3">
                                <div className="mb-1">
                                  <strong>{activity.description}</strong>
                                </div>
                                <small className="text-muted">
                                  {new Date(activity.time).toLocaleString('en-IE', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </small>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No recent activities</p>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6 className="mb-3">Quick Stats</h6>
                        <div className="d-flex flex-wrap gap-3">
                          <Card className="bg-light" style={{ minWidth: '150px' }}>
                            <Card.Body className="p-3">
                              <div className="text-muted small">Total Deals</div>
                              <h3 className="mb-0">2</h3>
                            </Card.Body>
                          </Card>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'timeline' && (
                <Card>
                  <Card.Body>
                    {activities.length > 0 ? (
                      <div className="timeline">
                        {activities.map((activity, index) => (
                          <div key={index} className="timeline-item border-start border-2 ps-3 pb-3">
                            <div className="mb-1">
                              <strong>{activity.description}</strong>
                            </div>
                            <small className="text-muted">
                              {new Date(activity.time).toLocaleString('en-IE', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-center py-4 mb-0">No activities found</p>
                    )}
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'notes' && (
                <Card>
                  <Card.Body>
                    <div className="mb-3">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="What's this note about?"
                      />
                    </div>
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
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'activities' && (
                <Card>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="btn-group">
                        <Button variant="light" active>Tasks</Button>
                        <Button variant="light">Events</Button>
                        <Button variant="light">Calls</Button>
                      </div>
                      <div>
                        <Button variant="outline-primary" className="me-2">+ Task</Button>
                        <Button variant="outline-primary" className="me-2">+ Event</Button>
                        <Button variant="outline-primary">+ Call</Button>
                      </div>
                    </div>
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Task Name</th>
                            <th>Due Date</th>
                            <th>Status</th>
                            <th>Task Owner</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              <p className="text-muted mb-0">This record doesn't have any tasks.</p>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'emails' && (
                <Card>
                  <Card.Body>
                    <div className="table-responsive">
                      <Table hover className="align-middle">
                        <thead className="bg-light">
                          <tr>
                            <th>Subject</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Date</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan={5} className="text-center py-4">
                              <p className="text-muted mb-0">Looks like there aren't any emails to show.</p>
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {activeTab === 'files' && (
                <Card>
                  <Card.Body>
                    <div className="border-2 border-dashed rounded p-5 text-center">
                      <div className="mb-2">
                        <i className="bi bi-cloud-upload fs-2"></i>
                      </div>
                      <p className="mb-1">Drag a file here or <Button variant="link" className="p-0">Browse</Button> for a file to upload</p>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <ContactModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        contact={contact}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default ContactView;
