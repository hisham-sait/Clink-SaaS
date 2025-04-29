import React from 'react';
import { Card, Form } from 'react-bootstrap';
import { FaFont } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface TextFieldElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

const TextFieldElement: React.FC<TextFieldElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('text')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaFont /></div>
        <div className="element-label">Text</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a text field element
export const getTextFieldProperties = (): Partial<FormElement> => {
  return {
    type: 'text',
    label: 'Text Field',
    placeholder: 'Enter text',
    required: false,
    description: ''
  };
};

// Render the properties UI for a text field element
export const renderTextFieldPropertiesUI = (
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

export default TextFieldElement;
