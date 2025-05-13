import React from 'react';
import { Card } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';

interface ProfileElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Profile Element component for the element palette
 * This component is used to add a new profile element to a page
 */
const ProfileElement: React.FC<ProfileElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('profile')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="profile-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <FaUserCircle className="mb-1" />
        </div>
        <div className="element-label">Profile</div>
      </Card.Body>
    </Card>
  );
};

export default ProfileElement;
