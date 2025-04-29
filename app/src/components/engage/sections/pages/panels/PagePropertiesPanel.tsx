import React from 'react';
import { Accordion, Button, Col, Form, ButtonGroup, ToggleButton } from 'react-bootstrap';
import { FaSlidersH, FaPalette, FaTrash, FaArrowUp, FaArrowDown, FaPlus, FaLayerGroup, FaHeading, FaAlignLeft, FaEye } from 'react-icons/fa';
import PageAppearanceSettings from './PageAppearanceSettings';
import { FormElement } from '../../../elements';

interface PageSection {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
}

interface PageSettings {
  showResetButton: boolean;
  resetButtonText: string;
  showSubmitButton: boolean;
  submitButtonText: string;
  redirectAfterSubmit: boolean;
  redirectUrl: string;
  showSectionWrappers?: boolean;
  showSectionTitles?: boolean;
  showSectionText?: boolean;
  showElementWrappers?: boolean;
  showElementTitles?: boolean;
  showElementDescriptions?: boolean;
  enableAnalytics?: boolean;
}

interface PageAppearance {
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

interface PagePropertiesPanelProps {
  selectedSection: PageSection;
  sections: PageSection[];
  pageSettings: PageSettings;
  pageAppearance: PageAppearance;
  onSectionUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSettingsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onAppearanceChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onDeleteSection: () => void;
  onMoveSection: (direction: 'up' | 'down') => void;
  onAddSection: () => void;
  onToggleVisibility?: (setting: string, value: boolean) => void;
}

const PagePropertiesPanel: React.FC<PagePropertiesPanelProps> = ({
  selectedSection,
  sections,
  pageSettings,
  pageAppearance,
  onSectionUpdate,
  onSettingsChange,
  onAppearanceChange,
  onDeleteSection,
  onMoveSection,
  onAddSection,
  onToggleVisibility
}) => {
  // Default values for visibility settings
  const showSectionWrappers = pageSettings.showSectionWrappers !== undefined ? pageSettings.showSectionWrappers : true;
  const showSectionTitles = pageSettings.showSectionTitles !== undefined ? pageSettings.showSectionTitles : true;
  const showSectionText = pageSettings.showSectionText !== undefined ? pageSettings.showSectionText : true;
  const showElementWrappers = pageSettings.showElementWrappers !== undefined ? pageSettings.showElementWrappers : true;
  const showElementTitles = pageSettings.showElementTitles !== undefined ? pageSettings.showElementTitles : true;
  const showElementDescriptions = pageSettings.showElementDescriptions !== undefined ? pageSettings.showElementDescriptions : true;

  // Handle toggle changes
  const handleToggleChange = (setting: string, checked: boolean) => {
    if (onToggleVisibility) {
      onToggleVisibility(setting, checked);
    }
  };

  return (
    <Col md={3}>
      {/* Section Properties Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaPlus className="me-2" />
              <span>Section Properties</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
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
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Page Settings Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaSlidersH className="me-2" />
              <span>Page Settings</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Form>
              {/* Visibility Controls */}
              <Form.Group className="mb-4">
                <Form.Label><FaEye className="me-1" /> Visibility Controls</Form.Label>
                
                <div className="mb-3">
                  <small className="d-block text-muted mb-1">Section Controls</small>
                  <ButtonGroup size="sm" className="w-100 mb-2">
                    <ToggleButton
                      id="toggle-section-wrappers"
                      type="checkbox"
                      variant={showSectionWrappers ? "primary" : "outline-primary"}
                      checked={showSectionWrappers}
                      value="1"
                      onChange={(e) => handleToggleChange('showSectionWrappers', e.currentTarget.checked)}
                      title="Toggle Section Wrappers"
                    >
                      <FaLayerGroup className="me-1" /> Wrappers
                    </ToggleButton>
                  </ButtonGroup>
                  
                  <ButtonGroup size="sm" className="w-100 mb-2">
                    <ToggleButton
                      id="toggle-section-titles"
                      type="checkbox"
                      variant={showSectionTitles ? "primary" : "outline-primary"}
                      checked={showSectionTitles}
                      value="1"
                      onChange={(e) => handleToggleChange('showSectionTitles', e.currentTarget.checked)}
                      title="Toggle Section Titles"
                    >
                      <FaHeading className="me-1" /> Titles
                    </ToggleButton>
                  </ButtonGroup>
                  
                  <ButtonGroup size="sm" className="w-100">
                    <ToggleButton
                      id="toggle-section-text"
                      type="checkbox"
                      variant={showSectionText ? "primary" : "outline-primary"}
                      checked={showSectionText}
                      value="1"
                      onChange={(e) => handleToggleChange('showSectionText', e.currentTarget.checked)}
                      title="Toggle Section Text"
                    >
                      <FaAlignLeft className="me-1" /> Text
                    </ToggleButton>
                  </ButtonGroup>
                </div>
                
                <div>
                  <small className="d-block text-muted mb-1">Element Controls</small>
                  <ButtonGroup size="sm" className="w-100 mb-2">
                    <ToggleButton
                      id="toggle-element-wrappers"
                      type="checkbox"
                      variant={showElementWrappers ? "primary" : "outline-primary"}
                      checked={showElementWrappers}
                      value="1"
                      onChange={(e) => handleToggleChange('showElementWrappers', e.currentTarget.checked)}
                      title="Toggle Element Wrappers"
                    >
                      <FaLayerGroup className="me-1" /> Wrappers
                    </ToggleButton>
                  </ButtonGroup>
                  
                  <ButtonGroup size="sm" className="w-100 mb-2">
                    <ToggleButton
                      id="toggle-element-titles"
                      type="checkbox"
                      variant={showElementTitles ? "primary" : "outline-primary"}
                      checked={showElementTitles}
                      value="1"
                      onChange={(e) => handleToggleChange('showElementTitles', e.currentTarget.checked)}
                      title="Toggle Element Titles"
                    >
                      <FaHeading className="me-1" /> Titles
                    </ToggleButton>
                  </ButtonGroup>
                  
                  <ButtonGroup size="sm" className="w-100">
                    <ToggleButton
                      id="toggle-element-descriptions"
                      type="checkbox"
                      variant={showElementDescriptions ? "primary" : "outline-primary"}
                      checked={showElementDescriptions}
                      value="1"
                      onChange={(e) => handleToggleChange('showElementDescriptions', e.currentTarget.checked)}
                      title="Toggle Element Descriptions"
                    >
                      <FaAlignLeft className="me-1" /> Descriptions
                    </ToggleButton>
                  </ButtonGroup>
                </div>
              </Form.Group>
              
              <hr className="my-4" />
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="enableAnalytics"
                  label="Enable analytics tracking"
                  name="enableAnalytics"
                  checked={pageSettings.enableAnalytics !== false}
                  onChange={onSettingsChange}
                />
                <Form.Text className="text-muted">
                  Track page views and visitor information
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="showResetButton"
                  label="Show reset button"
                  name="showResetButton"
                  checked={pageSettings.showResetButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {pageSettings.showResetButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Reset Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="resetButtonText"
                    value={pageSettings.resetButtonText}
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
                  checked={pageSettings.showSubmitButton}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {pageSettings.showSubmitButton && (
                <Form.Group className="mb-3">
                  <Form.Label>Submit Button Text</Form.Label>
                  <Form.Control 
                    type="text"
                    name="submitButtonText"
                    value={pageSettings.submitButtonText}
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
                  checked={pageSettings.redirectAfterSubmit}
                  onChange={onSettingsChange}
                />
              </Form.Group>
              
              {pageSettings.redirectAfterSubmit && (
                <Form.Group className="mb-3">
                  <Form.Label>Redirect URL</Form.Label>
                  <Form.Control 
                    type="text"
                    name="redirectUrl"
                    value={pageSettings.redirectUrl}
                    onChange={onSettingsChange}
                    placeholder="https://example.com/thank-you"
                  />
                </Form.Group>
              )}
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      
      {/* Page Appearance Accordion */}
      <Accordion className="mb-3">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <FaPalette className="me-2" />
              <span>Page Appearance</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <PageAppearanceSettings 
              appearance={pageAppearance}
              onChange={onAppearanceChange}
            />
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Col>
  );
};

export default PagePropertiesPanel;
