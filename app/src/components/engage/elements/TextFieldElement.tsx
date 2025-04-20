import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaFont } from 'react-icons/fa';

interface TextFieldElementProps {
  onAdd: (type: string) => void;
}

const TextFieldElement: React.FC<TextFieldElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('text')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaFont /></div>
      Text Field
    </ListGroup.Item>
  );
};

export default TextFieldElement;
