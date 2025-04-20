import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaRegStar } from 'react-icons/fa';

interface ScaleElementProps {
  onAdd: (type: string) => void;
}

const ScaleElement: React.FC<ScaleElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('scale')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaRegStar /></div>
      Rating Scale
    </ListGroup.Item>
  );
};

export default ScaleElement;
