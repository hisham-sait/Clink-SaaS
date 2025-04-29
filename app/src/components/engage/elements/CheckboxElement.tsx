import React from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';
import { FaCheckSquare, FaPlus, FaTrash } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';
import { FormElement } from './TextFieldElement';

interface CheckboxElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

const CheckboxElement: React.FC<CheckboxElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('checkbox')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaCheckSquare /></div>
        <div className="element-label">Checkbox</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a checkbox element
export const getCheckboxProperties = (): Partial<FormElement> => {
  return {
    type: 'checkbox',
    label: 'Checkbox Group',
    required: false,
    description: '',
    options: ['Option 1', 'Option 2', 'Option 3']
  };
};

// Render the properties UI for a checkbox element
export const renderCheckboxPropertiesUI = (
  element: FormElement, 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  onOptionChange: (index: number, value: string) => void,
  onAddOption: () => void,
  onRemoveOption: (index: number) => void
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
      
      <div style={propertyStyles.sectionHeader}>Options</div>
      
      {element.options?.map((option, index) => (
        <div key={index} style={propertyStyles.optionRow}>
          <Form.Control 
            type="text"
            value={option}
            onChange={(e) => onOptionChange(index, e.target.value)}
            style={{...propertyStyles.formControl, flex: 1, marginRight: '4px'}}
          />
          <Button 
            variant="outline-danger" 
            size="sm"
            onClick={() => onRemoveOption(index)}
            disabled={element.options?.length === 1}
            style={propertyStyles.optionButton}
          >
            <FaTrash size={10} />
          </Button>
        </div>
      ))}
      
      <Button 
        variant="outline-primary" 
        size="sm" 
        onClick={onAddOption}
        className="mt-2 mb-3"
        style={propertyStyles.actionButton}
      >
        <FaPlus size={10} className="me-1" /> Add Option
      </Button>
      
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

export default CheckboxElement;
