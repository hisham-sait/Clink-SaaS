import React from 'react';
import { Card } from 'react-bootstrap';
import { FaHeading } from 'react-icons/fa';

interface TextElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

/**
 * Text Element component for the element palette
 * This component is used to add a new text element to a page
 */
const TextElement: React.FC<TextElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('text')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
      data-testid="text-element-card"
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon">
          <div className="d-flex flex-column align-items-center">
            <FaHeading className="mb-1" style={{ fontSize: '0.8rem' }} />
          </div>
        </div>
        <div className="element-label">Text</div>
      </Card.Body>
    </Card>
  );
};

export default TextElement;
