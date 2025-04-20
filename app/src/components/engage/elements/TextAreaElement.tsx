import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaGripLines } from 'react-icons/fa';

interface TextAreaElementProps {
  onAdd: (type: string) => void;
}

const TextAreaElement: React.FC<TextAreaElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('textarea')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaGripLines /></div>
      Text Area
    </ListGroup.Item>
  );
};

export default TextAreaElement;
