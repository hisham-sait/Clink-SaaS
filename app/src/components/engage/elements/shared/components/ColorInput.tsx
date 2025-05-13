import React from 'react';
import { Form } from 'react-bootstrap';
import { componentStyles } from '../componentStyles';

interface ColorInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * A compact color input component with color picker and text input
 * Shared across all element types
 */
const ColorInput: React.FC<ColorInputProps> = ({ 
  name, 
  value, 
  onChange, 
  label, 
  placeholder = 'Enter color',
  disabled = false
}) => {
  return (
    <div style={componentStyles.formGroup}>
      {label && <div style={componentStyles.inlineLabel}>{label}</div>}
      <div style={componentStyles.compactColorControl}>
        <Form.Control
          type="color"
          name={name}
          value={value || '#000000'}
          onChange={onChange}
          style={componentStyles.colorSwatch}
          size="sm"
          disabled={disabled}
        />
        <Form.Control
          type="text"
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          style={componentStyles.colorText}
          size="sm"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ColorInput;
