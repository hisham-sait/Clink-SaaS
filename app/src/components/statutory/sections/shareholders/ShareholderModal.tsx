import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import api from '../../../../services/api';

interface ShareholderModalProps {
  show: boolean;
  onHide: () => void;
  shareholder?: Shareholder;
  onSuccess: () => void;
}

interface Shareholder {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  ordinaryShares: number;
  preferentialShares: number;
  dateAcquired: string;
  status: 'Active' | 'Inactive';
}

const ShareholderModal: React.FC<ShareholderModalProps> = ({ show, onHide, shareholder, onSuccess }) => {
  const [formData, setFormData] = useState<Shareholder>({
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    email: '',
    phone: '',
    ordinaryShares: 0,
    preferentialShares: 0,
    dateAcquired: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formatDateForDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (shareholder) {
      setFormData({
        ...shareholder,
        dateOfBirth: formatDateForDisplay(shareholder.dateOfBirth),
        dateAcquired: formatDateForDisplay(shareholder.dateAcquired)
      });
    }
  }, [shareholder]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const renderTooltip = (text: string) => (
    <Tooltip>{text}</Tooltip>
  );

  const RequiredLabel: React.FC<{ text: string; tooltip?: string }> = ({ text, tooltip }) => (
    <Form.Label className="d-flex align-items-center">
      {text} <span className="text-danger ms-1">*</span>
      {tooltip && (
        <OverlayTrigger placement="top" overlay={renderTooltip(tooltip)}>
          <span className="ms-1">
            <FaInfoCircle className="text-muted" style={{ fontSize: '0.875rem' }} />
          </span>
        </OverlayTrigger>
      )}
    </Form.Label>
  );

  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.companyId) {
      setError('No company selected');
      setLoading(false);
      return;
    }

    // Ensure all required fields are filled
    if (!formData.title || !formData.firstName || !formData.lastName || 
        !formData.dateOfBirth || !formData.nationality || !formData.address || 
        !formData.email || !formData.phone || !formData.dateAcquired) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (shareholder?.id) {
        // Only send fields that can be updated
        const updateData = {
          title: formData.title,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          nationality: formData.nationality,
          address: formData.address,
          email: formData.email,
          phone: formData.phone,
          ordinaryShares: formData.ordinaryShares,
          preferentialShares: formData.preferentialShares,
          dateAcquired: formData.dateAcquired,
          status: formData.status
        };
        await api.put(`/statutory/shareholders/${user.companyId}/${shareholder.id}`, updateData);
      } else {
        await api.post(`/statutory/shareholders/${user.companyId}`, formData);
      }
      setSuccess(true);
      onSuccess();
      // Wait for 1.5 seconds to show success message before closing
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving shareholder:', err);
      if (err.response?.data?.error) {
        setError(`Failed to save shareholder: ${err.response.data.error}`);
      } else {
        setError('Failed to save shareholder. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      size="lg"
      style={{
        '--bs-modal-padding': '0.75rem',
        '--bs-modal-margin': '0.75rem',
      } as React.CSSProperties}
    >
      <Modal.Header closeButton style={{ padding: '0.75rem 1rem' }}>
        <Modal.Title style={{ fontSize: '1.1rem' }}>{shareholder ? 'Edit Shareholder' : 'Add Shareholder'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body style={{ padding: '0.75rem 1rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                  <FaCheck className="text-success" />
                </div>
                <div>
                  Shareholder {shareholder ? 'updated' : 'added'} successfully!
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-2">
            <div className="col-md-4">
              <Form.Group className="mb-2">
                <RequiredLabel text="Title" tooltip="Professional or honorific title" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <RequiredLabel text="First Name" tooltip="Legal first name as per identification documents" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <RequiredLabel text="Last Name" tooltip="Legal last name as per identification documents" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Date of Birth" tooltip="Must be at least 18 years old" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange}
                  required
                  max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Nationality" tooltip="Country of citizenship" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <RequiredLabel text="Address" tooltip="Current residential address" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                height: 'calc(1.5em + 0.75rem + 2px)'
              }}
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Email" tooltip="Primary contact email" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Phone" tooltip="Primary contact number" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <RequiredLabel text="Ordinary Shares" tooltip="Number of ordinary shares held" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="ordinaryShares"
                  value={formData.ordinaryShares}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <RequiredLabel text="Preferential Shares" tooltip="Number of preferential shares held" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="preferentialShares"
                  value={formData.preferentialShares}
                  onChange={handleChange}
                  min="0"
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <RequiredLabel text="Date Acquired" tooltip="Date shares were acquired" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="dateAcquired"
                  value={formData.dateAcquired}
                  onChange={handleDateChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ padding: '0.75rem 1rem', borderTop: '1px solid #dee2e6' }}>
          <Button 
            variant="secondary" 
            onClick={onHide}
            size="sm"
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={loading}
            size="sm"
            style={{ fontSize: '0.875rem', padding: '0.375rem 0.75rem' }}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ShareholderModal;
