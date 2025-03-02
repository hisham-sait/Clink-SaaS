import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Badge } from 'react-bootstrap';
import { FaFileAlt, FaCheckCircle, FaPauseCircle, FaClock } from 'react-icons/fa';
import api from '../../../../services/api';
import { useAuth } from '../../../../contexts/AuthContext';
import FormModal from './FormModal';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface LeadForm {
  id: string;
  name: string;
  fields: FormField[];
  successMessage: string;
  redirectUrl?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const Forms: React.FC = () => {
  const { user } = useAuth();
  const [forms, setForms] = useState<LeadForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      const response = await api.get(`/crm/forms/${user?.companyId}`);
      setForms(response.data);
    } catch (error) {
      console.error('Error loading forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (formId: string, active: boolean) => {
    try {
      await api.patch(`/crm/forms/${user?.companyId}/${formId}`, { active });
      loadForms();
    } catch (error) {
      console.error('Error updating form:', error);
    }
  };

  const handleDelete = async (formId: string) => {
    if (window.confirm('Are you sure you want to delete this form?')) {
      try {
        await api.delete(`/crm/forms/${user?.companyId}/${formId}`);
        loadForms();
      } catch (error) {
        console.error('Error deleting form:', error);
      }
    }
  };

  const handleCopyEmbedCode = async (formId: string) => {
    try {
      const embedCode = `<iframe src="${window.location.origin}/embed/form/${formId}" style="width: 100%; height: 600px; border: none;" title="Lead Generation Form"></iframe>`;
      await navigator.clipboard.writeText(embedCode);
      // Show success toast
      alert('Embed code copied to clipboard!');
    } catch (error) {
      console.error('Error copying embed code:', error);
      alert('Failed to copy embed code');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<LeadForm | undefined>(undefined);

  const handleCreateForm = () => {
    setSelectedForm(undefined);
    setShowModal(true);
  };

  const handleEditForm = (form: LeadForm) => {
    setSelectedForm(form);
    setShowModal(true);
  };

  return (
    <div className="container-fluid py-4">
      <FormModal
        show={showModal}
        onHide={() => setShowModal(false)}
        form={selectedForm}
        onSuccess={loadForms}
      />
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Lead Generation Forms</h1>
          <p className="text-muted mb-0">Create and manage your lead capture forms</p>
        </div>
        <Button variant="primary" onClick={handleCreateForm}>
          <i className="bi bi-plus-lg me-2"></i>
          Create Form
        </Button>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Total Forms</div>
                  <h3 className="mb-0">{forms.length}</h3>
                </div>
                <div className="bg-primary bg-opacity-10 p-3 rounded">
                  <FaFileAlt className="text-primary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Active Forms</div>
                  <h3 className="mb-0">{forms.filter(f => f.active).length}</h3>
                </div>
                <div className="bg-success bg-opacity-10 p-3 rounded">
                  <FaCheckCircle className="text-success" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted mb-1">Inactive Forms</div>
                  <h3 className="mb-0">{forms.filter(f => !f.active).length}</h3>
                </div>
                <div className="bg-secondary bg-opacity-10 p-3 rounded">
                  <FaPauseCircle className="text-secondary" size={24} />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Forms Table */}
      <Card className="mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-4">
              <i className="bi bi-file-earmark-text fs-1 text-muted"></i>
              <p className="mt-2 mb-0">No forms created yet</p>
              <p className="text-muted small">Create your first lead generation form to get started</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Form Name</th>
                  <th>Fields</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>{form.name}</td>
                    <td>{form.fields.length} fields</td>
                    <td>
                      <Badge bg={form.active ? 'success' : 'secondary'}>
                        {form.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td>{new Date(form.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleCopyEmbedCode(form.id)}
                        title="Copy Embed Code"
                      >
                        <i className="bi bi-code-square"></i>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 me-3"
                        onClick={() => handleEditForm(form)}
                        title="Edit Form"
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>
                      <Button
                        variant="link"
                        className="p-0 text-danger"
                        onClick={() => handleDelete(form.id)}
                        title="Delete Form"
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Recent Activities */}
      <Card>
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">
              <FaClock className="me-2" />
              Recent Form Activities
            </h5>
          </div>
          <div className="text-muted small">
            Form submission activities will appear here
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Forms;
