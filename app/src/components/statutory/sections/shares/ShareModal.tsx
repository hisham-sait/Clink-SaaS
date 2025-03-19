import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';

import { Share } from '../../../../services/statutory/types';

interface ShareModalProps {
  show: boolean;
  onHide: () => void;
  share?: Share;
  onSuccess: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ show, onHide, share, onSuccess }) => {
  const { user } = useAuth();
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Share>({
    class: '',
    type: 'Ordinary',
    nominalValue: 0,
    currency: 'EUR',
    votingRights: true,
    dividendRights: true,
    transferable: true,
    totalIssued: 0,
    status: 'Active',
    description: ''
  });

  useEffect(() => {
    if (share) {
      setFormData(share);
    } else {
      setFormData({
        class: '',
        type: 'Ordinary',
        nominalValue: 0,
        currency: 'EUR',
        votingRights: true,
        dividendRights: true,
        transferable: true,
        totalIssued: 0,
        status: 'Active',
        description: ''
      });
    }
    setValidated(false);
    setError('');
  }, [share, show]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (share?.id) {
        await api.put(`/statutory/shares/${user?.companyId}/${share.id}`, {
          ...formData,
          user: user?.email
        });
      } else {
        await api.post(`/statutory/shares/${user?.companyId}`, {
          ...formData,
          user: user?.email
        });
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.error || 'An error occurred while saving the share class');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : type === 'number' 
          ? parseFloat(value) 
          : value
    }));
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} size="lg">
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>{share ? 'Edit Share Class' : 'Add Share Class'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <Form.Group className="mb-3">
            <Form.Label>Share Class Name</Form.Label>
            <Form.Control
              required
              type="text"
              name="class"
              value={formData.class}
              onChange={handleChange}
              placeholder="e.g., Ordinary A"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Share Type</Form.Label>
            <Form.Select
              required
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Ordinary">Ordinary</option>
              <option value="Preferential">Preferential</option>
              <option value="Deferred">Deferred</option>
            </Form.Select>
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nominal Value</Form.Label>
                <Form.Control
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  name="nominalValue"
                  value={formData.nominalValue}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Currency</Form.Label>
                <Form.Select
                  required
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Total Issued Shares</Form.Label>
                <Form.Control
                  required
                  type="number"
                  min="0"
                  name="totalIssued"
                  value={formData.totalIssued}
                  onChange={handleChange}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  required
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Archived">Archived</option>
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-4">
              <Form.Check
                type="checkbox"
                label="Voting Rights"
                name="votingRights"
                checked={formData.votingRights}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <Form.Check
                type="checkbox"
                label="Dividend Rights"
                name="dividendRights"
                checked={formData.dividendRights}
                onChange={handleChange}
              />
            </div>
            <div className="col-md-4">
              <Form.Check
                type="checkbox"
                label="Transferable"
                name="transferable"
                checked={formData.transferable}
                onChange={handleChange}
              />
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about this share class..."
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

export default ShareModal;
