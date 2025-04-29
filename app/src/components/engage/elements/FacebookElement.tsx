import React from 'react';
import { Card } from 'react-bootstrap';
import { FaFacebook } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface FacebookElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface FacebookElementData {
  id: string;
  type: string;
  label: string;
  embedType?: 'post' | 'video' | 'page' | 'comment';
  embedCode?: string;
  url?: string;
  width?: string;
  height?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  smallHeader?: boolean;
  adaptWidth?: boolean;
  lazy?: boolean;
  required: boolean;
  description?: string;
}

const FacebookElement: React.FC<FacebookElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('facebook')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaFacebook /></div>
        <div className="element-label">Facebook</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a Facebook element
export const getFacebookElementProperties = (): Partial<FacebookElementData> => {
  return {
    type: 'facebook',
    label: 'Facebook Embed',
    embedType: 'post',
    embedCode: '',
    url: '',
    width: '500',
    height: 'auto',
    showHeader: true,
    showFooter: true,
    smallHeader: false,
    adaptWidth: true,
    lazy: true,
    required: false,
    description: ''
  };
};

export default FacebookElement;
