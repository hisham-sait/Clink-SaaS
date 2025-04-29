import React from 'react';
import { Card } from 'react-bootstrap';
import { FaPoll } from 'react-icons/fa';
import { propertyStyles } from './propertyStyles';

interface SurveyElementProps {
  onAdd: (type: string) => void;
  size?: 'normal' | 'small' | 'tiny';
}

export interface SurveyElementData {
  id: string;
  type: string;
  label: string;
  surveyId?: string;
  displayType?: 'full' | 'modal';
  buttonText?: string;
  buttonStyle?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link';
  modalTitle?: string;
  modalSize?: 'sm' | 'lg' | 'xl';
  required: boolean;
  description?: string;
}

const SurveyElement: React.FC<SurveyElementProps> = ({ onAdd, size = 'normal' }) => {
  return (
    <Card 
      onClick={() => onAdd('survey')}
      className={`element-card element-${size} d-flex align-items-center justify-content-center`}
    >
      <Card.Body className="text-center p-2">
        <div className="element-icon"><FaPoll /></div>
        <div className="element-label">Survey</div>
      </Card.Body>
    </Card>
  );
};

// Default properties for a survey element
export const getSurveyElementProperties = (): Partial<SurveyElementData> => {
  return {
    type: 'survey',
    label: 'Survey Element',
    surveyId: '',
    displayType: 'full',
    buttonText: 'Take Survey',
    buttonStyle: 'primary',
    modalTitle: 'Survey',
    modalSize: 'lg',
    required: false,
    description: ''
  };
};

export default SurveyElement;
