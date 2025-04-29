import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { FaAlignLeft } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';
import { FormElement } from './TextFieldElement';

interface TextAreaElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

const TextAreaElement: React.FC<TextAreaElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('textarea')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaAlignLeft /></div>
        <div className="element-label">Text Area</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a textarea element
export const getTextAreaProperties = (): Partial<FormElement> => {
  return {
    type: 'textarea',
    label: 'Text Area',
    placeholder: 'Enter text here',
    required: false,
    description: ''
  };
};

// Render the properties UI for a textarea element
export const renderTextAreaPropertiesUI = (
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
        <Form.Label style={propertyStyles.label}>Placeholder</Form.Label>
        <Form.Control 
          type="text"
          name="placeholder"
          value={element.placeholder || ''}
          onChange={onChange}
          placeholder="Enter placeholder text"
          style={propertyStyles.formControl}
        />
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

export default TextAreaElement;
