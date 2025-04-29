import React, { useState, useRef } from 'react';
import { Card, Button, Col, Form, Dropdown } from 'react-bootstrap';
import { FaCode, FaPlus, FaCaretDown } from 'react-icons/fa';

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
  sectionTitleColor: string;
  sectionDividerColor: string;
  elementSpacing: string;
}

interface FormCanvasProps {
  sections: FormSection[];
  selectedSection: FormSection;
  selectedElement: FormElement | null;
  formAppearance: FormAppearance;
  onSectionSelect: (section: FormSection) => void;
  onElementSelect: (element: FormElement) => void;
  onAddSection: () => void;
  onAddElement: (type: string) => void;
  renderElementPreview: (element: FormElement) => React.ReactNode;
}

const FormCanvas: React.FC<FormCanvasProps> = ({
  sections,
  selectedSection,
  selectedElement,
  formAppearance,
  onSectionSelect,
  onElementSelect,
  onAddSection,
  onAddElement,
  renderElementPreview
}) => {
  // Generate CSS for canvas based on appearance settings
  const getCanvasStyle = () => {
    return {
      backgroundColor: formAppearance.backgroundColor,
      backgroundImage: formAppearance.backgroundImage ? `url(${formAppearance.backgroundImage})` : 'none',
      fontFamily: formAppearance.fontFamily,
      color: formAppearance.textColor,
      borderRadius: formAppearance.borderRadius,
      boxShadow: formAppearance.boxShadow
    };
  };

  const getSectionTitleStyle = () => {
    return {
      color: formAppearance.sectionTitleColor || formAppearance.textColor
    };
  };

  const getSectionStyle = () => {
    return {
      borderBottom: `1px solid ${formAppearance.sectionDividerColor || '#dee2e6'}`,
      marginBottom: '15px'
    };
  };

  const getElementStyle = () => {
    return {
      marginBottom: formAppearance.elementSpacing || '15px'
    };
  };

  const getButtonStyle = () => {
    return {
      backgroundColor: formAppearance.primaryColor,
      borderColor: formAppearance.primaryColor
    };
  };

  // Element types for dropdown
  const elementTypes = [
    { type: 'text', label: 'Text Field' },
    { type: 'textarea', label: 'Text Area' },
    { type: 'checkbox', label: 'Checkbox' },
    { type: 'radio', label: 'Radio Button' },
    { type: 'select', label: 'Dropdown' },
    { type: 'date', label: 'Date Picker' },
    { type: 'file', label: 'File Upload' }
  ];

  return (
    <Col md={6}>
      <Card className="form-canvas" style={getCanvasStyle()}>
        <Card.Header className="bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Form Layout</h5>
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
              <p className="mb-0">Add a section to start building your form</p>
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
                            id={`dropdown-add-element-${section.id}`}
                          >
                            <FaPlus className="me-1" /> Add Element
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {elementTypes.map((element) => (
                              <Dropdown.Item 
                                key={element.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSectionSelect(section);
                                  onAddElement(element.type);
                                }}
                              >
                                {element.label}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    {section.description && <p className="text-muted" style={getSectionStyle()}>{section.description}</p>}
                    
                    {section.elements.length === 0 ? (
                      <div className="text-center p-4 border rounded bg-light">
                        <p className="mb-0">No elements yet. Click "Add Element" to start building your form.</p>
                      </div>
                    ) : (
                      <Form>
                        {section.elements.map(element => (
                          <div 
                            key={element.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              onElementSelect(element);
                            }}
                            className={`form-element-wrapper p-2 mb-2 rounded ${selectedElement?.id === element.id ? 'border border-primary' : 'border border-light'}`}
                            style={getElementStyle()}
                          >
                            {renderElementPreview(element)}
                          </div>
                        ))}
                      </Form>
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

export default FormCanvas;
