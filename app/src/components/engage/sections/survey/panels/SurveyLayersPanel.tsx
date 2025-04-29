import React from 'react';
import { Accordion, Button, ListGroup, Card } from 'react-bootstrap';
import { FaLayerGroup, FaArrowUp, FaArrowDown, FaClone, FaTrash, FaFolder, FaFolderOpen } from 'react-icons/fa';

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

interface SurveyLayersPanelProps {
  sections: SurveySection[];
  selectedSection: SurveySection | null;
  selectedQuestion: SurveyQuestion | null;
  onSectionSelect: (section: SurveySection) => void;
  onQuestionSelect: (question: SurveyQuestion) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveQuestion: (questionId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneQuestion: (questionId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteQuestion: (questionId: string) => void;
}

const SurveyLayersPanel: React.FC<SurveyLayersPanelProps> = ({
  sections,
  selectedSection,
  selectedQuestion,
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
    <Accordion.Item eventKey="1">
      <Accordion.Header>
        <div className="d-flex align-items-center">
          <FaLayerGroup className="me-2" />
          <span>Layers</span>
        </div>
      </Accordion.Header>
      <Accordion.Body className="p-1">
        {sections.length === 0 ? (
          <div className="text-center p-2 text-muted">
            <p className="mb-0">No sections added yet</p>
          </div>
        ) : (
          <ListGroup variant="flush" className="layers-list">
            {sections.map((section, sectionIndex) => (
              <Card key={section.id} className="mb-2 border">
                <Card.Header 
                  className={`py-1 px-2 d-flex justify-content-between align-items-center ${selectedSection?.id === section.id && !selectedQuestion ? 'bg-primary text-white' : 'bg-light'}`}
                  onClick={() => onSectionSelect(section)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    {selectedSection?.id === section.id ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
                    <span>{section.title}</span>
                  </div>
                  <div className="section-actions">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={`p-0 me-1 ${selectedSection?.id === section.id && !selectedQuestion ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onMoveSection(section.id, 'up'); 
                      }}
                      disabled={sectionIndex === 0}
                      title="Move Up"
                    >
                      <FaArrowUp />
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={`p-0 me-1 ${selectedSection?.id === section.id && !selectedQuestion ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onMoveSection(section.id, 'down'); 
                      }}
                      disabled={sectionIndex === sections.length - 1}
                      title="Move Down"
                    >
                      <FaArrowDown />
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={`p-0 me-1 ${selectedSection?.id === section.id && !selectedQuestion ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onCloneSection(section.id); 
                      }}
                      title="Clone"
                    >
                      <FaClone />
                    </Button>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={`p-0 ${selectedSection?.id === section.id && !selectedQuestion ? 'text-white' : 'text-danger'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onDeleteSection(section.id); 
                      }}
                      disabled={sections.length <= 1}
                      title="Delete"
                    >
                      <FaTrash />
                    </Button>
                  </div>
                </Card.Header>
                {section.questions.length > 0 && (
                  <ListGroup variant="flush">
                    {section.questions.map((question, questionIndex) => (
                      <ListGroup.Item 
                        key={question.id}
                        action
                        active={selectedQuestion?.id === question.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuestionSelect(question);
                        }}
                        className="d-flex justify-content-between align-items-center py-1 px-2 element-item"
                      >
                        <div className="element-info">
                          <div className="element-type small text-muted">{question.type}</div>
                          <div className="element-label">{question.question}</div>
                        </div>
                        <div className="element-actions">
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onMoveQuestion(question.id, 'up'); 
                            }}
                            disabled={questionIndex === 0}
                            title="Move Up"
                          >
                            <FaArrowUp />
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onMoveQuestion(question.id, 'down'); 
                            }}
                            disabled={questionIndex === section.questions.length - 1}
                            title="Move Down"
                          >
                            <FaArrowDown />
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onCloneQuestion(question.id); 
                            }}
                            title="Clone"
                          >
                            <FaClone />
                          </Button>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 text-danger" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onDeleteQuestion(question.id); 
                            }}
                            title="Delete"
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                {section.questions.length === 0 && (
                  <Card.Body className="py-1 px-2 text-muted small">
                    <p className="mb-0">No questions in this section</p>
                  </Card.Body>
                )}
              </Card>
            ))}
          </ListGroup>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
};

export default SurveyLayersPanel;
