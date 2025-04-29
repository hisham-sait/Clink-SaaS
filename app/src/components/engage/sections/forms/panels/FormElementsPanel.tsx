import React from 'react';
import { Col, Accordion } from 'react-bootstrap';
import FormElements from '../../../elements/FormElements';
import FormLayersPanel from './FormLayersPanel';

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
}

interface FormElementsPanelProps {
  sections: FormSection[];
  selectedSection: FormSection;
  selectedElement: FormElement | null;
  onAddElement: (type: string) => void;
  onSectionSelect: (section: FormSection) => void;
  onElementSelect: (element: FormElement) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneElement: (elementId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const FormElementsPanel: React.FC<FormElementsPanelProps> = ({
  sections,
  selectedSection,
  selectedElement,
  onAddElement,
  onSectionSelect,
  onElementSelect,
  onMoveSection,
  onMoveElement,
  onCloneSection,
  onCloneElement,
  onDeleteSection,
  onDeleteElement
}) => {
  return (
    <Col md={3}>
      {/* Elements Panel */}
      <FormElements onAddElement={onAddElement} />
      
      {/* Layers Panel - Separate Accordion */}
      <Accordion defaultActiveKey="1" className="mb-3">
        <FormLayersPanel
          sections={sections}
          selectedSection={selectedSection}
          selectedElement={selectedElement}
          onSectionSelect={onSectionSelect}
          onElementSelect={onElementSelect}
          onMoveSection={onMoveSection}
          onMoveElement={onMoveElement}
          onCloneSection={onCloneSection}
          onCloneElement={onCloneElement}
          onDeleteSection={onDeleteSection}
          onDeleteElement={onDeleteElement}
        />
      </Accordion>
    </Col>
  );
};

export default FormElementsPanel;
