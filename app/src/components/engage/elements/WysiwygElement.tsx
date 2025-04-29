import React from 'react';
import { Card } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface WysiwygElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface WysiwygElementData {
  id: string;
  type: string;
  label: string;
  content?: string;
  height?: string;
  toolbar?: string[];
  placeholder?: string;
  required: boolean;
  description?: string;
}

const WysiwygElement: React.FC<WysiwygElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('wysiwyg')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaEdit /></div>
        <div className="element-label">WYSIWYG</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a WYSIWYG element
export const getWysiwygElementProperties = (): Partial<WysiwygElementData> => {
  return {
    type: 'wysiwyg',
    label: 'WYSIWYG Editor',
    content: '',
    height: '300px',
    toolbar: ['bold', 'italic', 'underline', 'link', 'unlink', 'image', 'bullist', 'numlist', 'h1', 'h2', 'h3'],
    placeholder: 'Enter content here...',
    required: false,
    description: ''
  };
};

export default WysiwygElement;
