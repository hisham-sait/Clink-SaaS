import React from 'react';
import { Accordion, Button, ListGroup, Card } from 'react-bootstrap';
import { FaLayerGroup, FaArrowUp, FaArrowDown, FaClone, FaTrash, FaFolder, FaFolderOpen } from 'react-icons/fa';

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

interface PageLayersPanelProps {
  sections: PageSection[];
  selectedSection: PageSection;
  selectedElement: PageElement | null;
  onSectionSelect: (section: PageSection) => void;
  onElementSelect: (element: PageElement) => void;
  onMoveSection: (sectionId: string, direction: 'up' | 'down') => void;
  onMoveElement: (elementId: string, direction: 'up' | 'down') => void;
  onCloneSection: (sectionId: string) => void;
  onCloneElement: (elementId: string) => void;
  onDeleteSection: (sectionId: string) => void;
  onDeleteElement: (elementId: string) => void;
}

const PageLayersPanel: React.FC<PageLayersPanelProps> = ({
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
                  onClick={() => onSectionSelect(section)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-center">
                    {selectedSection.id === section.id ? <FaFolderOpen className="me-2" /> : <FaFolder className="me-2" />}
                    <span>{section.title}</span>
                  </div>
                  <div className="section-actions">
                    <Button 
                      variant="link" 
                      size="sm" 
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
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
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
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
                      className={`p-0 me-1 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : ''}`}
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
                      className={`p-0 ${selectedSection.id === section.id && !selectedElement ? 'text-white' : 'text-danger'}`}
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
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="p-0 me-1" 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onMoveElement(element.id, 'up'); 
                            }}
                            disabled={elementIndex === 0}
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
                              onMoveElement(element.id, 'down'); 
                            }}
                            disabled={elementIndex === section.elements.length - 1}
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
                              onCloneElement(element.id); 
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
                              onDeleteElement(element.id); 
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

export default PageLayersPanel;
