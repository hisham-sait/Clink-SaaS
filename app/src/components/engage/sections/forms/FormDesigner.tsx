import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Button, Row, Col, Form, Accordion, Alert, Spinner } from 'react-bootstrap';
import { 
  FaSave, FaPlus, FaTrash, FaArrowUp, FaArrowDown, FaCog, FaEye, FaCode,
  FaArrowLeft, FaSlidersH
} from 'react-icons/fa';
import FormElements from '../../elements/FormElements';
import { FormsService } from '../../../../services/engage';

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

const FormDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const [formTitle, setFormTitle] = useState('New Form');
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSettings, setFormSettings] = useState({
    showSubmitButton: true,
    submitButtonText: 'Submit',
    showResetButton: false,
    resetButtonText: 'Reset',
    redirectAfterSubmit: false,
    redirectUrl: '',
    emailNotification: false,
    notificationEmail: ''
  });

  // Load form data if editing an existing form
  useEffect(() => {
    if (formId && formId !== 'new') {
      const fetchFormData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const form = await FormsService.getFormById(formId);
          
          setFormTitle(form.title);
          setFormElements(form.elements || []);
          setFormSettings(form.settings || {
            showSubmitButton: true,
            submitButtonText: 'Submit',
            showResetButton: false,
            resetButtonText: 'Reset',
            redirectAfterSubmit: false,
            redirectUrl: '',
            emailNotification: false,
            notificationEmail: ''
          });
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading form:', error);
          setError('Failed to load form data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchFormData();
    }
  }, [formId]);

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
  };

  const handleElementSelect = (element: FormElement) => {
    setSelectedElement(element);
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

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    setFormSettings({
      ...formSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveForm = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = {
        title: formTitle,
        elements: formElements,
        settings: formSettings
      };
      
      if (formId && formId !== 'new') {
        // Update existing form
        await FormsService.updateForm(formId, formData);
      } else {
        // Create new form
        const newForm = await FormsService.createForm(formData);
        // Optionally redirect to the edit page for the new form
        navigate(`/engage/forms/designer/${newForm.id}`);
        return; // Return early to prevent the navigate below
      }
      
      setLoading(false);
      navigate('/engage/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      setError('Failed to save form. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/engage/forms');
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
    <div className="container-fluid py-4">
      {/* Header */}
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft className="me-2" />
            Back to Forms
          </Button>
          <div>
            <h1 className="h3 mb-0">Form Designer: {formTitle}</h1>
            <p className="text-muted mb-0">Design your form by adding and configuring elements</p>
          </div>
        </div>
        <div>
          <Button 
            variant={previewMode ? "outline-primary" : "outline-secondary"} 
            className="me-2"
            onClick={() => setPreviewMode(!previewMode)}
            disabled={loading}
          >
            <FaEye className="me-1" /> Preview
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveForm} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-1" /> Save Form
              </>
            )}
          </Button>
        </div>
      </div>

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
              {formSettings.showSubmitButton && (
                <Button variant="primary" className="me-2">{formSettings.submitButtonText}</Button>
              )}
              {formSettings.showResetButton && (
                <Button variant="outline-secondary">{formSettings.resetButtonText}</Button>
              )}
            </div>
          </Form>
        </Card>
      ) : (
        <Row>
          {/* Left Panel - Elements Accordion */}
          <Col md={3}>
            <FormElements onAddElement={handleAddElement} />
          </Col>

          {/* Main Content Area */}
          <Col md={6}>
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
                    <p className="mb-0">Add elements from the left panel to build your form</p>
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

          {/* Right Panel - Properties and Settings Accordions */}
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
                  ) : (
                    <div className="text-center p-4 text-muted">
                      <p>Select an element to edit its properties</p>
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            
            {/* Settings Accordion */}
            <Accordion className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="d-flex align-items-center">
                    <FaSlidersH className="me-2" />
                    <span>Settings</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="showSubmitButton"
                        label="Show submit button"
                        name="showSubmitButton"
                        checked={formSettings.showSubmitButton}
                        onChange={handleSettingsChange}
                      />
                    </Form.Group>
                    
                    {formSettings.showSubmitButton && (
                      <Form.Group className="mb-3">
                        <Form.Label>Submit button text</Form.Label>
                        <Form.Control 
                          type="text"
                          name="submitButtonText"
                          value={formSettings.submitButtonText}
                          onChange={handleSettingsChange}
                        />
                      </Form.Group>
                    )}
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="showResetButton"
                        label="Show reset button"
                        name="showResetButton"
                        checked={formSettings.showResetButton}
                        onChange={handleSettingsChange}
                      />
                    </Form.Group>
                    
                    {formSettings.showResetButton && (
                      <Form.Group className="mb-3">
                        <Form.Label>Reset button text</Form.Label>
                        <Form.Control 
                          type="text"
                          name="resetButtonText"
                          value={formSettings.resetButtonText}
                          onChange={handleSettingsChange}
                        />
                      </Form.Group>
                    )}
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="redirectAfterSubmit"
                        label="Redirect after submit"
                        name="redirectAfterSubmit"
                        checked={formSettings.redirectAfterSubmit}
                        onChange={handleSettingsChange}
                      />
                    </Form.Group>
                    
                    {formSettings.redirectAfterSubmit && (
                      <Form.Group className="mb-3">
                        <Form.Label>Redirect URL</Form.Label>
                        <Form.Control 
                          type="text"
                          name="redirectUrl"
                          value={formSettings.redirectUrl}
                          onChange={handleSettingsChange}
                          placeholder="https://example.com/thank-you"
                        />
                      </Form.Group>
                    )}
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="emailNotification"
                        label="Email notification on submit"
                        name="emailNotification"
                        checked={formSettings.emailNotification}
                        onChange={handleSettingsChange}
                      />
                    </Form.Group>
                    
                    {formSettings.emailNotification && (
                      <Form.Group className="mb-3">
                        <Form.Label>Notification email</Form.Label>
                        <Form.Control 
                          type="email"
                          name="notificationEmail"
                          value={formSettings.notificationEmail}
                          onChange={handleSettingsChange}
                          placeholder="your@email.com"
                        />
                      </Form.Group>
                    )}
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default FormDesigner;
