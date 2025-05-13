import React, { useState, useRef, useEffect } from 'react';
import { Accordion, Button, Form } from 'react-bootstrap';
import { FaCog, FaTrash, FaArrowUp, FaArrowDown, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FormElement, renderPropertiesUI, propertyStyles } from '../../../elements';

// Collapsible section component
interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [height, setHeight] = useState<number | string>(expanded ? 'auto' : 0);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const styles = {
    sectionHeader: {
      fontSize: '11px',
      fontWeight: 600,
      marginTop: '6px',
      marginBottom: '1px',
      borderBottom: '1px solid #dee2e6',
      paddingBottom: '1px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
    }
  };
  
  // Update height when expanded state changes
  useEffect(() => {
    if (!contentRef.current) return;
    
    if (expanded) {
      // Get the actual height of the content
      const contentHeight = contentRef.current.scrollHeight;
      
      // First set to the exact height for animation
      setHeight(contentHeight);
      
      // Then set to auto after animation completes to handle content changes
      const timer = setTimeout(() => {
        setHeight('auto');
      }, 300); // Match this with the transition duration
      
      return () => clearTimeout(timer);
    } else {
      // Set the exact height before collapsing for smooth animation
      const contentHeight = contentRef.current.scrollHeight;
      setHeight(contentHeight);
      
      // Force a reflow to ensure the browser registers the height
      contentRef.current.offsetHeight; // eslint-disable-line no-unused-expressions
      
      // Then set to 0 to animate the collapse
      setTimeout(() => {
        setHeight(0);
      }, 10);
    }
  }, [expanded]);
  
  return (
    <>
      <div 
        style={styles.sectionHeader} 
        onClick={() => setExpanded(!expanded)}
      >
        <span>{title}</span>
        {expanded ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
      </div>
      <div 
        ref={contentRef}
        style={{
          overflow: 'hidden',
          transition: 'height 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          height: typeof height === 'number' ? `${height}px` : height,
          padding: expanded ? '2px 0 0 0' : '0'
        }}
      >
        <div>
          {children}
        </div>
      </div>
    </>
  );
};

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
        <Accordion.Body style={{ padding: '10px' }}>
          <Form style={propertyStyles.container}>
            <CollapsibleSection title="Basic Properties" defaultExpanded={true}>
              {/* Basic properties for all elements */}
              <div style={propertyStyles.formGroup}>
                <div style={propertyStyles.inlineLabel}>Label</div>
                <Form.Control
                  type="text"
                  name="label"
                  value={selectedElement.label}
                  onChange={onElementUpdate}
                  style={propertyStyles.formControl}
                  size="sm"
                />
              </div>

              <div style={propertyStyles.formGroup}>
                <div style={propertyStyles.inlineLabel}>Description</div>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="description"
                  value={selectedElement.description || ''}
                  onChange={onElementUpdate}
                  placeholder="Optional element description"
                  style={{ fontSize: '11px', padding: '4px 6px' }}
                />
              </div>
            </CollapsibleSection>

            {/* Render element-specific properties UI */}
            {renderPropertiesUI(
              selectedElement,
              onElementUpdate,
              onOptionChange,
              onAddOption,
              onRemoveOption
            )}
            
            <div className="d-flex justify-content-between mt-3">
              <div>
                <Button 
                  variant="outline-danger" 
                  onClick={onDeleteElement}
                  style={propertyStyles.miniButton}
                >
                  <FaTrash size={10} className="me-1" /> Delete
                </Button>
              </div>
              <div>
                <Button 
                  variant="outline-secondary" 
                  className="me-1"
                  onClick={() => onMoveElement('up')}
                  disabled={selectedSection.elements.indexOf(selectedElement) === 0}
                  style={propertyStyles.miniButton}
                >
                  <FaArrowUp size={10} />
                </Button>
                <Button 
                  variant="outline-secondary"
                  onClick={() => onMoveElement('down')}
                  disabled={selectedSection.elements.indexOf(selectedElement) === selectedSection.elements.length - 1}
                  style={propertyStyles.miniButton}
                >
                  <FaArrowDown size={10} />
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
