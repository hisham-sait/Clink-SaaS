import React from 'react';
import { Card } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface SocialElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label?: string;
}

export interface SocialElementData {
  id: string;
  type: string;
  label: string;
  links?: SocialLink[];
  displayStyle?: 'icons' | 'buttons' | 'text';
  iconSize?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
  showLabels?: boolean;
  openInNewTab?: boolean;
  required: boolean;
  description?: string;
}

const SocialElement: React.FC<SocialElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('social')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaShareAlt /></div>
        <div className="element-label">Social Links</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a social element
export const getSocialElementProperties = (): Partial<SocialElementData> => {
  return {
    type: 'social',
    label: 'Social Media Links',
    links: [
      { platform: 'facebook', url: '', icon: 'facebook', label: 'Facebook' },
      { platform: 'twitter', url: '', icon: 'twitter', label: 'Twitter' },
      { platform: 'instagram', url: '', icon: 'instagram', label: 'Instagram' },
      { platform: 'linkedin', url: '', icon: 'linkedin', label: 'LinkedIn' }
    ],
    displayStyle: 'icons',
    iconSize: 'md',
    alignment: 'center',
    showLabels: false,
    openInNewTab: true,
    required: false,
    description: ''
  };
};

export default SocialElement;
