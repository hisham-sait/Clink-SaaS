import React from 'react';
import { Card } from 'react-bootstrap';
import { FaInstagram } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface InstagramElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface InstagramElementData {
  id: string;
  type: string;
  label: string;
  embedCode?: string;
  postUrl?: string;
  width?: string;
  height?: string;
  caption?: string;
  showCaption?: boolean;
  required: boolean;
  description?: string;
}

const InstagramElement: React.FC<InstagramElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('instagram')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaInstagram /></div>
        <div className="element-label">Instagram</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for an Instagram element
export const getInstagramElementProperties = (): Partial<InstagramElementData> => {
  return {
    type: 'instagram',
    label: 'Instagram Embed',
    embedCode: '',
    postUrl: '',
    width: '100%',
    height: 'auto',
    caption: '',
    showCaption: true,
    required: false,
    description: ''
  };
};

export default InstagramElement;
