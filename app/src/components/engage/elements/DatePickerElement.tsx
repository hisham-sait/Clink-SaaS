import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';

interface DatePickerElementProps {
  onAdd: (type: string) => void;
}

const DatePickerElement: React.FC<DatePickerElementProps> = ({ onAdd }) => {
  return (
    <ListGroup.Item 
      action
      onClick={() => onAdd('date')}
      className="d-flex align-items-center"
    >
      <div className="me-2"><FaCalendarAlt /></div>
      Date Picker
    </ListGroup.Item>
  );
};

export default DatePickerElement;
