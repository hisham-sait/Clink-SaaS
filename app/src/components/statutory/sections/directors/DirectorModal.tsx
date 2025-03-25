import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import api from '../../../../services/api';

import { Director } from '../../../../services/statutory/types';
import { 
  parseDate, 
  formatYYYYMMDD, 
  formatDDMMYYYY,
  isValidStatutoryDate,
  isValidDateOfBirth,
  formatStatutoryDate
} from '../../../../utils';

interface DirectorModalProps {
  show: boolean;
  onHide: () => void;
  director?: Director;
  onSuccess: () => void;
}

const DirectorModal: React.FC<DirectorModalProps> = ({ show, onHide, director, onSuccess }) => {
  const [formData, setFormData] = useState<Director>({
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    appointmentDate: formatYYYYMMDD(new Date()),
    directorType: '',
    occupation: '',
    otherDirectorships: '',
    shareholding: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (director) {
      // Parse the dates from DD/MM/YYYY to YYYY-MM-DD for form input
      const dateOfBirth = parseDate(director.dateOfBirth)
      const appointmentDate = parseDate(director.appointmentDate);
      const resignationDate = director.resignationDate ? parseDate(director.resignationDate) : undefined;

      setFormData({
        ...director,
        dateOfBirth: dateOfBirth ? formatYYYYMMDD(dateOfBirth) : '',
        appointmentDate: appointmentDate ? formatYYYYMMDD(appointmentDate) : '',
        resignationDate: resignationDate ? formatYYYYMMDD(resignationDate) : undefined
      });
    }
  }, [director]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // For HTML date inputs, value is already in YYYY-MM-DD format
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
        !formData.appointmentDate || !formData.directorType || !formData.occupation) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Validate dates
    if (!isValidDateOfBirth(formData.dateOfBirth)) {
      setError('Invalid date of birth');
      setLoading(false);
      return;
    }

    const appointmentDate = new Date(formData.appointmentDate);
    if (!isValidStatutoryDate(appointmentDate, { allowFuture: false })) {
      setError('Invalid appointment date');
      setLoading(false);
      return;
    }

    if (formData.resignationDate) {
      const resignationDate = new Date(formData.resignationDate);
      if (!isValidStatutoryDate(resignationDate, { allowFuture: false })) {
        setError('Invalid resignation date');
        setLoading(false);
        return;
      }
      // Ensure resignation date is not before appointment date
      if (resignationDate < appointmentDate) {
        setError('Resignation date cannot be before appointment date');
        setLoading(false);
        return;
      }
    }

    // Convert YYYY-MM-DD dates to DD/MM/YYYY format for API
    const apiData = {
      ...formData,
      dateOfBirth: formatDDMMYYYY(new Date(formData.dateOfBirth)),
      appointmentDate: formatDDMMYYYY(new Date(formData.appointmentDate)),
      resignationDate: formData.resignationDate ? formatDDMMYYYY(new Date(formData.resignationDate)) : undefined,
      status: 'Active'  // Ensure status is set for new directors
    };

    console.log('Sending data to API:', apiData);  // Debug log

    try {
      if (director?.id) {
        await api.put(`/statutory/directors/${user.companyId}/${director.id}`, apiData);
      } else {
        await api.post(`/statutory/directors/${user.companyId}`, apiData);
      }
      setSuccess(true);
      onSuccess();
      // Wait for 1.5 seconds to show success message before closing
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving director:', err);
      if (err.response?.data?.error) {
        setError(`Failed to save director: ${err.response.data.error}`);
      } else {
        setError('Failed to save director. Please try again.');
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
        <Modal.Title style={{ fontSize: '1.1rem' }}>{director ? 'Edit Director' : 'Add Director'}</Modal.Title>
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
                  Director {director ? 'updated' : 'added'} successfully!
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
                <RequiredLabel text="Appointment Date" tooltip="Date of appointment to the board" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleDateChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Director Type" tooltip="Role and capacity on the board" />
                <Form.Select
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  name="directorType"
                  value={formData.directorType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Executive Director">Executive Director</option>
                  <option value="Non-Executive Director">Non-Executive Director</option>
                  <option value="Independent Director">Independent Director</option>
                  <option value="Managing Director">Managing Director</option>
                  <option value="Company Secretary">Company Secretary</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Occupation" tooltip="Current professional occupation" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Shareholding" tooltip="Number and class of shares held in the company" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="shareholding"
                  value={formData.shareholding}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <RequiredLabel text="Other Directorships" tooltip="Other companies where the person serves as a director" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                height: 'calc(1.5em + 0.75rem + 2px)'
              }}
              type="text"
              name="otherDirectorships"
              value={formData.otherDirectorships}
              onChange={handleChange}
              required
            />
          </Form.Group>
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

export default DirectorModal;
