import React from 'react';
import { Card } from 'react-bootstrap';
import { FaWpforms } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface FormElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface FormElementData {
  id: string;
  type: string;
  label: string;
  formId?: string;
  displayType?: 'full' | 'modal';
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  modalTitle?: string;
  modalSize?: 'sm' | 'lg' | 'xl';
  required: boolean;
  description?: string;
}

const FormElement: React.FC<FormElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('form')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaWpforms /></div>
        <div className="element-label">Form</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a form element
export const getFormElementProperties = (): Partial<FormElementData> => {
  return {
    type: 'form',
    label: 'Form Element',
    formId: '',
    displayType: 'full',
    buttonText: 'Open Form',
    buttonStyle: 'primary',
    modalTitle: 'Form',
    modalSize: 'lg',
    required: false,
    description: ''
  };
};

export default FormElement;
