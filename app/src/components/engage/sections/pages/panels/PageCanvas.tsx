import React from 'react';
import { Button, Col, Form, Dropdown } from 'react-bootstrap';
import { FaCode, FaPlus } from 'react-icons/fa';

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
  sectionTitleColor: string;
  sectionDividerColor: string;
  elementSpacing: string;
}

interface PageSettings {
  showSectionWrappers?: boolean;
  showSectionTitles?: boolean;
  showSectionText?: boolean;
  showElementWrappers?: boolean;
  showElementTitles?: boolean;
  showElementDescriptions?: boolean;
}

interface PageCanvasProps {
  sections: PageSection[];
  selectedSection: PageSection;
  selectedElement: PageElement | null;
  pageAppearance: PageAppearance;
  pageSettings: PageSettings;
  onSectionSelect: (section: PageSection) => void;
  onElementSelect: (element: PageElement) => void;
  onAddSection: () => void;
  onAddElement: (type: string) => void;
  renderElementPreview: (element: PageElement) => React.ReactNode;
}

const PageCanvas: React.FC<PageCanvasProps> = ({
  sections,
  selectedSection,
  selectedElement,
  pageAppearance,
  pageSettings,
  onSectionSelect,
  onElementSelect,
  onAddSection,
  onAddElement,
  renderElementPreview
}) => {
  // Default values for visibility settings
  const showSectionWrappers = pageSettings?.showSectionWrappers !== undefined ? pageSettings.showSectionWrappers : true;
  const showSectionTitles = pageSettings?.showSectionTitles !== undefined ? pageSettings.showSectionTitles : true;
  const showSectionText = pageSettings?.showSectionText !== undefined ? pageSettings.showSectionText : true;
  const showElementWrappers = pageSettings?.showElementWrappers !== undefined ? pageSettings.showElementWrappers : true;
  const showElementTitles = pageSettings?.showElementTitles !== undefined ? pageSettings.showElementTitles : true;
  const showElementDescriptions = pageSettings?.showElementDescriptions !== undefined ? pageSettings.showElementDescriptions : true;

  // Generate CSS for canvas based on appearance settings
  const getCanvasStyle = () => {
    return {
      backgroundColor: pageAppearance.backgroundColor,
      backgroundImage: pageAppearance.backgroundImage ? `url(${pageAppearance.backgroundImage})` : 'none',
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      borderRadius: pageAppearance.borderRadius,
      boxShadow: pageAppearance.boxShadow,
      padding: '20px',
      height: '100%'
    };
  };

  const getSectionTitleStyle = () => {
    return {
      color: pageAppearance.sectionTitleColor || pageAppearance.textColor
    };
  };

  const getSectionStyle = () => {
    return {
      borderBottom: `1px solid ${pageAppearance.sectionDividerColor || '#dee2e6'}`,
      marginBottom: '15px'
    };
  };

  const getElementStyle = () => {
    return {
      marginBottom: pageAppearance.elementSpacing || '15px'
    };
  };

  const getButtonStyle = () => {
    return {
      backgroundColor: pageAppearance.primaryColor,
      borderColor: pageAppearance.primaryColor
    };
  };

  // Element types for dropdown
  const elementTypes = [
    { type: 'text', label: 'Text' },
    { type: 'image', label: 'Image' },
    { type: 'video', label: 'Video' },
    { type: 'button', label: 'Button' },
    { type: 'form', label: 'Form' },
    { type: 'survey', label: 'Survey' },
    { type: 'carousel', label: 'Carousel' },
    { type: 'wysiwyg', label: 'WYSIWYG Editor' },
    { type: 'profile', label: 'Profile' },
    { type: 'social', label: 'Social Links' },
    { type: 'instagram', label: 'Instagram' },
    { type: 'facebook', label: 'Facebook' },
    { type: 'youtube', label: 'YouTube' },
    { type: 'product', label: 'Product Data' }
  ];

  return (
    <Col md={6}>
      <div className="page-canvas" style={getCanvasStyle()}>
        <div className="bg-light p-3 mb-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Page Layout</h5>
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
        
        <div className="p-4">
          {sections.length === 0 ? (
            <div className="text-center p-5 border rounded bg-light">
              <p className="mb-0">Add a section to start building your page</p>
            </div>
          ) : (
            <div>
              {sections.map((section) => (
                <div 
                  key={section.id} 
                  className={`mb-4 ${showSectionWrappers ? 'border' : ''} ${selectedSection.id === section.id ? 'border-primary' : showSectionWrappers ? 'border-light' : ''}`}
                  onClick={() => onSectionSelect(section)}
                  style={{...getCanvasStyle(), padding: showSectionWrappers ? '0' : '10px 0'}}
                >
                  {showSectionWrappers && (
                    <div className="bg-light p-3">
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
                    </div>
                  )}
                  
                  <div className={showSectionWrappers ? 'p-3' : ''}>
                    {showSectionTitles && !showSectionWrappers && (
                      <h5 className="mb-2" style={getSectionTitleStyle()}>{section.title}</h5>
                    )}
                    
                    {showSectionText && section.description && (
                      <p className="text-muted" style={getSectionStyle()}>{section.description}</p>
                    )}
                    
                    {section.elements.length === 0 ? (
                      <div className="text-center p-4 border rounded bg-light">
                        <p className="mb-0">No elements yet. Click "Add Element" to start building your page.</p>
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
                            className={`form-element-wrapper ${showElementWrappers ? 'p-2 mb-2 rounded border' : 'mb-3'} ${selectedElement?.id === element.id ? 'border-primary' : showElementWrappers ? 'border-light' : ''}`}
                            style={getElementStyle()}
                          >
                            {showElementTitles && element.label && (
                              <Form.Label className={showElementWrappers ? '' : 'mb-1'}>
                                {element.label}{element.required && <span className="text-danger">*</span>}
                              </Form.Label>
                            )}
                            
                            {showElementDescriptions && element.description && (
                              <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>
                            )}
                            
                            {renderElementPreview(element)}
                          </div>
                        ))}
                      </Form>
                    )}
                    
                    {!showSectionWrappers && (
                      <div className="mt-2 mb-3">
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="outline-secondary" 
                            size="sm"
                            id={`dropdown-add-element-inline-${section.id}`}
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
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Col>
  );
};

export default PageCanvas;
