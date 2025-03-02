import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  mapping?: {
    entity: 'contact' | 'organisation';
    field: string;
  };
  style?: {
    labelColor?: string;
    labelSize?: string;
    inputColor?: string;
    backgroundColor?: string;
    borderColor?: string;
    borderRadius?: string;
    padding?: string;
  };
}

interface FormStyle {
  theme: 'light' | 'dark';
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: string;
  borderRadius: string;
  buttonStyle: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    padding: string;
  };
  spacing: string;
  containerPadding: string;
  boxShadow?: string;
}

interface LeadForm {
  id?: string;
  name: string;
  fields: FormField[];
  successMessage: string;
  redirectUrl?: string;
  active: boolean;
  createOrganisation?: boolean;
  styling?: FormStyle;
}

interface FormModalProps {
  show: boolean;
  onHide: () => void;
  form?: LeadForm;
  onSuccess: () => void;
}

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};

const defaultFormStyle: FormStyle = {
  theme: 'light',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  primaryColor: '#007bff',
  secondaryColor: '#6c757d',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  borderRadius: '4px',
  buttonStyle: {
    backgroundColor: '#007bff',
    textColor: '#ffffff',
    borderRadius: '4px',
    padding: '10px 20px'
  },
  spacing: '20px',
  containerPadding: '30px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
};

const FormModal: React.FC<FormModalProps> = ({ show, onHide, form, onSuccess }) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<LeadForm>({
    name: '',
    fields: [],
    successMessage: 'Thank you for your submission!',
    active: true,
    styling: { ...defaultFormStyle }
  });

  useEffect(() => {
    if (form) {
      setFormData({
        ...form,
        styling: form.styling ? { ...defaultFormStyle, ...form.styling } : { ...defaultFormStyle }
      });
    } else {
      setFormData({
        name: '',
        fields: [],
        successMessage: 'Thank you for your submission!',
        active: true,
        styling: { ...defaultFormStyle }
      });
    }
  }, [form]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Ensure styling is properly structured
      const styling = formData.styling || { ...defaultFormStyle };
      
      // Clean up any undefined or circular references
      const dataToSend = {
        ...formData,
        fields: formData.fields.map(field => ({
          ...field,
          style: field.style || {}
        })),
        styling: {
          theme: styling.theme || 'light',
          backgroundColor: styling.backgroundColor || '#ffffff',
          textColor: styling.textColor || '#333333',
          primaryColor: styling.primaryColor || '#007bff',
          secondaryColor: styling.secondaryColor || '#6c757d',
          fontFamily: styling.fontFamily || 'Arial, sans-serif',
          fontSize: styling.fontSize || '16px',
          borderRadius: styling.borderRadius || '4px',
          buttonStyle: {
            backgroundColor: styling.buttonStyle?.backgroundColor || '#007bff',
            textColor: styling.buttonStyle?.textColor || '#ffffff',
            borderRadius: styling.buttonStyle?.borderRadius || '4px',
            padding: styling.buttonStyle?.padding || '10px 20px'
          },
          spacing: styling.spacing || '20px',
          containerPadding: styling.containerPadding || '30px',
          boxShadow: styling.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'
        }
      };

      if (form?.id) {
        await api.put(`/crm/forms/${user?.companyId}/${form.id}`, dataToSend);
      } else {
        await api.post(`/crm/forms/${user?.companyId}`, dataToSend);
      }
      onSuccess();
      onHide();
    } catch (err) {
      console.error('Error saving form:', err);
      setError('Failed to save form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      type: 'text',
      label: 'New Field',
      required: false
    };
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleFieldChange = (index: number, field: Partial<FormField>) => {
    const updatedFields = [...formData.fields];
    updatedFields[index] = { ...updatedFields[index], ...field };
    setFormData(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  const handleRemoveField = (index: number) => {
    const updatedFields = formData.fields.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      fields: updatedFields
    }));
  };

  // Initialize Bootstrap tabs
  useEffect(() => {
    if (show) {
      const tabElements = document.querySelectorAll('[data-bs-toggle="pill"]');
      tabElements.forEach(element => {
        const tab = new bootstrap.Tab(element);
        element.addEventListener('click', (e) => {
          e.preventDefault();
          tab.show();
        });
      });

      // Show the first tab by default
      const firstTab = document.querySelector('[data-bs-toggle="pill"]');
      if (firstTab) {
        new bootstrap.Tab(firstTab).show();
      }
    }
  }, [show]);

  const handlePreview = () => {
    setPreviewOpen(true);
  };

  return (
    <>
      <Modal show={show} onHide={onHide} size="lg">
        <Form onSubmit={handleSubmit}>
          <Modal.Header closeButton className="d-flex justify-content-between align-items-center">
            <Modal.Title>{form ? 'Edit Form' : 'Create Form'}</Modal.Title>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={handlePreview}
              className="ms-2"
            >
              <i className="bi bi-eye me-1"></i>
              Preview
            </Button>
          </Modal.Header>
          <Modal.Body>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="modal-tabs-container">
              <div className="nav flex-column nav-pills modal-nav-pills">
                <div className="nav-link active d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#basic-info">
                  <i className="bi bi-info-circle me-2"></i>
                  Basic Information
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#fields">
                  <i className="bi bi-input-cursor-text me-2"></i>
                  Form Fields
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#mapping">
                  <i className="bi bi-diagram-2 me-2"></i>
                  Field Mapping
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#styling">
                  <i className="bi bi-palette me-2"></i>
                  Form Styling
                </div>
                <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#settings">
                  <i className="bi bi-gear me-2"></i>
                  Settings
                </div>
              </div>

              <div className="tab-content modal-tab-content">
                {/* Basic Information Tab */}
                <div className="tab-pane fade show active" id="basic-info">
                  <Form.Group className="mb-3">
                    <Form.Label>Form Name</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </div>

                {/* Form Fields Tab */}
                <div className="tab-pane fade" id="fields">
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Form.Label className="mb-0">Form Fields</Form.Label>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={handleAddField}
                      >
                        <i className="bi bi-plus-lg me-1"></i>
                        Add Field
                      </Button>
                    </div>

                    {formData.fields.map((field, index) => (
                      <div key={field.id} className="card mb-2">
                        <div className="card-body">
                          <div className="row g-3">
                            <div className="col-md-3">
                              <Form.Select
                                size="sm"
                                value={field.type}
                                onChange={(e) => handleFieldChange(index, { type: e.target.value as FormField['type'] })}
                              >
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="textarea">Text Area</option>
                                <option value="select">Select</option>
                                <option value="checkbox">Checkbox</option>
                              </Form.Select>
                            </div>
                            <div className="col-md">
                              <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Label"
                                value={field.label}
                                onChange={(e) => handleFieldChange(index, { label: e.target.value })}
                              />
                            </div>
                            <div className="col-md">
                              <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Placeholder"
                                value={field.placeholder || ''}
                                onChange={(e) => handleFieldChange(index, { placeholder: e.target.value })}
                              />
                            </div>
                            <div className="col-auto">
                              <Form.Check
                                type="checkbox"
                                label="Required"
                                checked={field.required}
                                onChange={(e) => handleFieldChange(index, { required: e.target.checked })}
                              />
                            </div>
                            <div className="col-auto">
                              <Button
                                variant="link"
                                className="text-danger p-0"
                                onClick={() => handleRemoveField(index)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            </div>
                          </div>
                          {field.type === 'select' && (
                            <div className="mt-2">
                              <Form.Control
                                size="sm"
                                type="text"
                                placeholder="Options (comma-separated)"
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => handleFieldChange(index, {
                                  options: e.target.value.split(',').map(opt => opt.trim())
                                })}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Success Message</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.successMessage}
                      onChange={(e) => setFormData(prev => ({ ...prev, successMessage: e.target.value }))}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Redirect URL (Optional)</Form.Label>
                    <Form.Control
                      type="url"
                      value={formData.redirectUrl || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, redirectUrl: e.target.value }))}
                      placeholder="https://example.com/thank-you"
                    />
                  </Form.Group>
                </div>

                {/* Field Mapping Tab */}
                <div className="tab-pane fade" id="mapping">
                  <div className="alert alert-info">
                    <small>Map form fields to contact or organisation properties. This determines how form submissions are stored in your CRM.</small>
                  </div>
                  {formData.fields.map((field, index) => (
                    <div key={field.id} className="mb-2">
                      <div className="d-flex align-items-center gap-2">
                        <small className="text-muted">{field.label}:</small>
                        <Form.Select
                          size="sm"
                          value={field.mapping?.entity || ''}
                          onChange={(e) => {
                            const entity = e.target.value as 'contact' | 'organisation' | '';
                            handleFieldChange(index, {
                              mapping: entity ? { entity, field: '' } : undefined
                            });
                          }}
                          style={{ width: 'auto' }}
                        >
                          <option value="">No Mapping</option>
                          <option value="contact">Contact</option>
                          <option value="organisation">Organisation</option>
                        </Form.Select>
                        {field.mapping?.entity && (
                          <Form.Select
                            size="sm"
                            value={field.mapping.field}
                            onChange={(e) => {
                              handleFieldChange(index, {
                                mapping: {
                                  ...field.mapping!,
                                  field: e.target.value
                                }
                              });
                            }}
                            style={{ width: 'auto' }}
                          >
                            <option value="">Select Field</option>
                            {field.mapping.entity === 'contact' ? (
                              <>
                                <option value="title">Title</option>
                                <option value="firstName">First Name</option>
                                <option value="lastName">Last Name</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="mobile">Mobile</option>
                                <option value="department">Department</option>
                                <option value="position">Position</option>
                              </>
                            ) : (
                              <>
                                <option value="name">Name</option>
                                <option value="industry">Industry</option>
                                <option value="website">Website</option>
                                <option value="email">Email</option>
                                <option value="phone">Phone</option>
                                <option value="billingAddress">Billing Address</option>
                                <option value="shippingAddress">Shipping Address</option>
                              </>
                            )}
                          </Form.Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Styling Tab */}
                <div className="tab-pane fade" id="styling">
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Theme</Form.Label>
                        <Form.Select
                          value={formData.styling?.theme || 'light'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              theme: e.target.value as 'light' | 'dark'
                            }
                          }))}
                        >
                          <option value="light">Light</option>
                          <option value="dark">Dark</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Font Family</Form.Label>
                        <Form.Select
                          value={formData.styling?.fontFamily || 'Arial, sans-serif'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              fontFamily: e.target.value
                            }
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                        </Form.Select>
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Background Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.backgroundColor || '#ffffff'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              backgroundColor: e.target.value
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Text Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.textColor || '#333333'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              textColor: e.target.value
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Primary Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.primaryColor || '#007bff'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              primaryColor: e.target.value
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Secondary Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.secondaryColor || '#6c757d'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              secondaryColor: e.target.value
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <h6 className="mt-4">Button Style</h6>
                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Button Background</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.buttonStyle?.backgroundColor || '#007bff'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              buttonStyle: {
                                ...(prev.styling?.buttonStyle || defaultFormStyle.buttonStyle),
                                backgroundColor: e.target.value
                              }
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Button Text Color</Form.Label>
                        <Form.Control
                          type="color"
                          value={formData.styling?.buttonStyle?.textColor || '#ffffff'}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            styling: {
                              ...(prev.styling || defaultFormStyle),
                              buttonStyle: {
                                ...(prev.styling?.buttonStyle || defaultFormStyle.buttonStyle),
                                textColor: e.target.value
                              }
                            }
                          }))}
                        />
                      </Form.Group>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Border Radius</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            value={parseInt(formData.styling?.borderRadius || '4')}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              styling: {
                                ...(prev.styling || defaultFormStyle),
                                borderRadius: `${e.target.value}px`
                              }
                            }))}
                          />
                          <InputGroup.Text>px</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </div>
                    <div className="col-md-6">
                      <Form.Group className="mb-3">
                        <Form.Label>Spacing</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type="number"
                            value={parseInt(formData.styling?.spacing || '20')}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              styling: {
                                ...(prev.styling || defaultFormStyle),
                                spacing: `${e.target.value}px`
                              }
                            }))}
                          />
                          <InputGroup.Text>px</InputGroup.Text>
                        </InputGroup>
                      </Form.Group>
                    </div>
                  </div>
                </div>

                {/* Settings Tab */}
                <div className="tab-pane fade" id="settings">
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Create Organisation from Form Data"
                      checked={formData.createOrganisation || false}
                      onChange={(e) => setFormData(prev => ({ ...prev, createOrganisation: e.target.checked }))}
                    />
                    {formData.createOrganisation && (
                      <small className="text-muted d-block mt-1">
                        When enabled, an organisation will be created and linked to the contact if organisation fields are mapped.
                      </small>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      label="Active"
                      checked={formData.active}
                      onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    />
                  </Form.Group>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Form'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Preview Modal */}
      <Modal show={previewOpen} onHide={() => setPreviewOpen(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Form Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div
            style={{
              backgroundColor: formData.styling?.backgroundColor || '#ffffff',
              color: formData.styling?.textColor || '#333333',
              fontFamily: formData.styling?.fontFamily || 'Arial, sans-serif',
              padding: formData.styling?.containerPadding || '30px',
              borderRadius: formData.styling?.borderRadius || '4px',
              boxShadow: formData.styling?.boxShadow || '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <Form>
              {formData.fields.map((field: FormField) => (
                <Form.Group key={field.id} className="mb-3">
                  <Form.Label
                    style={{
                      color: field.style?.labelColor || formData.styling?.textColor || '#333333',
                      fontSize: field.style?.labelSize || formData.styling?.fontSize || '16px'
                    }}
                  >
                    {field.label}
                    {field.required && <span className="text-danger">*</span>}
                  </Form.Label>
                  {field.type === 'textarea' ? (
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder={field.placeholder}
                      style={{
                        backgroundColor: field.style?.backgroundColor || '#ffffff',
                        borderColor: field.style?.borderColor || '#ced4da',
                        borderRadius: field.style?.borderRadius || '4px',
                        padding: field.style?.padding || '8px 12px'
                      }}
                    />
                  ) : field.type === 'select' ? (
                    <Form.Select
                      style={{
                        backgroundColor: field.style?.backgroundColor || '#ffffff',
                        borderColor: field.style?.borderColor || '#ced4da',
                        borderRadius: field.style?.borderRadius || '4px',
                        padding: field.style?.padding || '8px 12px'
                      }}
                    >
                      <option value="">{field.placeholder || 'Select...'}</option>
                      {field.options?.map((opt: string) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </Form.Select>
                  ) : field.type === 'checkbox' ? (
                    <Form.Check
                      type="checkbox"
                      label={field.placeholder || field.label}
                    />
                  ) : (
                    <Form.Control
                      type={field.type}
                      placeholder={field.placeholder}
                      style={{
                        backgroundColor: field.style?.backgroundColor || '#ffffff',
                        borderColor: field.style?.borderColor || '#ced4da',
                        borderRadius: field.style?.borderRadius || '4px',
                        padding: field.style?.padding || '8px 12px'
                      }}
                    />
                  )}
                </Form.Group>
              ))}
              <Button
                style={{
                  backgroundColor: formData.styling?.buttonStyle?.backgroundColor || '#007bff',
                  color: formData.styling?.buttonStyle?.textColor || '#ffffff',
                  borderRadius: formData.styling?.buttonStyle?.borderRadius || '4px',
                  padding: formData.styling?.buttonStyle?.padding || '10px 20px',
                  border: 'none'
                }}
              >
                Submit
              </Button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default FormModal;
