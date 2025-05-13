import React from 'react';
import { Form } from 'react-bootstrap';
import { componentStyles } from '../componentStyles';

interface DimensionInputProps {
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  label?: string;
  placeholder?: string;
  units?: string[];
}

/**
 * A compact dimension input component with value and unit selector
 * Shared across all element types
 */
const DimensionInput: React.FC<DimensionInputProps> = ({ 
  name, 
  value = '', 
  onChange, 
  label, 
  placeholder = 'Enter value', 
  units = ['px', '%', 'em', 'rem', 'auto']
}) => {
  // Parse the value and unit
  const parseValue = (): { numValue: string; unit: string } => {
    if (!value || value === 'auto') {
      return { numValue: '', unit: 'auto' };
    }
    
    // Match a number followed by a unit
    const match = value.match(/^([\d.]+)(.*)$/);
    
    if (match) {
      return { numValue: match[1], unit: match[2] || 'px' };
    }
    
    return { numValue: '', unit: 'px' };
  };
  
  const { numValue, unit } = parseValue();
  
  // Handle value change
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Create a synthetic event with the combined value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: unit === 'auto' ? 'auto' : `${newValue}${unit}`
      }
    };
    
    onChange(syntheticEvent as any);
  };
  
  // Handle unit change
  const handleUnitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = e.target.value;
    
    // Create a synthetic event with the combined value
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value: newUnit === 'auto' ? 'auto' : `${numValue}${newUnit}`
      }
    };
    
    onChange(syntheticEvent as any);
  };
  
  return (
    <div style={componentStyles.formGroup}>
      {label && <div style={componentStyles.inlineLabel}>{label}</div>}
      <div style={componentStyles.unitInput}>
        <Form.Control
          type="text"
          value={unit === 'auto' ? '' : numValue}
          onChange={handleValueChange}
          placeholder={placeholder}
          style={componentStyles.valueInput}
          size="sm"
          disabled={unit === 'auto'}
        />
        <Form.Select
          value={unit}
          onChange={handleUnitChange}
          style={componentStyles.unitSelect}
          size="sm"
        >
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Form.Select>
      </div>
    </div>
  );
};

export default DimensionInput;
