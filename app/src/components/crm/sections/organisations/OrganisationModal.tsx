import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import * as crmService from '../../../../services/crm';
import { useAuth } from '../../../../contexts/AuthContext';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};

interface Organisation {
  id?: string;
  name: string;
  industry?: string;
  subIndustry?: string;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  billingAddress?: string;
  shippingAddress?: string;
  type: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  ownership?: string;
  lastContact?: string;
  nextFollowUp?: string;
  annualRevenue?: number;
  employeeCount?: number;
  rating?: number;
  parentCompany?: string;
  subsidiaries: string[];
  timezone?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  tags: string[];
  notes?: string;
  assignedTo?: string;
}

interface OrganisationModalProps {
  show: boolean;
  onHide: () => void;
  organisation?: Organisation;
  onSuccess: () => void;
}

const OrganisationModal: React.FC<OrganisationModalProps> = ({ show, onHide, organisation, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Organisation>({
    name: '',
    industry: '',
    subIndustry: '',
    website: '',
    email: '',
    phone: '',
    fax: '',
    billingAddress: '',
    shippingAddress: '',
    type: [],
    status: 'Active',
    ownership: '',
    lastContact: new Date().toISOString().split('T')[0],
    nextFollowUp: '',
    annualRevenue: undefined,
    employeeCount: undefined,
    rating: undefined,
    parentCompany: '',
    subsidiaries: [],
    timezone: 'UTC',
    socialProfiles: {
      linkedin: '',
      twitter: '',
      facebook: ''
    },
    tags: [],
    notes: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (organisation) {
      setFormData({
        ...organisation,
        lastContact: organisation.lastContact 
          ? new Date(organisation.lastContact).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        nextFollowUp: organisation.nextFollowUp
          ? new Date(organisation.nextFollowUp).toISOString().split('T')[0]
          : '',
        socialProfiles: organisation.socialProfiles || {
          linkedin: '',
          twitter: '',
          facebook: ''
        },
        tags: organisation.tags || [],
        subsidiaries: organisation.subsidiaries || []
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        subIndustry: '',
        website: '',
        email: '',
        phone: '',
        fax: '',
        billingAddress: '',
        shippingAddress: '',
        type: [],
        status: 'Active',
        ownership: '',
        lastContact: new Date().toISOString().split('T')[0],
        nextFollowUp: '',
        annualRevenue: undefined,
        employeeCount: undefined,
        rating: undefined,
        parentCompany: '',
        subsidiaries: [],
        timezone: 'UTC',
        socialProfiles: {
          linkedin: '',
          twitter: '',
          facebook: ''
        },
        tags: [],
        notes: '',
        assignedTo: ''
      });
    }
  }, [organisation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert date strings to ISO format
      const dataToSend = {
        ...formData,
        lastContact: formData.lastContact ? new Date(formData.lastContact).toISOString() : undefined,
        nextFollowUp: formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString() : undefined
      };

      if (!user?.companyId) {
        setError('No company selected. Please select a company first.');
        return;
      }

      if (organisation?.id) {
        await crmService.updateOrganisation(user.companyId, organisation.id, dataToSend);
      } else {
        await crmService.createOrganisation(user.companyId, dataToSend);
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      console.error('Error saving organisation:', err);
      setError(err.response?.data?.message || 'Failed to save organisation. Please try again.');
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
          ...(prev[parent as keyof Organisation] as Record<string, unknown>),
          [child]: value
        }
      }));
    } else {
      const field = name as keyof Organisation;
      if (field === 'lastContact' || field === 'nextFollowUp') {
        // For date inputs, store as ISO string
        setFormData(prev => ({
          ...prev,
          [field]: value ? new Date(value).toISOString() : undefined
        }));
      } else if (['employeeCount', 'annualRevenue', 'rating'].includes(field)) {
        // For numeric inputs
        setFormData(prev => ({
          ...prev,
          [field]: value ? parseFloat(value) : undefined
        }));
      } else {
        // For all other inputs
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
      }
    }
  };

  // Initialize Bootstrap tabs
  useEffect(() => {
    const tabElements = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabElements.forEach(element => {
      new bootstrap.Tab(element);
    });
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
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{organisation ? 'Edit Organisation' : 'Add New Organisation'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger mx-3 mt-3" role="alert">
              {error}
            </div>
          )}
          <div className="modal-tabs-container">
            <div className="nav flex-column nav-pills modal-nav-pills">
              <div className="nav-link active d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#basic-info">
                <i className="bi bi-info-circle me-2"></i>
                Basic Information
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#contact-info">
                <i className="bi bi-person-lines-fill me-2"></i>
                Contact Details
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#address-info">
                <i className="bi bi-geo-alt me-2"></i>
                Address Information
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#business-info">
                <i className="bi bi-building me-2"></i>
                Business Details
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#social-info">
                <i className="bi bi-share me-2"></i>
                Social & Communication
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#additional-info">
                <i className="bi bi-three-dots me-2"></i>
                Additional Information
              </div>
            </div>
            <div className="tab-content modal-tab-content">

              {/* Basic Information Tab */}
              <div className="tab-pane fade show active" id="basic-info">
                <div className="row">
                  <div className="col-md-12">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-building me-2"></i>Organisation Name</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-briefcase me-2"></i>Industry</Form.Label>
                      <Form.Select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Industry...</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Retail">Retail</option>
                        <option value="Services">Services</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-diagram-3 me-2"></i>Sub-Industry</Form.Label>
                      <Form.Control
                        type="text"
                        name="subIndustry"
                        value={formData.subIndustry}
                        onChange={handleInputChange}
                        placeholder="e.g., Software Development"
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-tags me-2"></i>Organisation Type</Form.Label>
                  <div>
                    {['Customer', 'Supplier', 'Partner', 'Competitor', 'Prospect', 'Other'].map((type) => (
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
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-circle me-2"></i>Status</Form.Label>
                      <Form.Select
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
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-star me-2"></i>Rating</Form.Label>
                      <Form.Select
                        name="rating"
                        value={formData.rating || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Rating...</option>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Contact Details Tab */}
              <div className="tab-pane fade" id="contact-info">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-envelope me-2"></i>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-globe me-2"></i>Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder="https://"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-telephone me-2"></i>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-printer me-2"></i>Fax</Form.Label>
                      <Form.Control
                        type="tel"
                        name="fax"
                        value={formData.fax}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-calendar-event me-2"></i>Last Contact Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="lastContact"
                        value={formData.lastContact ? new Date(formData.lastContact).toISOString().split('T')[0] : ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-calendar-check me-2"></i>Next Follow-up</Form.Label>
                      <Form.Control
                        type="date"
                        name="nextFollowUp"
                        value={formData.nextFollowUp ? new Date(formData.nextFollowUp).toISOString().split('T')[0] : ''}
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
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-envelope-paper me-2"></i>Billing Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-truck me-2"></i>Shipping Address</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-clock me-2"></i>Timezone</Form.Label>
                  <Form.Select
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

              {/* Business Details Tab */}
              <div className="tab-pane fade" id="business-info">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-shield me-2"></i>Ownership</Form.Label>
                      <Form.Select
                        name="ownership"
                        value={formData.ownership}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Ownership...</option>
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                        <option value="Subsidiary">Subsidiary</option>
                        <option value="Government">Government</option>
                        <option value="Non-Profit">Non-Profit</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-currency-euro me-2"></i>Annual Revenue</Form.Label>
                      <Form.Control
                        type="number"
                        name="annualRevenue"
                        value={formData.annualRevenue || ''}
                        onChange={handleInputChange}
                        placeholder="€"
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-people me-2"></i>Employee Count</Form.Label>
                      <Form.Control
                        type="number"
                        name="employeeCount"
                        value={formData.employeeCount || ''}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-diagram-2 me-2"></i>Parent Company</Form.Label>
                      <Form.Control
                        type="text"
                        name="parentCompany"
                        value={formData.parentCompany}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-diagram-3 me-2"></i>Subsidiaries</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.subsidiaries.join(', ')}
                        onChange={(e) => {
                          const subsidiariesArray = e.target.value.split(',').map(s => s.trim());
                          setFormData(prev => ({
                            ...prev,
                            subsidiaries: subsidiariesArray.filter(s => s !== '')
                          }));
                        }}
                        placeholder="Enter subsidiaries separated by commas"
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Social & Communication Tab */}
              <div className="tab-pane fade" id="social-info">
                <div className="row">
                  <div className="col-md-12">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-linkedin me-2"></i>LinkedIn</Form.Label>
                      <Form.Control
                        type="url"
                        name="socialProfiles.linkedin"
                        value={formData.socialProfiles?.linkedin}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/company/..."
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-twitter me-2"></i>Twitter</Form.Label>
                      <Form.Control
                        type="url"
                        name="socialProfiles.twitter"
                        value={formData.socialProfiles?.twitter}
                        onChange={handleInputChange}
                        placeholder="https://twitter.com/..."
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-facebook me-2"></i>Facebook</Form.Label>
                      <Form.Control
                        type="url"
                        name="socialProfiles.facebook"
                        value={formData.socialProfiles?.facebook}
                        onChange={handleInputChange}
                        placeholder="https://facebook.com/..."
                      />
                    </Form.Group>
                  </div>
                </div>
              </div>

              {/* Additional Information Tab */}
              <div className="tab-pane fade" id="additional-info">
                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-tags me-2"></i>Tags</Form.Label>
                  <Form.Control
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

                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-sticky me-2"></i>Notes</Form.Label>
                  <Form.Control
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
            {loading ? 'Saving...' : 'Save Organisation'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default OrganisationModal;
