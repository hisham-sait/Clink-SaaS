import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaList } from 'react-icons/fa';

interface RadioElementProps {
  onAdd: (type: string) => void;
}

const RadioElement: React.FC<RadioElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('radio')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaList /></div>
      Radio Buttons
    </ListGroup.Item>
  );
};

export default RadioElement;
