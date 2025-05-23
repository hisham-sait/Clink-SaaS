import React from 'react';
import { Accordion, Button, ListGroup, Card } from 'react-bootstrap';
import { FaLayerGroup, FaArrowUp, FaArrowDown, FaClone, FaTrash, FaFolder, FaFolderOpen } from 'react-icons/fa';

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

interface FormLayersPanelProps {
  sections: FormSection[];
  selectedSection: FormSection;
  selectedElement: FormElement | null;
  onSectionSelect: (section: FormSection) => void;
  onElementSelect: (element: FormElement) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneElement: (elementId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const FormLayersPanel: React.FC<FormLayersPanelProps> = ({
  sections,
  selectedSection,
  selectedElement,
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
                  className={`py-1 px-2 d-flex justify-content-between align-items-center ${selectedSection.id === section.id && !selectedElement ? 'bg-primary text-white' : 'bg-light'}`}
                >
                  <div 
                    className="d-flex align-items-center"
                    onClick={() => onSectionSelect(section)}
                    style={{ cursor: 'pointer', flexGrow: 1 }}
                  >
                    {selectedSection.id === section.id ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
                    <span>{section.title}</span>
                  </div>
                  <div className="section-actions">
                    <span 
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (sectionIndex !== 0) {
                          onMoveSection(section.id, 'up');
                        }
                      }}
                      style={{ 
                        cursor: sectionIndex === 0 ? 'not-allowed' : 'pointer',
                        opacity: sectionIndex === 0 ? 0.5 : 1,
                        display: 'inline-block'
                      }}
                      title="Move Up"
                    >
                      <FaArrowUp />
                    </span>
                    <span 
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (sectionIndex !== sections.length - 1) {
                          onMoveSection(section.id, 'down');
                        }
                      }}
                      style={{ 
                        cursor: sectionIndex === sections.length - 1 ? 'not-allowed' : 'pointer',
                        opacity: sectionIndex === sections.length - 1 ? 0.5 : 1,
                        display: 'inline-block'
                      }}
                      title="Move Down"
                    >
                      <FaArrowDown />
                    </span>
                    <span 
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onCloneSection(section.id); 
                      }}
                      style={{ cursor: 'pointer', display: 'inline-block' }}
                      title="Clone"
                    >
                      <FaClone />
                    </span>
                    <span 
                      className={`p-0 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : 'text-danger'}`}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        if (sections.length > 1) {
                          onDeleteSection(section.id);
                        }
                      }}
                      style={{ 
                        cursor: sections.length <= 1 ? 'not-allowed' : 'pointer',
                        opacity: sections.length <= 1 ? 0.5 : 1,
                        display: 'inline-block'
                      }}
                      title="Delete"
                    >
                      <FaTrash />
                    </span>
                  </div>
                </Card.Header>
                {section.elements.length > 0 && (
                  <ListGroup variant="flush">
                    {section.elements.map((element, elementIndex) => (
                      <ListGroup.Item 
                        key={element.id}
                        action
                        active={selectedElement?.id === element.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onElementSelect(element);
                        }}
                        className="d-flex justify-content-between align-items-center py-1 px-2 element-item"
                      >
                        <div className="element-info">
                          <div className="element-type small text-muted">{element.type}</div>
                          <div className="element-label">{element.label}</div>
                        </div>
                        <div className="element-actions">
                          <span 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (elementIndex !== 0) {
                                onMoveElement(element.id, 'up');
                              }
                            }}
                            style={{ 
                              cursor: elementIndex === 0 ? 'not-allowed' : 'pointer',
                              opacity: elementIndex === 0 ? 0.5 : 1,
                              display: 'inline-block'
                            }}
                            title="Move Up"
                          >
                            <FaArrowUp />
                          </span>
                          <span 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              if (elementIndex !== section.elements.length - 1) {
                                onMoveElement(element.id, 'down');
                              }
                            }}
                            style={{ 
                              cursor: elementIndex === section.elements.length - 1 ? 'not-allowed' : 'pointer',
                              opacity: elementIndex === section.elements.length - 1 ? 0.5 : 1,
                              display: 'inline-block'
                            }}
                            title="Move Down"
                          >
                            <FaArrowDown />
                          </span>
                          <span 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onCloneElement(element.id); 
                            }}
                            style={{ cursor: 'pointer', display: 'inline-block' }}
                            title="Clone"
                          >
                            <FaClone />
                          </span>
                          <span 
                            className="p-0 text-danger" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onDeleteElement(element.id); 
                            }}
                            style={{ cursor: 'pointer', display: 'inline-block' }}
                            title="Delete"
                          >
                            <FaTrash />
                          </span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
                {section.elements.length === 0 && (
                  <Card.Body className="py-1 px-2 text-muted small">
                    <p className="mb-0">No elements in this section</p>
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

export default FormLayersPanel;
