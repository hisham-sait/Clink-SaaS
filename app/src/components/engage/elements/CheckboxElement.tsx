import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';

interface CheckboxElementProps {
  onAdd: (type: string) => void;
}

const CheckboxElement: React.FC<CheckboxElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('checkbox')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaCheck /></div>
      Checkbox
    </ListGroup.Item>
  );
};

export default CheckboxElement;
