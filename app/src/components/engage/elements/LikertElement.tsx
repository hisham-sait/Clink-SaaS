import React from 'react';
import { Card } from 'react-bootstrap';
import { FaThList } from 'react-icons/fa';

interface LikertElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

const LikertElement: React.FC<LikertElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('likert')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaThList /></div>
        <div className="element-label">Likert</div>
      </Card.Body>
    </Card>
  );
};

export default LikertElement;
