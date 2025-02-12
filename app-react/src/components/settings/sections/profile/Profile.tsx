import React, { useState, useEffect } from 'react';
import { Button, Card, Row, Col } from 'react-bootstrap';
import EditProfileModal from './EditProfileModal';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  jobTitle?: string;
  department?: string;
  bio?: string;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // TODO: Replace with actual API call
  useEffect(() => {
    // Simulated profile data
    setProfile({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+353 1234 5678',
      jobTitle: 'Software Engineer',
      department: 'Engineering',
      bio: 'Experienced software engineer with a passion for building great products.'
    });
  }, []);

  const handleEditProfile = (updatedProfile: UserProfile) => {
    // TODO: Replace with actual API call
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  if (!profile) return null;

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Profile Settings</h1>
          <p className="text-muted mb-0">Manage your personal information and preferences</p>
        </div>
        <Button 
          variant="primary"
          className="d-inline-flex align-items-center gap-2"
          onClick={() => setShowEditModal(true)}
        >
          <i className="bi bi-pencil"></i>
          <span>Edit Profile</span>
        </Button>
      </div>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Full Name</div>
                  <h3 className="mb-0">{profile.firstName} {profile.lastName}</h3>
                  <small className="text-muted">Primary contact</small>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <i className="bi bi-person text-primary" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Department</div>
                  <h3 className="mb-0">{profile.department || '-'}</h3>
                  <small className="text-muted">Team assignment</small>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <i className="bi bi-diagram-3 text-success" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Role</div>
                  <h3 className="mb-0">{profile.jobTitle || '-'}</h3>
                  <small className="text-muted">Current position</small>
                </div>
                <div className="bg-info bg-opacity-10 p-3 rounded">
                  <i className="bi bi-briefcase text-info" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Contact</div>
                  <h3 className="mb-0">2</h3>
                  <small className="text-muted">Contact methods</small>
                </div>
                <div className="bg-warning bg-opacity-10 p-3 rounded">
                  <i className="bi bi-envelope text-warning" style={{ fontSize: '24px' }}></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Personal Information */}
      <Card className="mb-4">
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Personal Information</h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={6}>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">First Name</div>
                <p className="mb-0">{profile.firstName}</p>
              </div>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">Last Name</div>
                <p className="mb-0">{profile.lastName}</p>
              </div>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">Email</div>
                <p className="mb-0">{profile.email}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">Phone</div>
                <p className="mb-0">{profile.phone || 'Not provided'}</p>
              </div>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">Job Title</div>
                <p className="mb-0">{profile.jobTitle || 'Not provided'}</p>
              </div>
              <div className="mb-4">
                <div className="text-uppercase small fw-semibold text-secondary mb-2">Department</div>
                <p className="mb-0">{profile.department || 'Not provided'}</p>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Bio */}
      <Card>
        <Card.Header className="bg-white py-3">
          <h5 className="mb-0">Bio</h5>
        </Card.Header>
        <Card.Body>
          <p className="mb-0">{profile.bio || 'No bio provided'}</p>
        </Card.Body>
      </Card>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          profile={profile}
          onSave={handleEditProfile}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
