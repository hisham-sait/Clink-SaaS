import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

interface ChargeModalProps {
  show: boolean;
  onHide: () => void;
  charge?: Charge;
  onSuccess: () => void;
}

interface Charge {
  id?: string;
  chargeId: string;
  chargeType: string;
  amount: number;
  dateCreated: string;
  registrationDate: string;
  description: string;
  status: 'Active' | 'Satisfied' | 'Released';
  satisfactionDate?: string;
  company?: {
    name: string;
    legalName: string;
  };
}

const ChargeModal: React.FC<ChargeModalProps> = ({ show, onHide, charge, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<Charge>({
    chargeId: '',
    chargeType: '',
    amount: 0,
    dateCreated: '',
    registrationDate: '',
    description: '',
    status: 'Active'
  });

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

  useEffect(() => {
    if (charge) {
      setFormData({
        ...charge,
        dateCreated: new Date(charge.dateCreated).toISOString().split('T')[0],
        registrationDate: new Date(charge.registrationDate).toISOString().split('T')[0],
        satisfactionDate: charge.satisfactionDate ? new Date(charge.satisfactionDate).toISOString().split('T')[0] : undefined
      });
    } else {
      setFormData({
        chargeId: '',
        chargeType: '',
        amount: 0,
        dateCreated: '',
        registrationDate: '',
        description: '',
        status: 'Active'
      });
    }
    setError('');
  }, [charge, show]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!user?.companyId) {
      setError('No company selected');
      setLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.chargeId || !formData.chargeType || !formData.amount || 
        !formData.dateCreated || !formData.registrationDate || !formData.description) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (charge?.id) {
        await api.put(`/statutory/charges/${user.companyId}/${charge.id}`, formData);
      } else {
        await api.post(`/statutory/charges/${user.companyId}`, formData);
      }
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      console.error('Error saving charge:', err);
      setError('Failed to save charge. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton style={{ padding: '0.75rem 1rem' }}>
          <Modal.Title style={{ fontSize: '1.1rem' }}>{charge ? 'Edit Charge' : 'Add New Charge'}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0.75rem 1rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && (
            <div className="alert alert-success">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-2 rounded-circle me-3">
                  <FaCheck className="text-success" />
                </div>
                <div>
                  Charge {charge ? 'updated' : 'added'} successfully!
                </div>
              </div>
            </div>
          )}
          
          <Form.Group className="mb-3">
            <RequiredLabel text="Charge ID" tooltip="Unique identifier for the charge" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem',
                height: 'calc(1.5em + 0.75rem + 2px)'
              }}
              type="text"
              name="chargeId"
              value={formData.chargeId}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Charge Type" tooltip="Type or category of the charge" />
                <Form.Select
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  name="chargeType"
                  value={formData.chargeType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Fixed Charge">Fixed Charge</option>
                  <option value="Floating Charge">Floating Charge</option>
                  <option value="Fixed and Floating Charge">Fixed and Floating Charge</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Amount" tooltip="Value of the charge in currency" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Date Created" tooltip="Date when the charge was created" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="dateCreated"
                  value={formData.dateCreated}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Registration Date" tooltip="Date when the charge was registered" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="registrationDate"
                  value={formData.registrationDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <RequiredLabel text="Description" tooltip="Detailed description of the charge" />
            <Form.Control
              style={{ 
                fontSize: '0.875rem',
                padding: '0.375rem 0.75rem'
              }}
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Status" tooltip="Current status of the charge" />
                <Form.Select
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Satisfied">Satisfied</option>
                  <option value="Released">Released</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              {(formData.status === 'Satisfied' || formData.status === 'Released') && (
                <Form.Group className="mb-3">
                  <RequiredLabel text="Satisfaction Date" tooltip="Date when the charge was satisfied or released" />
                  <Form.Control
                    style={{ 
                      fontSize: '0.875rem',
                      padding: '0.375rem 0.75rem',
                      height: 'calc(1.5em + 0.75rem + 2px)'
                    }}
                    type="date"
                    name="satisfactionDate"
                    value={formData.satisfactionDate || ''}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              )}
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

export default ChargeModal;
