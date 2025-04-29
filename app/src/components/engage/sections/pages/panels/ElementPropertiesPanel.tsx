import React from 'react';
import { Accordion, Button, Form } from 'react-bootstrap';
import { FaCog, FaTrash, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { FormElement, renderPropertiesUI } from '../../../elements';

interface ElementPropertiesPanelProps {
  selectedElement: FormElement | null;
  selectedSection: {
    id: string;
    elements: FormElement[];
  };
  onElementUpdate: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onOptionChange: (index: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onDeleteElement: () => void;
  onMoveElement: (direction: 'up' | 'down') => void;
}

const ElementPropertiesPanel: React.FC<ElementPropertiesPanelProps> = ({
  selectedElement,
  selectedSection,
  onElementUpdate,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onDeleteElement,
  onMoveElement
}) => {
  if (!selectedElement) {
    return null;
  }

  // Handle special case for text elements
  const isTextElement = selectedElement.type === 'text';
  
  return (
    <Accordion className="mb-3">
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <div className="d-flex align-items-center">
            <FaCog className="me-2" />
            <span>Element Properties</span>
          </div>
        </Accordion.Header>
        <Accordion.Body>
          <Form>
            {/* Basic properties for all elements */}
            <Form.Group className="mb-3">
              <Form.Label>Label</Form.Label>
              <Form.Control
                type="text"
                name="label"
                value={selectedElement.label}
                onChange={onElementUpdate}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={selectedElement.description || ''}
                onChange={onElementUpdate}
                placeholder="Optional element description"
              />
            </Form.Group>

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
        </Accordion.Body>
      </Accordion.Item>
    </Accordion>
  );
};

export default ElementPropertiesPanel;
