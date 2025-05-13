import React from 'react';
import { Card } from 'react-bootstrap';
import { FaImage } from 'react-icons/fa';

interface ImageElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Image Element component for the element palette
 * This component is used to add a new image element to a page
 */
const ImageElement: React.FC<ImageElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('image')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="image-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <FaImage className="mb-1" />
        </div>
        <div className="element-label">Image</div>
      </Card.Body>
    </Card>
  );
};

export default ImageElement;
