import React from 'react';
import { Card } from 'react-bootstrap';
import { FaLink } from 'react-icons/fa';

interface ButtonElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Button Element component for the element palette
 * This component is used to add a new button element to a page
 */
const ButtonElement: React.FC<ButtonElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('button')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="button-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <FaLink className="mb-1" />
        </div>
        <div className="element-label">Button</div>
      </Card.Body>
    </Card>
  );
};

export default ButtonElement;
