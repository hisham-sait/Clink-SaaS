import React from 'react';
import { Card } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';

interface SocialElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Social Element component for the element palette
 * This component is used to add a new social media links element to a page
 */
const SocialElement: React.FC<SocialElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('social')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="social-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <FaShareAlt className="mb-1" />
        </div>
        <div className="element-label">Social Links</div>
      </Card.Body>
    </Card>
  );
};

export default SocialElement;
