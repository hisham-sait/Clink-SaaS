import React, { useState } from 'react';
import { Modal, Button, Row, Col, Card, Form, ListGroup, Tabs, Tab, Accordion } from 'react-bootstrap';
import { 
  FaSave, FaPlus, FaFont, FaCheck, FaList, FaCalendarAlt, FaImage, 
  FaGripLines, FaTrash, FaArrowUp, FaArrowDown, FaCog, FaEye, FaCode
} from 'react-icons/fa';

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormDesignerModalProps {
  show: boolean;
  onHide: () => void;
  formId: string | null;
  formTitle: string;
}

const FormDesignerModal: React.FC<FormDesignerModalProps> = ({
  show,
  onHide,
  formId,
  formTitle
}) => {
  const [activeTab, setActiveTab] = useState('elements');
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Element types that can be added to the form
  const elementTypes = [
    { type: 'text', label: 'Text Field', icon: <FaFont /> },
    { type: 'textarea', label: 'Text Area', icon: <FaGripLines /> },
    { type: 'checkbox', label: 'Checkbox', icon: <FaCheck /> },
    { type: 'radio', label: 'Radio Buttons', icon: <FaList /> },
    { type: 'select', label: 'Dropdown', icon: <FaList /> },
    { type: 'date', label: 'Date Picker', icon: <FaCalendarAlt /> },
    { type: 'file', label: 'File Upload', icon: <FaImage /> },
  ];

  const handleAddElement = (type: string) => {
    const newElement: FormElement = {
      id: `element-${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: 'Enter value',
      required: false,
      options: type === 'radio' || type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };

    setFormElements([...formElements, newElement]);
    setSelectedElement(newElement);
    setActiveTab('properties');
  };

  const handleElementSelect = (element: FormElement) => {
    setSelectedElement(element);
    setActiveTab('properties');
  };

  const handleElementUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedElement) return;

    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    const updatedElement = {
      ...selectedElement,
      [name]: type === 'checkbox' ? checked : value
    };

    setSelectedElement(updatedElement);
    setFormElements(formElements.map(el => el.id === updatedElement.id ? updatedElement : el));
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!selectedElement || !selectedElement.options) return;

    const newOptions = [...selectedElement.options];
    newOptions[index] = value;

    const updatedElement = {
      ...selectedElement,
      options: newOptions
    };

    setSelectedElement(updatedElement);
    setFormElements(formElements.map(el => el.id === updatedElement.id ? updatedElement : el));
  };

  const handleAddOption = () => {
    if (!selectedElement || !selectedElement.options) return;

    const updatedElement = {
      ...selectedElement,
      options: [...selectedElement.options, `Option ${selectedElement.options.length + 1}`]
    };

    setSelectedElement(updatedElement);
    setFormElements(formElements.map(el => el.id === updatedElement.id ? updatedElement : el));
  };

  const handleRemoveOption = (index: number) => {
    if (!selectedElement || !selectedElement.options) return;

    const newOptions = [...selectedElement.options];
    newOptions.splice(index, 1);

    const updatedElement = {
      ...selectedElement,
      options: newOptions
    };

    setSelectedElement(updatedElement);
    setFormElements(formElements.map(el => el.id === updatedElement.id ? updatedElement : el));
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;

    const updatedElements = formElements.filter(el => el.id !== selectedElement.id);
    setFormElements(updatedElements);
    setSelectedElement(null);
  };

  const handleMoveElement = (direction: 'up' | 'down') => {
    if (!selectedElement) return;

    const currentIndex = formElements.findIndex(el => el.id === selectedElement.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === formElements.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newElements = [...formElements];
    const [removed] = newElements.splice(currentIndex, 1);
    newElements.splice(newIndex, 0, removed);

    setFormElements(newElements);
  };

  const handleSaveForm = () => {
    // In a real app, this would save the form design to the backend
    console.log('Saving form design:', { formId, formTitle, elements: formElements });
    onHide();
  };

  const renderElementPreview = (element: FormElement) => {
    switch (element.type) {
      case 'text':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="text" placeholder={element.placeholder} />
          </Form.Group>
        );
      case 'textarea':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control as="textarea" rows={3} placeholder={element.placeholder} />
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            {element.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="checkbox"
                id={`${element.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            {element.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="radio"
                name={element.id}
                id={`${element.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'select':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Select>
              <option value="">Select an option</option>
              {element.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case 'date':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="date" />
          </Form.Group>
        );
      case 'file':
        return (
          <Form.Group className="mb-3">
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="file" />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="form-designer-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          Form Designer: {formTitle}
          <div className="ms-3 d-inline-block">
            <Button 
              variant={previewMode ? "outline-primary" : "outline-secondary"} 
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              className="me-2"
            >
              <FaEye className="me-1" /> Preview
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveForm}>
              <FaSave className="me-1" /> Save Form
            </Button>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {previewMode ? (
          <Card className="p-4">
            <h3>{formTitle}</h3>
            <Form>
              {formElements.map(element => (
                <div key={element.id}>
                  {renderElementPreview(element)}
                </div>
              ))}
              <div className="mt-4">
                <Button variant="primary">Submit</Button>
              </div>
            </Form>
          </Card>
        ) : (
          <Row>
            <Col md={3}>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => k && setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="elements" title={<span><FaPlus className="me-1" /> Elements</span>}>
                  <Card className="border-0">
                    <Card.Body className="p-0">
                      <ListGroup variant="flush">
                        {elementTypes.map((elementType) => (
                          <ListGroup.Item 
                            key={elementType.type}
                            action
                            onClick={() => handleAddElement(elementType.type)}
                            className="d-flex align-items-center"
                          >
                            <div className="me-2">{elementType.icon}</div>
                            {elementType.label}
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Tab>
                <Tab eventKey="properties" title={<span><FaCog className="me-1" /> Properties</span>}>
                  {selectedElement ? (
                    <Card className="border-0">
                      <Card.Body>
                        <Form>
                          <Form.Group className="mb-3">
                            <Form.Label>Label</Form.Label>
                            <Form.Control 
                              type="text" 
                              name="label"
                              value={selectedElement.label}
                              onChange={handleElementUpdate}
                            />
                          </Form.Group>
                          
                          {(selectedElement.type === 'text' || selectedElement.type === 'textarea') && (
                            <Form.Group className="mb-3">
                              <Form.Label>Placeholder</Form.Label>
                              <Form.Control 
                                type="text" 
                                name="placeholder"
                                value={selectedElement.placeholder || ''}
                                onChange={handleElementUpdate}
                              />
                            </Form.Group>
                          )}
                          
                          <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control 
                              as="textarea"
                              rows={2}
                              name="description"
                              value={selectedElement.description || ''}
                              onChange={handleElementUpdate}
                            />
                          </Form.Group>
                          
                          <Form.Group className="mb-3">
                            <Form.Check 
                              type="checkbox"
                              id="element-required"
                              label="Required field"
                              name="required"
                              checked={selectedElement.required}
                              onChange={handleElementUpdate}
                            />
                          </Form.Group>
                          
                          {(selectedElement.type === 'radio' || selectedElement.type === 'select' || selectedElement.type === 'checkbox') && (
                            <Accordion defaultActiveKey="0" className="mb-3">
                              <Accordion.Item eventKey="0">
                                <Accordion.Header>Options</Accordion.Header>
                                <Accordion.Body>
                                  {selectedElement.options?.map((option, index) => (
                                    <div key={index} className="d-flex mb-2">
                                      <Form.Control 
                                        type="text"
                                        value={option}
                                        onChange={(e) => handleOptionChange(index, e.target.value)}
                                        className="me-2"
                                      />
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleRemoveOption(index)}
                                        disabled={selectedElement.options?.length === 1}
                                      >
                                        <FaTrash />
                                      </Button>
                                    </div>
                                  ))}
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm" 
                                    onClick={handleAddOption}
                                    className="mt-2"
                                  >
                                    <FaPlus className="me-1" /> Add Option
                                  </Button>
                                </Accordion.Body>
                              </Accordion.Item>
                            </Accordion>
                          )}
                          
                          <div className="d-flex justify-content-between mt-4">
                            <div>
                              <Button 
                                variant="outline-danger" 
                                onClick={handleDeleteElement}
                              >
                                <FaTrash className="me-1" /> Delete
                              </Button>
                            </div>
                            <div>
                              <Button 
                                variant="outline-secondary" 
                                className="me-2"
                                onClick={() => handleMoveElement('up')}
                                disabled={formElements.indexOf(selectedElement) === 0}
                              >
                                <FaArrowUp />
                              </Button>
                              <Button 
                                variant="outline-secondary"
                                onClick={() => handleMoveElement('down')}
                                disabled={formElements.indexOf(selectedElement) === formElements.length - 1}
                              >
                                <FaArrowDown />
                              </Button>
                            </div>
                          </div>
                        </Form>
                      </Card.Body>
                    </Card>
                  ) : (
                    <div className="text-center p-4 text-muted">
                      <p>Select an element to edit its properties</p>
                    </div>
                  )}
                </Tab>
              </Tabs>
            </Col>
            <Col md={9}>
              <Card className="form-canvas">
                <Card.Header className="bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Form Layout</h5>
                    <Button variant="link" className="p-0 text-decoration-none">
                      <FaCode className="me-1" /> View Code
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-4">
                  {formElements.length === 0 ? (
                    <div className="text-center p-5 border rounded bg-light">
                      <p className="mb-0">Drag elements from the left panel to build your form</p>
                    </div>
                  ) : (
                    <Form>
                      {formElements.map(element => (
                        <div 
                          key={element.id} 
                          onClick={() => handleElementSelect(element)}
                          className={`form-element-wrapper p-2 mb-2 rounded ${selectedElement?.id === element.id ? 'border border-primary' : 'border border-light'}`}
                        >
                          {renderElementPreview(element)}
                        </div>
                      ))}
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveForm}>
          <FaSave className="me-1" /> Save Form
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormDesignerModal;
