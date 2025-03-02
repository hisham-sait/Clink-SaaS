import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, InputGroup } from 'react-bootstrap';
import * as crmService from '../../../../services/crm';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select fields
}

interface LeadForm {
  id: string;
  name: string;
  fields: FormField[];
  successMessage: string;
  redirectUrl?: string;
  active: boolean;
}

interface Contact {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  department?: string;
  position: string;
  type: string[];
  source?: string;
  status: 'Active' | 'Inactive' | 'Archived';
  lastContact: string;
  nextFollowUp?: string | null;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  mailingAddress?: string;
  otherAddress?: string;
  timezone?: string;
  preferredTime?: string;
  tags: string[];
  notes?: string;
  assignedTo?: string;
  forms?: LeadForm[];
}

interface ContactModalProps {
  show: boolean;
  onHide: () => void;
  contact?: Contact;
  onSuccess: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ show, onHide, contact, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Contact>({
    forms: [],
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    mobile: '',
    department: '',
    position: '',
    type: [],
    source: '',
    status: 'Active',
    lastContact: new Date().toISOString(),
    nextFollowUp: undefined,
    socialProfiles: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    mailingAddress: '',
    otherAddress: '',
    timezone: 'UTC',
    preferredTime: '',
    tags: [],
    notes: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        ...contact,
        lastContact: new Date(contact.lastContact).toISOString(),
        nextFollowUp: contact.nextFollowUp
          ? new Date(contact.nextFollowUp).toISOString()
          : null,
        tags: contact.tags || [],
        socialProfiles: contact.socialProfiles || {
          linkedin: '',
          twitter: '',
          facebook: ''
        }
      });
    } else {
      setFormData({
        title: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        mobile: '',
        department: '',
        position: '',
        type: [],
        source: '',
        status: 'Active',
        lastContact: new Date().toISOString(),
        nextFollowUp: null,
        socialProfiles: {
          linkedin: '',
          twitter: '',
          facebook: ''
        },
        mailingAddress: '',
        otherAddress: '',
        timezone: 'UTC',
        preferredTime: '',
        tags: [],
        notes: '',
        assignedTo: ''
      });
    }
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate required fields
    const requiredFields = ['title', 'firstName', 'lastName', 'email', 'phone', 'position', 'lastContact', 'status'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof Contact]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }

    try {
      // Ensure type array is initialized
      if (!user?.companyId) return;

      const dataToSend = {
        ...formData,
        type: formData.type || [],
        tags: formData.tags || [],
        lastContact: formData.lastContact || new Date().toISOString(),
        nextFollowUp: formData.nextFollowUp || undefined,
        companyId: user.companyId
      };
      
      if (contact?.id) {
        const { companyId, ...updateData } = dataToSend;
        await crmService.updateContact(user.companyId, contact.id, updateData);
      } else {
        await crmService.createContact(user.companyId, dataToSend);
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      console.error('Error saving contact:', err);
      setError(err.response?.data?.details || err.response?.data?.error || 'Failed to save contact. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof Contact] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      const field = name as keyof Contact;
      if (name === 'lastContact' || name === 'nextFollowUp') {
        // Convert datetime-local value to ISO string
        setFormData(prev => ({
          ...prev,
          [field]: value ? new Date(value).toISOString() : null
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
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

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      type: prev.type.includes(value)
        ? prev.type.filter(t => t !== value)
        : [...prev.type, value]
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <div className="d-flex justify-content-between align-items-center w-100">
            <Modal.Title>{contact ? 'Edit Contact' : 'Add New Contact'}</Modal.Title>
            {!contact && (
              <div>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => {
                    window.open('/api/crm/contacts/import/template', '_blank');
                  }}
                >
                  <i className="bi bi-download me-2"></i>
                  Download Template
                </Button>
                <label className="btn btn-outline-primary btn-sm mb-0">
                  <i className="bi bi-upload me-2"></i>
                  Import Contacts
                  <input
                    type="file"
                    hidden
                    accept=".csv"
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        const formData = new FormData();
                        formData.append('file', e.target.files[0]);
                        try {
                          const response = await api.post(`/crm/contacts/${user?.companyId}/import`, formData, {
                            headers: {
                              'Content-Type': 'multipart/form-data',
                            },
                          });
                          onSuccess();
                          onHide();
                          // Show success message with count
                          if (response.data.count) {
                            alert(`Successfully imported ${response.data.count} contacts`);
                          }
                        } catch (error: any) {
                          console.error('Error importing contacts:', error);
                          // Show validation errors if any
                          if (error.response?.data?.details) {
                            setError(Array.isArray(error.response.data.details) 
                              ? error.response.data.details.join('\n')
                              : error.response.data.details);
                          } else {
                            setError(error.response?.data?.error || 'Failed to import contacts. Please try again.');
                          }
                        }
                      }
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger mx-3 mt-2" role="alert">
              {error}
            </div>
          )}
          <div className="modal-tabs-container">
            <div className="nav flex-column nav-pills modal-nav-pills">
              <div className="nav-link active d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#main-info">
                <i className="bi bi-info-circle me-2"></i>
                Contact Information
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#address-info">
                <i className="bi bi-geo-alt me-2"></i>
                Address Information
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#social-info">
                <i className="bi bi-share me-2"></i>
                Social & Communication
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#forms-info">
                <i className="bi bi-file-earmark-text me-2"></i>
                Forms
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#additional-info">
                <i className="bi bi-three-dots me-2"></i>
                Additional Information
              </div>
            </div>
            <div className="tab-content modal-tab-content">
              {/* Main Information Tab */}
              <div className="tab-pane fade show active" id="main-info">
                <h6 className="text-muted mb-2">Fields marked with <span className="text-danger">*</span> are required</h6>
                <div className="row">
                  <div className="col-md-2">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-person-badge me-2"></i>Title <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        size="sm"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select...</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Ms">Ms</option>
                        <option value="Dr">Dr</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-5">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-person me-2"></i>First Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-5">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-person me-2"></i>Last Name <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1"><i className="bi bi-tags me-2"></i>Contact Type</Form.Label>
                  <div>
                    {['Client', 'Prospect', 'Partner', 'Vendor', 'Other'].map((type) => (
                      <Form.Check
                        key={type}
                        inline
                        type="checkbox"
                        label={type}
                        value={type}
                        checked={formData.type.includes(type)}
                        onChange={handleTypeChange}
                      />
                    ))}
                  </div>
                </Form.Group>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-circle me-2"></i>Status <span className="text-danger">*</span></Form.Label>
                      <Form.Select
                        size="sm"
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Archived">Archived</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-funnel me-2"></i>Lead Source</Form.Label>
                      <Form.Select
                        size="sm"
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Source...</option>
                        <option value="Website">Website</option>
                        <option value="Referral">Referral</option>
                        <option value="Social Media">Social Media</option>
                        <option value="Event">Event</option>
                        <option value="Cold Call">Cold Call</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
                <hr className="my-3" />

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-diagram-3 me-2"></i>Department</Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-briefcase me-2"></i>Position <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="row">
                  <div className="col-md-12">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-envelope me-2"></i>Email <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-telephone me-2"></i>Phone <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-phone me-2"></i>Mobile</Form.Label>
                      <Form.Control
                        size="sm"
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-calendar-event me-2"></i>Last Contact Date <span className="text-danger">*</span></Form.Label>
                      <Form.Control
                        size="sm"
                        type="datetime-local"
                        name="lastContact"
                        value={formData.lastContact.split('.')[0]}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-calendar-check me-2"></i>Next Follow-up</Form.Label>
                      <Form.Control
                        size="sm"
                        type="datetime-local"
                        name="nextFollowUp"
                        value={formData.nextFollowUp ? formData.nextFollowUp.split('.')[0] : ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Address Information Tab */}
              <div className="tab-pane fade" id="address-info">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-envelope-paper me-2"></i>Mailing Address</Form.Label>
                      <Form.Control
                        size="sm"
                        as="textarea"
                        rows={3}
                        name="mailingAddress"
                        value={formData.mailingAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-building me-2"></i>Other Address</Form.Label>
                      <Form.Control
                        size="sm"
                        as="textarea"
                        rows={3}
                        name="otherAddress"
                        value={formData.otherAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1"><i className="bi bi-globe me-2"></i>Timezone</Form.Label>
                  <Form.Select
                    size="sm"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/Dublin">Europe/Dublin</option>
                    <option value="Europe/London">Europe/London</option>
                    {/* Add more timezone options as needed */}
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Social & Communication Tab */}
              <div className="tab-pane fade" id="social-info">
                <div className="row">
                  <div className="col-md-12">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-linkedin me-2"></i>LinkedIn</Form.Label>
                      <Form.Control
                        size="sm"
                        type="url"
                        name="socialProfiles.linkedin"
                        value={formData.socialProfiles?.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/..."
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-twitter me-2"></i>Twitter</Form.Label>
                      <Form.Control
                        size="sm"
                        type="url"
                        name="socialProfiles.twitter"
                        value={formData.socialProfiles?.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/..."
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-2">
                      <Form.Label className="mb-1"><i className="bi bi-facebook me-2"></i>Facebook</Form.Label>
                      <Form.Control
                        size="sm"
                        type="url"
                        name="socialProfiles.facebook"
                        value={formData.socialProfiles?.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/..."
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1"><i className="bi bi-clock me-2"></i>Preferred Contact Time</Form.Label>
                  <Form.Select
                    size="sm"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Time...</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Forms Tab */}
              <div className="tab-pane fade" id="forms-info">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="mb-0">Lead Generation Forms</h5>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      const newForm: LeadForm = {
                        id: Date.now().toString(),
                        name: `Form ${(formData.forms?.length || 0) + 1}`,
                        fields: [],
                        successMessage: 'Thank you for your submission!',
                        active: true
                      };
                      setFormData(prev => ({
                        ...prev,
                        forms: [...(prev.forms || []), newForm]
                      }));
                    }}
                  >
                    <i className="bi bi-plus-lg me-1"></i>
                    Add Form
                  </Button>
                </div>

                {formData.forms?.map((form, formIndex) => (
                  <div key={form.id} className="card mb-2">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center py-2">
                      <div className="d-flex align-items-center">
                        <Form.Control
                          size="sm"
                          type="text"
                          value={form.name}
                          onChange={(e) => {
                            const updatedForms = [...(formData.forms || [])];
                            updatedForms[formIndex] = {
                              ...form,
                              name: e.target.value
                            };
                            setFormData(prev => ({ ...prev, forms: updatedForms }));
                          }}
                          className="form-control-sm me-2"
                          style={{ width: '200px' }}
                        />
                        <Form.Check
                          type="switch"
                          label="Active"
                          checked={form.active}
                          onChange={(e) => {
                            const updatedForms = [...(formData.forms || [])];
                            updatedForms[formIndex] = {
                              ...form,
                              active: e.target.checked
                            };
                            setFormData(prev => ({ ...prev, forms: updatedForms }));
                          }}
                        />
                      </div>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => {
                          const updatedForms = formData.forms?.filter(f => f.id !== form.id);
                          setFormData(prev => ({ ...prev, forms: updatedForms }));
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </div>
                    <div className="card-body py-2">
                      <div className="mb-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => {
                            const newField: FormField = {
                              id: Date.now().toString(),
                              type: 'text',
                              label: 'New Field',
                              required: false
                            };
                            const updatedForms = [...(formData.forms || [])];
                            updatedForms[formIndex] = {
                              ...form,
                              fields: [...form.fields, newField]
                            };
                            setFormData(prev => ({ ...prev, forms: updatedForms }));
                          }}
                        >
                          <i className="bi bi-plus-lg me-1"></i>
                          Add Field
                        </Button>
                      </div>

                      {form.fields.map((field, fieldIndex) => (
                        <div key={field.id} className="card mb-2">
                          <div className="card-body py-2">
                            <div className="row align-items-center">
                              <div className="col-3">
                                <Form.Select
                                  size="sm"
                                  value={field.type}
                                  onChange={(e) => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = [...form.fields];
                                    updatedFields[fieldIndex] = {
                                      ...field,
                                      type: e.target.value as FormField['type']
                                    };
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
                                >
                                  <option value="text">Text</option>
                                  <option value="email">Email</option>
                                  <option value="phone">Phone</option>
                                  <option value="textarea">Text Area</option>
                                  <option value="select">Select</option>
                                  <option value="checkbox">Checkbox</option>
                                </Form.Select>
                              </div>
                              <div className="col">
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  placeholder="Label"
                                  value={field.label}
                                  onChange={(e) => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = [...form.fields];
                                    updatedFields[fieldIndex] = {
                                      ...field,
                                      label: e.target.value
                                    };
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
                                />
                              </div>
                              <div className="col">
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  placeholder="Placeholder"
                                  value={field.placeholder || ''}
                                  onChange={(e) => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = [...form.fields];
                                    updatedFields[fieldIndex] = {
                                      ...field,
                                      placeholder: e.target.value
                                    };
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
                                />
                              </div>
                              <div className="col-auto">
                                <Form.Check
                                  type="checkbox"
                                  label="Required"
                                  checked={field.required}
                                  onChange={(e) => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = [...form.fields];
                                    updatedFields[fieldIndex] = {
                                      ...field,
                                      required: e.target.checked
                                    };
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
                                />
                              </div>
                              <div className="col-auto">
                                <Button
                                  variant="link"
                                  className="text-danger p-0"
                                  onClick={() => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = form.fields.filter(f => f.id !== field.id);
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
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
                                  onChange={(e) => {
                                    const updatedForms = [...(formData.forms || [])];
                                    const updatedFields = [...form.fields];
                                    updatedFields[fieldIndex] = {
                                      ...field,
                                      options: e.target.value.split(',').map(opt => opt.trim())
                                    };
                                    updatedForms[formIndex] = {
                                      ...form,
                                      fields: updatedFields
                                    };
                                    setFormData(prev => ({ ...prev, forms: updatedForms }));
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <div className="mt-3">
                        <Form.Group className="mb-2">
                          <Form.Label className="mb-1">Success Message</Form.Label>
                          <Form.Control
                            size="sm"
                            type="text"
                            value={form.successMessage}
                            onChange={(e) => {
                              const updatedForms = [...(formData.forms || [])];
                              updatedForms[formIndex] = {
                                ...form,
                                successMessage: e.target.value
                              };
                              setFormData(prev => ({ ...prev, forms: updatedForms }));
                            }}
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label className="mb-1">Redirect URL (Optional)</Form.Label>
                          <Form.Control
                            size="sm"
                            type="url"
                            value={form.redirectUrl || ''}
                            onChange={(e) => {
                              const updatedForms = [...(formData.forms || [])];
                              updatedForms[formIndex] = {
                                ...form,
                                redirectUrl: e.target.value
                              };
                              setFormData(prev => ({ ...prev, forms: updatedForms }));
                            }}
                            placeholder="https://example.com/thank-you"
                          />
                        </Form.Group>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Information Tab */}
              <div className="tab-pane fade" id="additional-info">
                <Form.Group className="mb-2">
                  <Form.Label className="mb-1"><i className="bi bi-tags me-2"></i>Tags</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    name="tags"
                    value={formData.tags.join(', ')}
                    onChange={(e) => {
                      const tagsArray = e.target.value.split(',').map(tag => tag.trim());
                      setFormData(prev => ({
                        ...prev,
                        tags: tagsArray.filter(tag => tag !== '')
                      }));
                    }}
                    placeholder="Enter tags separated by commas"
                  />
                </Form.Group>

                <Form.Group className="mb-2">
                  <Form.Label className="mb-1"><i className="bi bi-sticky me-2"></i>Notes</Form.Label>
                  <Form.Control
                    size="sm"
                    as="textarea"
                    rows={3}
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
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
            {loading ? 'Saving...' : 'Save Contact'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ContactModal;
