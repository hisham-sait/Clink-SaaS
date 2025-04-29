import React from 'react';
import { Col, Accordion } from 'react-bootstrap';
import SurveyElements from '../../../elements/SurveyElements';
import SurveyLayersPanel from './SurveyLayersPanel';

interface SurveyQuestion {
  id: string;
  type: string;
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveyElementsPanelProps {
  sections: SurveySection[];
  selectedSection: SurveySection | null;
  selectedQuestion: SurveyQuestion | null;
  onAddElement: (type: string) => void;
  onSectionSelect: (section: SurveySection) => void;
  onQuestionSelect: (question: SurveyQuestion) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneQuestion: (questionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const SurveyElementsPanel: React.FC<SurveyElementsPanelProps> = ({
  sections,
  selectedSection,
  selectedQuestion,
  onAddElement,
  onSectionSelect,
  onQuestionSelect,
  onMoveSection,
  onMoveQuestion,
  onCloneSection,
  onCloneQuestion,
  onDeleteSection,
  onDeleteQuestion
}) => {
  return (
    <Col md={3}>
      {/* Elements Panel */}
      <SurveyElements onAddElement={onAddElement} />
      
      {/* Layers Panel - Separate Accordion */}
      <Accordion defaultActiveKey="1" className="mb-3">
        <SurveyLayersPanel
          sections={sections}
          selectedSection={selectedSection}
          selectedQuestion={selectedQuestion}
          onSectionSelect={onSectionSelect}
          onQuestionSelect={onQuestionSelect}
          onMoveSection={onMoveSection}
          onMoveQuestion={onMoveQuestion}
          onCloneSection={onCloneSection}
          onCloneQuestion={onCloneQuestion}
          onDeleteSection={onDeleteSection}
          onDeleteQuestion={onDeleteQuestion}
        />
      </Accordion>
    </Col>
  );
};

export default SurveyElementsPanel;
