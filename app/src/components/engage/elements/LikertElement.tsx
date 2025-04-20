import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaThumbsUp } from 'react-icons/fa';

interface LikertElementProps {
  onAdd: (type: string) => void;
}

const LikertElement: React.FC<LikertElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('likert')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaThumbsUp /></div>
      Likert Scale
    </ListGroup.Item>
  );
};

export default LikertElement;
