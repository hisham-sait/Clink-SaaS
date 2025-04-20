import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaList } from 'react-icons/fa';

interface SelectElementProps {
  onAdd: (type: string) => void;
}

const SelectElement: React.FC<SelectElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('select')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaList /></div>
      Dropdown
    </ListGroup.Item>
  );
};

export default SelectElement;
