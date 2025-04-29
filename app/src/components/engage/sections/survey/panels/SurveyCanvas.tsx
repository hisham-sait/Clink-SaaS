import React from 'react';
import { Card, Button, Col, Form, Dropdown } from 'react-bootstrap';
import { FaCode, FaPlus } from 'react-icons/fa';

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

interface SurveyAppearance {
  backgroundColor: string;
  backgroundImage: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderRadius: string;
  boxShadow: string;
  headerAlignment: string;
  buttonStyle: string;
  sectionTitleColor: string;
  sectionDividerColor: string;
  questionSpacing: string;
}

interface SurveyCanvasProps {
  sections: SurveySection[];
  selectedSection: SurveySection;
  selectedQuestion: SurveyQuestion | null;
  surveyAppearance: SurveyAppearance;
  onSectionSelect: (section: SurveySection) => void;
  onQuestionSelect: (question: SurveyQuestion) => void;
  onAddSection: () => void;
  onAddQuestion: (type: string) => void;
  renderQuestionPreview: (question: SurveyQuestion) => React.ReactNode;
}

const SurveyCanvas: React.FC<SurveyCanvasProps> = ({
  sections,
  selectedSection,
  selectedQuestion,
  surveyAppearance,
  onSectionSelect,
  onQuestionSelect,
  onAddSection,
  onAddQuestion,
  renderQuestionPreview
}) => {
  // Generate CSS for canvas based on appearance settings
  const getCanvasStyle = () => {
    return {
      backgroundColor: surveyAppearance.backgroundColor,
      backgroundImage: surveyAppearance.backgroundImage ? `url(${surveyAppearance.backgroundImage})` : 'none',
      fontFamily: surveyAppearance.fontFamily,
      color: surveyAppearance.textColor,
      borderRadius: surveyAppearance.borderRadius,
      boxShadow: surveyAppearance.boxShadow
    };
  };

  const getSectionTitleStyle = () => {
    return {
      color: surveyAppearance.sectionTitleColor
    };
  };

  const getSectionStyle = () => {
    return {
      borderBottom: `1px solid ${surveyAppearance.sectionDividerColor}`,
      marginBottom: '15px'
    };
  };

  const getQuestionStyle = () => {
    return {
      marginBottom: surveyAppearance.questionSpacing
    };
  };

  const getButtonStyle = () => {
    return {
      backgroundColor: surveyAppearance.primaryColor,
      borderColor: surveyAppearance.primaryColor
    };
  };

  // Question types for dropdown
  const questionTypes = [
    { type: 'text', label: 'Text Field' },
    { type: 'textarea', label: 'Text Area' },
    { type: 'checkbox', label: 'Multiple Choice (Checkbox)' },
    { type: 'radio', label: 'Single Choice (Radio)' },
    { type: 'select', label: 'Dropdown' },
    { type: 'scale', label: 'Rating Scale' },
    { type: 'likert', label: 'Likert Scale' },
    { type: 'date', label: 'Date Picker' },
    { type: 'file', label: 'File Upload' }
  ];

  return (
    <Col md={6}>
      <Card className="form-canvas" style={getCanvasStyle()}>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Survey Layout</h5>
            <div>
              <Button variant="link" className="p-0 text-decoration-none me-3">
                <FaCode className="me-1" /> View Code
              </Button>
              <Button 
                variant="primary" 
                size="sm"
                onClick={onAddSection}
                style={getButtonStyle()}
              >
                <FaPlus className="me-1" /> Add Section
              </Button>
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-4">
          {sections.length === 0 ? (
            <div className="text-center p-5 border rounded bg-light">
              <p className="mb-0">Add a section to start building your survey</p>
            </div>
          ) : (
            <div>
              {sections.map((section) => (
                <Card 
                  key={section.id} 
                  className={`mb-4 ${selectedSection.id === section.id ? 'border-primary' : ''}`}
                  onClick={() => onSectionSelect(section)}
                  style={getCanvasStyle()}
                >
                  <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0" style={getSectionTitleStyle()}>{section.title}</h5>
                      <div>
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="outline-secondary" 
                            size="sm"
                            id={`dropdown-add-question-${section.id}`}
                          >
                            <FaPlus className="me-1" /> Add Question
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {questionTypes.map((question) => (
                              <Dropdown.Item 
                                key={question.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSectionSelect(section);
                                  onAddQuestion(question.type);
                                }}
                              >
                                {question.label}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {section.description && <p className="text-muted" style={getSectionStyle()}>{section.description}</p>}
                    
                    {section.questions.length === 0 ? (
                      <div className="text-center p-4 border rounded bg-light">
                        <p className="mb-0">No questions yet. Click "Add Question" to start building your survey.</p>
                      </div>
                    ) : (
                      <div>
                        {section.questions.map((question) => (
                          <div 
                            key={question.id} 
                            className={`p-3 mb-3 border rounded ${selectedQuestion?.id === question.id ? 'border-primary' : 'border-light'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onQuestionSelect(question);
                            }}
                            style={getQuestionStyle()}
                          >
                            {renderQuestionPreview(question)}
                          </div>
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );
};

export default SurveyCanvas;
