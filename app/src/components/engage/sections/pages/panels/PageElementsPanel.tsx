import React from 'react';
import { Col, Accordion } from 'react-bootstrap';
import PageElements from '../../../elements/PageElements';
import PageLayersPanel from './PageLayersPanel';

interface PageElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface PageSection {
  id: string;
  title: string;
  description?: string;
  elements: PageElement[];
}

interface PageElementsPanelProps {
  sections: PageSection[];
  selectedSection: PageSection;
  selectedElement: PageElement | null;
  onAddElement: (type: string) => void;
  onSectionSelect: (section: PageSection) => void;
  onElementSelect: (element: PageElement) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneElement: (elementId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const PageElementsPanel: React.FC<PageElementsPanelProps> = ({
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
      <PageElements onAddElement={onAddElement} />
      
      {/* Layers Panel - Separate Accordion */}
      <Accordion defaultActiveKey="1" className="mb-3">
        <PageLayersPanel
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

export default PageElementsPanel;
