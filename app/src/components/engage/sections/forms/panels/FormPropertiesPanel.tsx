import React from 'react';
import { Accordion, Button, Col, Form } from 'react-bootstrap';
import { FaCog, FaSlidersH, FaPalette, FaTrash, FaArrowUp, FaArrowDown, FaPlus } from 'react-icons/fa';
import FormAppearanceSettings from './FormAppearanceSettings';
import { FormElement, renderPropertiesUI } from '../../../elements';

interface FormSection {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
}

interface FormSettings {
  showResetButton: boolean;
  resetButtonText: string;
  showSubmitButton: boolean;
  submitButtonText: string;
  redirectAfterSubmit: boolean;
  redirectUrl: string;
  enableAnalytics?: boolean;
}

interface FormAppearance {
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
  elementSpacing: string;
}

interface FormPropertiesPanelProps {
  selectedElement: FormElement | null;
  selectedSection: FormSection;
  sections: FormSection[];
  formSettings: FormSettings;
  formAppearance: FormAppearance;
  onElementUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onSectionUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onAppearanceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onDeleteElement: () => void;
  onDeleteSection: () => void;
  onMoveElement: (direction: 'up' | 'down') => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onAddSection: () => void;
}

const FormPropertiesPanel: React.FC<FormPropertiesPanelProps> = ({
  selectedElement,
  selectedSection,
  sections,
  formSettings,
  formAppearance,
  onElementUpdate,
  onSectionUpdate,
  onSettingsChange,
  onAppearanceChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onDeleteElement,
  onDeleteSection,
  onMoveElement,
  onMoveSection,
  onAddSection
}) => {
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
            {selectedElement ? (
              <Form>
                {/* Render element-specific properties UI */}
                {renderPropertiesUI(
                  selectedElement,
                  onElementUpdate,
                  onOptionChange,
                  onAddOption,
                  onRemoveOption
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <div>
                    <Button 
                      variant="outline-danger" 
                      onClick={onDeleteElement}
                      size="sm"
                    >
                      <FaTrash className="me-1" /> Delete
                    </Button>
                  </div>
                  <div>
                    <Button 
                      variant="outline-secondary" 
                      className="me-2"
                      onClick={() => onMoveElement('up')}
                      disabled={selectedSection.elements.indexOf(selectedElement) === 0}
                      size="sm"
                    >
                      <FaArrowUp />
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => onMoveElement('down')}
                      disabled={selectedSection.elements.indexOf(selectedElement) === selectedSection.elements.length - 1}
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
      
      {/* Form Settings Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaSlidersH className="me-2" />
              <span>Form Settings</span>
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
                  checked={formSettings.enableAnalytics !== false}
                  onChange={onSettingsChange}
                />
                <Form.Text className="text-muted">
                  Track form views and submission information
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="showResetButton"
                  label="Show reset button"
                  name="showResetButton"
                  checked={formSettings.showResetButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {formSettings.showResetButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Reset Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="resetButtonText"
                    value={formSettings.resetButtonText}
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
                  checked={formSettings.showSubmitButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {formSettings.showSubmitButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Submit Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="submitButtonText"
                    value={formSettings.submitButtonText}
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
                  checked={formSettings.redirectAfterSubmit}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {formSettings.redirectAfterSubmit && (
                <Form.Group className="mb-3">
                  <Form.Label>Redirect URL</Form.Label>
                  <Form.Control 
                    type="text"
                    name="redirectUrl"
                    value={formSettings.redirectUrl}
                    onChange={onSettingsChange}
                    placeholder="https://example.com/thank-you"
                  />
                </Form.Group>
              )}
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Form Appearance Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaPalette className="me-2" />
              <span>Form Appearance</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <FormAppearanceSettings 
              appearance={formAppearance}
              onChange={onAppearanceChange}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Col>
  );
};

export default FormPropertiesPanel;
