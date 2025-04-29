import React from 'react';
import { Card } from 'react-bootstrap';
import { FaSlidersH } from 'react-icons/fa';

interface ScaleElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

const ScaleElement: React.FC<ScaleElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('scale')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaSlidersH /></div>
        <div className="element-label">Scale</div>
      </Card.Body>
    </Card>
  );
};

export default ScaleElement;
