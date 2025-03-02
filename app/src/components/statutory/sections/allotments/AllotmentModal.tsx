import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { useAuth } from '../../../../contexts/AuthContext';
import api from '../../../../services/api';

interface AllotmentModalProps {
  show: boolean;
  onHide: () => void;
  allotment?: Allotment;
  onSuccess: () => void;
}

interface Allotment {
  id?: string;
  allotmentId: string;
  shareClass: string;
  numberOfShares: number;
  pricePerShare: number;
  allotmentDate: string;
  allottee: string;
  paymentStatus: PaymentStatus;
  amountPaid?: number;
  paymentDate?: string;
  certificateNumber?: string;
  status: 'Active' | 'Cancelled';
  company?: {
    name: string;
    legalName: string;
  };
}

type PaymentStatus = 'Pending' | 'Paid' | 'Partially Paid';

const AllotmentModal: React.FC<AllotmentModalProps> = ({ show, onHide, allotment, onSuccess }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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

  const [formData, setFormData] = useState<Allotment>({
    allotmentId: '',
    shareClass: '',
    numberOfShares: 0,
    pricePerShare: 0,
    allotmentDate: '',
    allottee: '',
    paymentStatus: 'Pending',
    status: 'Active'
  });

  useEffect(() => {
    if (allotment) {
      setFormData({
        ...allotment,
        allotmentDate: new Date(allotment.allotmentDate).toISOString().split('T')[0],
        paymentDate: allotment.paymentDate ? new Date(allotment.paymentDate).toISOString().split('T')[0] : undefined
      });
    } else {
      setFormData({
        allotmentId: '',
        shareClass: '',
        numberOfShares: 0,
        pricePerShare: 0,
        allotmentDate: '',
        allottee: '',
        paymentStatus: 'Pending',
        status: 'Active'
      });
    }
    setError('');
  }, [allotment, show]);

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
    if (!formData.allotmentId || !formData.shareClass || !formData.numberOfShares || 
        !formData.pricePerShare || !formData.allotmentDate || !formData.allottee) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (allotment?.id) {
        await api.put(`/statutory/allotments/${user.companyId}/${allotment.id}`, formData);
      } else {
        await api.post(`/statutory/allotments/${user.companyId}`, formData);
      }
      setSuccess(true);
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err) {
      console.error('Error saving allotment:', err);
      setError('Failed to save allotment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    const { name, value } = target;
    
    if (name === 'numberOfShares' || name === 'pricePerShare' || name === 'amountPaid') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
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
          <Modal.Title style={{ fontSize: '1.1rem' }}>{allotment ? 'Edit Allotment' : 'Add New Allotment'}</Modal.Title>
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
                  Allotment {allotment ? 'updated' : 'added'} successfully!
                </div>
              </div>
            </div>
          )}
          
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Allotment ID" tooltip="Unique identifier for the allotment" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="allotmentId"
                  value={formData.allotmentId}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Share Class" tooltip="Class or type of shares being allotted" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="shareClass"
                  value={formData.shareClass}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Number of Shares" tooltip="Total number of shares being allotted" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="numberOfShares"
                  value={formData.numberOfShares}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Price per Share" tooltip="Price per share in currency" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="number"
                  name="pricePerShare"
                  value={formData.pricePerShare}
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
                <RequiredLabel text="Allotment Date" tooltip="Date when shares were allotted" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="date"
                  name="allotmentDate"
                  value={formData.allotmentDate}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Allottee" tooltip="Name of the person or entity receiving the shares" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="allottee"
                  value={formData.allottee}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
          </div>

          <div className="row g-2">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Payment Status" tooltip="Current payment status of the allotment" />
                <Form.Select
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Partially_Paid">Partially Paid</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <RequiredLabel text="Certificate Number" tooltip="Share certificate number (if issued)" />
                <Form.Control
                  style={{ 
                    fontSize: '0.875rem',
                    padding: '0.375rem 0.75rem',
                    height: 'calc(1.5em + 0.75rem + 2px)'
                  }}
                  type="text"
                  name="certificateNumber"
                  value={formData.certificateNumber || ''}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
          </div>

          {formData.paymentStatus !== 'Pending' && (
            <div className="row g-2">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <RequiredLabel text="Amount Paid" tooltip="Total amount paid for the shares" />
                  <Form.Control
                    style={{ 
                      fontSize: '0.875rem',
                      padding: '0.375rem 0.75rem',
                      height: 'calc(1.5em + 0.75rem + 2px)'
                    }}
                    type="number"
                    name="amountPaid"
                    value={formData.amountPaid || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <RequiredLabel text="Payment Date" tooltip="Date when payment was made" />
                  <Form.Control
                    style={{ 
                      fontSize: '0.875rem',
                      padding: '0.375rem 0.75rem',
                      height: 'calc(1.5em + 0.75rem + 2px)'
                    }}
                    type="date"
                    name="paymentDate"
                    value={formData.paymentDate || ''}
                    onChange={handleChange}
                    required
                    max={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </div>
            </div>
          )}

          {allotment && (
            <Form.Group className="mb-3">
              <RequiredLabel text="Status" tooltip="Current status of the allotment" />
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
                <option value="Cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>
          )}
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

export default AllotmentModal;
