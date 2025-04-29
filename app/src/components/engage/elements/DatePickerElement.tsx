import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';
import { FormElement } from './TextFieldElement';

interface DatePickerElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

const DatePickerElement: React.FC<DatePickerElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('date')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaCalendarAlt /></div>
        <div className="element-label">Date</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a date picker element
export const getDatePickerProperties = (): Partial<FormElement> => {
  return {
    type: 'date',
    label: 'Date',
    required: false,
    description: ''
  };
};

// Render the properties UI for a date picker element
export const renderDatePickerPropertiesUI = (
  element: FormElement, 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
) => {
  return (
    <>
      <Form.Group style={propertyStyles.formGroup}>
        <Form.Label style={propertyStyles.label}>Label</Form.Label>
        <Form.Control 
          type="text" 
          name="label"
          value={element.label}
          onChange={onChange}
          style={propertyStyles.formControl}
        />
      </Form.Group>
      
      <Form.Group style={propertyStyles.formGroup}>
        <Form.Label style={propertyStyles.label}>Description</Form.Label>
        <Form.Control 
          as="textarea"
          rows={2}
          name="description"
          value={element.description || ''}
          onChange={onChange}
          placeholder="Optional description"
          style={propertyStyles.textarea}
        />
        <Form.Text className="text-muted" style={propertyStyles.helpText}>
          Displays below the label
        </Form.Text>
      </Form.Group>
      
      <Form.Group style={propertyStyles.formGroup}>
        <Form.Check 
          type="checkbox"
          id={`element-required-${element.id}`}
          label="Required field"
          name="required"
          checked={element.required}
          onChange={onChange}
        />
      </Form.Group>
    </>
  );
};

export default DatePickerElement;
