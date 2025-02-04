import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { Modal, Form, Button } from 'react-bootstrap';
import api from '../../../../services/api';

interface DirectorModalProps {
  show: boolean;
  onHide: () => void;
  director?: Director;
  onSuccess: () => void;
}

interface Director {
  id?: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: 'Active' | 'Resigned';
}

const DirectorModal: React.FC<DirectorModalProps> = ({ show, onHide, director, onSuccess }) => {
  const [formData, setFormData] = useState<Director>({
    title: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    address: '',
    appointmentDate: new Date().toISOString().split('T')[0],
    directorType: '',
    occupation: '',
    otherDirectorships: '',
    shareholding: '',
    status: 'Active'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (director) {
      setFormData({
        ...director,
        dateOfBirth: new Date(director.dateOfBirth).toISOString().split('T')[0],
        appointmentDate: new Date(director.appointmentDate).toISOString().split('T')[0],
        resignationDate: director.resignationDate 
          ? new Date(director.resignationDate).toISOString().split('T')[0]
          : undefined
      });
    }
  }, [director]);

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

    try {
      if (director?.id) {
        await api.put(`/statutory/directors/${user.companyId}/${director.id}`, formData);
      } else {
        await api.post(`/statutory/directors/${user.companyId}`, formData);
      }
      onSuccess();
      onHide();
    } catch (err) {
      setError('Failed to save director');
      console.error('Error saving director:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{director ? 'Edit Director' : 'Add Director'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="row">
            <div className="col-md-4">
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
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
                <Form.Label>First Name</Form.Label>
                <Form.Control
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
                <Form.Label>Last Name</Form.Label>
                <Form.Control
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
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Nationality</Form.Label>
                <Form.Control
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
            <Form.Label>Address</Form.Label>
            <Form.Control
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
                <Form.Label>Appointment Date</Form.Label>
                <Form.Control
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Director Type</Form.Label>
                <Form.Select
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
                <Form.Label>Occupation</Form.Label>
                <Form.Control
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
                <Form.Label>Shareholding</Form.Label>
                <Form.Control
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
            <Form.Label>Other Directorships</Form.Label>
            <Form.Control
              type="text"
              name="otherDirectorships"
              value={formData.otherDirectorships}
              onChange={handleChange}
              required
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

export default DirectorModal;
