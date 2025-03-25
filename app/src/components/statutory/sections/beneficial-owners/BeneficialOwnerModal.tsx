import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import api from '../../../../services/api';

import { BeneficialOwner } from '../../../../services/statutory/types';
import { 
  parseDate, 
  formatYYYYMMDD, 
  formatDDMMYYYY,
  isValidStatutoryDate,
  isValidDateOfBirth,
  formatStatutoryDate
} from '../../../../utils';

interface BeneficialOwnerModalProps {
  show: boolean;
  onHide: () => void;
  owner?: BeneficialOwner;
  onSuccess: () => void;
}

const natureOfControlOptions = [
  'Shares',
  'Voting Rights',
  'Right to Appoint/Remove Directors',
  'Significant Influence/Control',
  'Trust',
  'Partnership',
  'Other'
];

const BeneficialOwnerModal: React.FC<BeneficialOwnerModalProps> = ({ show, onHide, owner, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<BeneficialOwner>({
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    email: '',
    phone: '',
    natureOfControl: [],
    ownershipPercentage: 0,
    registrationDate: formatYYYYMMDD(new Date()),
    status: 'Active',
    description: ''
  });

  const validateForm = () => {
    if (!formData.natureOfControl.length) {
      setError('Please select at least one nature of control option');
      return false;
    }

    if (formData.ownershipPercentage < 0 || formData.ownershipPercentage > 100) {
      setError('Ownership percentage must be between 0 and 100');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Validate dates
    if (!isValidDateOfBirth(formData.dateOfBirth)) {
      setError('Invalid date of birth');
      return false;
    }

    const registrationDate = new Date(formData.registrationDate);
    if (!isValidStatutoryDate(registrationDate, { allowFuture: false })) {
      setError('Invalid registration date');
      return false;
    }

    return true;
  };

  useEffect(() => {
    if (owner) {
      const dateOfBirthObj = parseDate(owner.dateOfBirth);
      const registrationDateObj = parseDate(owner.registrationDate);

      const formattedOwner: BeneficialOwner = {
        ...owner,
        dateOfBirth: dateOfBirthObj ? formatYYYYMMDD(dateOfBirthObj) : '',
        registrationDate: registrationDateObj ? formatYYYYMMDD(registrationDateObj) : '',
        description: owner.description || '' // Ensure description is never undefined
      };
      setFormData(formattedOwner);
    } else {
      setFormData({
        title: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        address: '',
        email: '',
        phone: '',
        natureOfControl: [],
        ownershipPercentage: 0,
        registrationDate: formatYYYYMMDD(new Date()),
        status: 'Active',
        description: ''
      });
    }
  }, [owner]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Convert YYYY-MM-DD dates to DD/MM/YYYY format for API
      const apiData = {
        ...formData,
        dateOfBirth: formatDDMMYYYY(new Date(formData.dateOfBirth)),
        registrationDate: formatDDMMYYYY(new Date(formData.registrationDate)),
        user: user?.email
      };

      if (owner?.id) {
        await api.put(`/statutory/beneficial-owners/${user?.companyId}/${owner.id}`, apiData);
        toast.success('Beneficial owner updated successfully');
      } else {
        await api.post(`/statutory/beneficial-owners/${user?.companyId}`, apiData);
        toast.success('Beneficial owner added successfully');
      }

      onSuccess();
      onHide();
    } catch (err: any) {
      console.error('Error saving beneficial owner:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save beneficial owner. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleNatureOfControlChange = (option: string) => {
    setFormData(prev => ({
      ...prev,
      natureOfControl: prev.natureOfControl.includes(option)
        ? prev.natureOfControl.filter(item => item !== option)
        : [...prev.natureOfControl, option]
    }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>
            {owner ? 'Edit Beneficial Owner' : 'Add Beneficial Owner'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError('')} dismissible>
              {error}
            </Alert>
          )}

          <div className="row">
            <div className="col-md-2">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-5">
              <Form.Group className="mb-3">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.firstName}
                  onChange={e => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-5">
              <Form.Group className="mb-3">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nationality</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.nationality}
                  onChange={e => setFormData(prev => ({ ...prev, nationality: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={formData.address}
              onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Phone</Form.Label>
                <Form.Control
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Nature of Control</Form.Label>
            <div>
              {natureOfControlOptions.map(option => (
                <Form.Check
                  key={option}
                  type="checkbox"
                  label={option}
                  checked={formData.natureOfControl.includes(option)}
                  onChange={() => handleNatureOfControlChange(option)}
                  className="mb-2"
                />
              ))}
            </div>
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Ownership Percentage</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.ownershipPercentage}
                  onChange={e => setFormData(prev => ({ ...prev, ownershipPercentage: parseFloat(e.target.value) }))}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Registration Date</Form.Label>
                <Form.Control
                  type="date"
                  value={formData.registrationDate}
                  onChange={e => setFormData(prev => ({ ...prev, registrationDate: e.target.value }))}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={formData.status}
              onChange={e => setFormData(prev => ({ ...prev, status: e.target.value as 'Active' | 'Inactive' | 'Archived' }))}
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Archived">Archived</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default BeneficialOwnerModal;
