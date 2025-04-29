import React from 'react';
import { Card } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface ImageElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface ImageElementData {
  id: string;
  type: string;
  label: string;
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
  alignment?: 'left' | 'center' | 'right';
  caption?: string;
  required: boolean;
  description?: string;
}

const ImageElement: React.FC<ImageElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('image')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaImage /></div>
        <div className="element-label">Image</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for an image element
export const getImageElementProperties = (): Partial<ImageElementData> => {
  return {
    type: 'image',
    label: 'Image Element',
    src: '',
    alt: 'Image description',
    width: '100%',
    height: 'auto',
    alignment: 'center',
    caption: '',
    required: false,
    description: ''
  };
};

export default ImageElement;
