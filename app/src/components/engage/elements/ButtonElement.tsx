import React from 'react';
import { Card } from 'react-bootstrap';
import { FaLink } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface ButtonElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface ButtonElementData {
  id: string;
  type: string;
  label: string;
  buttonText?: string;
  buttonType?: 'link' | 'submit' | 'reset';
  url?: string;
  target?: '_blank' | '_self';
  buttonStyle?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  buttonSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: string;
  required: boolean;
  description?: string;
}

const ButtonElement: React.FC<ButtonElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('button')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaLink /></div>
        <div className="element-label">Button</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a button element
export const getButtonElementProperties = (): Partial<ButtonElementData> => {
  return {
    type: 'button',
    label: 'Button Element',
    buttonText: 'Click Me',
    buttonType: 'link',
    url: '#',
    target: '_self',
    buttonStyle: 'primary',
    buttonSize: 'md',
    fullWidth: false,
    icon: '',
    required: false,
    description: ''
  };
};

export default ButtonElement;
