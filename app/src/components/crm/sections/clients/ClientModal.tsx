import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import 'bootstrap';

// Initialize Bootstrap Tab type
declare const bootstrap: {
  Tab: new (element: Element) => {
    show(): void;
  };
};

interface Client {
  id?: string;
  name: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  type: string[];
  status: 'Active' | 'Inactive' | 'Archived';
  lastContact: string;
  revenue?: string;
  employeeCount?: number;
  notes?: string;
}

interface ClientModalProps {
  show: boolean;
  onHide: () => void;
  client?: Client;
  onSuccess: () => void;
}

const ClientModal: React.FC<ClientModalProps> = ({ show, onHide, client, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Client>({
    name: '',
    industry: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    type: [],
    status: 'Active',
    lastContact: new Date().toISOString().split('T')[0],
    revenue: '',
    employeeCount: undefined,
    notes: ''
  });

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        lastContact: new Date(client.lastContact).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        name: '',
        industry: '',
        website: '',
        email: '',
        phone: '',
        address: '',
        type: [],
        status: 'Active',
        lastContact: new Date().toISOString().split('T')[0],
        revenue: '',
        employeeCount: undefined,
        notes: ''
      });
    }
  }, [client]);

  // Initialize Bootstrap tabs
  useEffect(() => {
    const tabElements = document.querySelectorAll('[data-bs-toggle="pill"]');
    tabElements.forEach(element => {
      new bootstrap.Tab(element);
    });
  }, [show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (client?.id) {
        await api.put(`/crm/clients/${user?.companyId}/${client.id}`, formData);
      } else {
        await api.post(`/crm/clients/${user?.companyId}`, formData);
      }
      onSuccess();
      onHide();
    } catch (err) {
      console.error('Error saving client:', err);
      setError('Failed to save client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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
          <Modal.Title>{client ? 'Edit Client' : 'Add New Client'}</Modal.Title>
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
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#business-info">
                <i className="bi bi-graph-up me-2"></i>
                Business Details
              </div>
              <div className="nav-link d-flex align-items-center" data-bs-toggle="pill" data-bs-target="#additional-info">
                <i className="bi bi-three-dots me-2"></i>
                Additional Information
              </div>
            </div>
            <div className="tab-content modal-tab-content">
              {/* Basic Information Tab */}
              <div className="tab-pane fade show active" id="basic-info">
                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-person me-2"></i>Client Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-tags me-2"></i>Client Type</Form.Label>
                  <div>
                    {['Prospect', 'Active Client', 'Partner', 'Vendor', 'Other'].map((type) => (
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
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-telephone me-2"></i>Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-globe me-2"></i>Website</Form.Label>
                      <Form.Control
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-calendar-event me-2"></i>Last Contact Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="lastContact"
                        value={formData.lastContact}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label><i className="bi bi-geo-alt me-2"></i>Address</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </div>

              {/* Business Details Tab */}
              <div className="tab-pane fade" id="business-info">
                <div className="row">
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-briefcase me-2"></i>Industry</Form.Label>
                      <Form.Control
                        type="text"
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group className="mb-3">
                      <Form.Label><i className="bi bi-currency-euro me-2"></i>Revenue</Form.Label>
                      <Form.Control
                        type="text"
                        name="revenue"
                        value={formData.revenue}
                        onChange={handleInputChange}
                        placeholder="e.g., €1M - €5M"
                      />
                    </Form.Group>
                  </div>
                </div>

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

              {/* Additional Information Tab */}
              <div className="tab-pane fade" id="additional-info">
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
            {loading ? 'Saving...' : 'Save Client'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ClientModal;
