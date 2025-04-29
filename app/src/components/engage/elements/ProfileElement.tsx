import React from 'react';
import { Card } from 'react-bootstrap';
import { FaUserCircle } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface ProfileElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface ProfileElementData {
  id: string;
  type: string;
  label: string;
  name?: string;
  title?: string;
  bio?: string;
  avatarUrl?: string;
  showAvatar?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  avatarShape?: 'circle' | 'square' | 'rounded';
  email?: string;
  phone?: string;
  showSocial?: boolean;
  socialLinks?: {
    platform: string;
    url: string;
    icon: string;
  }[];
  required: boolean;
  description?: string;
}

const ProfileElement: React.FC<ProfileElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('profile')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaUserCircle /></div>
        <div className="element-label">Profile</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a profile element
export const getProfileElementProperties = (): Partial<ProfileElementData> => {
  return {
    type: 'profile',
    label: 'Profile Element',
    name: 'John Doe',
    title: 'Job Title',
    bio: 'Short biography or description',
    avatarUrl: '',
    showAvatar: true,
    avatarSize: 'md',
    avatarShape: 'circle',
    email: 'email@example.com',
    phone: '+1 (555) 123-4567',
    showSocial: true,
    socialLinks: [
      { platform: 'linkedin', url: '', icon: 'linkedin' },
      { platform: 'twitter', url: '', icon: 'twitter' }
    ],
    required: false,
    description: ''
  };
};

export default ProfileElement;
