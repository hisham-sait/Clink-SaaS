import React from 'react';
import { Accordion, Button, Col, Form } from 'react-bootstrap';
import { FaCog, FaSlidersH, FaPalette, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import SurveyAppearanceSettings from './SurveyAppearanceSettings';
import { SurveyQuestion } from '../../../elements/SurveyQuestionTypes';

interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveySettings {
  showResetButton: boolean;
  resetButtonText: string;
  showSubmitButton: boolean;
  submitButtonText: string;
  redirectAfterSubmit: boolean;
  redirectUrl: string;
  showProgressBar: boolean;
  allowSave: boolean;
  enableAnalytics?: boolean;
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
  width: string;
  sectionTitleColor: string;
  sectionDividerColor: string;
  questionSpacing: string;
}

interface SurveyPropertiesPanelProps {
  selectedQuestion: SurveyQuestion | null;
  selectedSection: SurveySection;
  sections: SurveySection[];
  surveySettings: SurveySettings;
  surveyAppearance: SurveyAppearance;
  onQuestionUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSectionUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onAppearanceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onScaleChange: (field: string, value: number | string) => void;
  onDeleteQuestion: () => void;
  onDeleteSection: () => void;
  onMoveQuestion: (direction: 'up' | 'down') => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onAddSection: () => void;
}

const SurveyPropertiesPanel: React.FC<SurveyPropertiesPanelProps> = ({
  selectedQuestion,
  selectedSection,
  sections,
  surveySettings,
  surveyAppearance,
  onQuestionUpdate,
  onSectionUpdate,
  onSettingsChange,
  onAppearanceChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onScaleChange,
  onDeleteQuestion,
  onDeleteSection,
  onMoveQuestion,
  onMoveSection,
  onAddSection
}) => {
  // Render question properties based on question type
  const renderQuestionProperties = () => {
    if (!selectedQuestion) return null;

    // Common properties for all question types
    return (
      <>
        <Form.Group className="mb-3">
          <Form.Label>Question</Form.Label>
          <Form.Control 
            type="text" 
            name="question"
            value={selectedQuestion.question}
            onChange={onQuestionUpdate}
          />
        </Form.Group>
        
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control 
            as="textarea"
            rows={2}
            name="description"
            value={selectedQuestion.description || ''}
            onChange={onQuestionUpdate}
            placeholder="Optional description"
          />
        </Form.Group>
        
        {/* Options for multiple choice questions */}
        {(selectedQuestion.type === 'checkbox' || selectedQuestion.type === 'radio' || selectedQuestion.type === 'select') && (
          <>
            <Form.Label>Options</Form.Label>
            {selectedQuestion.options?.map((option, index) => (
              <div key={index} className="d-flex mb-2">
                <Form.Control 
                  type="text"
                  value={option}
                  onChange={(e) => onOptionChange(index, e.target.value)}
                  className="me-2"
                />
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={() => onRemoveOption(index)}
                  disabled={selectedQuestion.options?.length === 1}
                >
                  <FaTrash />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={onAddOption}
              className="mt-2 mb-3"
            >
              <FaPlus className="me-1" /> Add Option
            </Button>
          </>
        )}
        
        {/* Scale settings for rating scale questions */}
        {selectedQuestion.type === 'scale' && (
          <>
            <Form.Label>Scale Settings</Form.Label>
            <Form.Group className="mb-3">
              <Form.Label>Minimum Value</Form.Label>
              <Form.Control 
                type="number"
                value={selectedQuestion.scale?.min || 1}
                onChange={(e) => onScaleChange('min', parseInt(e.target.value))}
                min={1}
                max={10}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Maximum Value</Form.Label>
              <Form.Control 
                type="number"
                value={selectedQuestion.scale?.max || 5}
                onChange={(e) => onScaleChange('max', parseInt(e.target.value))}
                min={2}
                max={10}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Minimum Label</Form.Label>
              <Form.Control 
                type="text"
                value={selectedQuestion.scale?.minLabel || ''}
                onChange={(e) => onScaleChange('minLabel', e.target.value)}
                placeholder="e.g., Poor"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Maximum Label</Form.Label>
              <Form.Control 
                type="text"
                value={selectedQuestion.scale?.maxLabel || ''}
                onChange={(e) => onScaleChange('maxLabel', e.target.value)}
                placeholder="e.g., Excellent"
              />
            </Form.Group>
          </>
        )}
        
        <Form.Group className="mb-3">
          <Form.Check 
            type="checkbox"
            id="question-required"
            label="Required question"
            name="required"
            checked={selectedQuestion.required}
            onChange={onQuestionUpdate}
          />
        </Form.Group>
      </>
    );
  };

  return (
    <Col md={3}>
      {/* Properties Accordion */}
      <Accordion defaultActiveKey="0" className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaCog className="me-2" />
              <span>Properties</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            {selectedQuestion ? (
              <Form>
                {renderQuestionProperties()}
                
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    <Button 
                      variant="outline-danger" 
                      onClick={onDeleteQuestion}
                      size="sm"
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => onMoveQuestion('up')}
                      disabled={selectedSection.questions.indexOf(selectedQuestion) === 0}
                      size="sm"
                    >
                      <FaArrowUp />
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => onMoveQuestion('down')}
                      disabled={selectedSection.questions.indexOf(selectedQuestion) === selectedSection.questions.length - 1}
                      size="sm"
                    >
                      <FaArrowDown />
                    </Button>
                  </div>
                </div>
              </Form>
            ) : (
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Section Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title"
                    value={selectedSection.title}
                    onChange={onSectionUpdate}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Section Description</Form.Label>
                  <Form.Control 
                    as="textarea"
                    rows={2}
                    name="description"
                    value={selectedSection.description || ''}
                    onChange={onSectionUpdate}
                    placeholder="Optional section description"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    <Button 
                      variant="outline-danger" 
                      onClick={onDeleteSection}
                      disabled={sections.length <= 1}
                      size="sm"
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => onMoveSection('up')}
                      disabled={sections.indexOf(selectedSection) === 0}
                      size="sm"
                    >
                      <FaArrowUp />
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => onMoveSection('down')}
                      disabled={sections.indexOf(selectedSection) === sections.length - 1}
                      size="sm"
                    >
                      <FaArrowDown />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline-primary" 
                    onClick={onAddSection}
                    className="w-100"
                    size="sm"
                  >
                    <FaPlus className="me-1" /> Add New Section
                  </Button>
                </div>
              </Form>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Survey Settings Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaSlidersH className="me-2" />
              <span>Survey Settings</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="enableAnalytics"
                  label="Enable analytics tracking"
                  name="enableAnalytics"
                  checked={surveySettings.enableAnalytics !== false}
                  onChange={onSettingsChange}
                />
                <Form.Text className="text-muted">
                  Track survey views and response information
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="showProgressBar"
                  label="Show progress bar"
                  name="showProgressBar"
                  checked={surveySettings.showProgressBar}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="allowSave"
                  label="Allow saving progress"
                  name="allowSave"
                  checked={surveySettings.allowSave}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="showResetButton"
                  label="Show reset button"
                  name="showResetButton"
                  checked={surveySettings.showResetButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {surveySettings.showResetButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Reset Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="resetButtonText"
                    value={surveySettings.resetButtonText}
                    onChange={onSettingsChange}
                    placeholder="Reset"
                  />
                </Form.Group>
              )}
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="showSubmitButton"
                  label="Show submit button"
                  name="showSubmitButton"
                  checked={surveySettings.showSubmitButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {surveySettings.showSubmitButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Submit Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="submitButtonText"
                    value={surveySettings.submitButtonText}
                    onChange={onSettingsChange}
                    placeholder="Submit"
                  />
                </Form.Group>
              )}
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="redirectAfterSubmit"
                  label="Redirect after submission"
                  name="redirectAfterSubmit"
                  checked={surveySettings.redirectAfterSubmit}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {surveySettings.redirectAfterSubmit && (
                <Form.Group className="mb-3">
                  <Form.Label>Redirect URL</Form.Label>
                  <Form.Control 
                    type="text"
                    name="redirectUrl"
                    value={surveySettings.redirectUrl}
                    onChange={onSettingsChange}
                    placeholder="https://example.com/thank-you"
                  />
                </Form.Group>
              )}
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Survey Appearance Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaPalette className="me-2" />
              <span>Survey Appearance</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <SurveyAppearanceSettings 
              appearance={surveyAppearance}
              onChange={onAppearanceChange}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Col>
  );
};

export default SurveyPropertiesPanel;
