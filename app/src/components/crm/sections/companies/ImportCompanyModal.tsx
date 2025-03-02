import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaCloudUploadAlt, FaFileDownload } from 'react-icons/fa';
import api from '../../../../services/api';

interface ImportCompanyModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  companyId: string;
}

const ImportCompanyModal: React.FC<ImportCompanyModalProps> = ({
  show,
  onHide,
  onSuccess,
  companyId
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/crm/companies/import/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'companies_import_template.csv');
      
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Error downloading template:', error);
      setError('Failed to download template. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.post(`/crm/companies/${companyId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Companies imported successfully');
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 1500);
    } catch (err: any) {
      console.error('Error importing companies:', err);
      setError(err.response?.data?.message || 'Failed to import companies. Please check your file and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-tall">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Import Companies</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <div className="text-center mb-4 py-4">
            <div className="mb-3">
              <FaCloudUploadAlt size={64} className="text-primary mb-3" />
            </div>
            <h5>Upload Companies CSV File</h5>
            <p className="text-muted">
              Import your companies using our CSV template format
            </p>
          </div>

          <div className="d-grid gap-2 mb-4">
            <Button
              variant="outline-primary"
              size="lg"
              className="py-3"
              onClick={downloadTemplate}
            >
              <FaFileDownload className="me-2" />
              Download Import Template
            </Button>
          </div>

          <Form.Group controlId="formFile" className="mb-4">
            <Form.Label className="fw-bold mb-2">Select CSV File</Form.Label>
            <Form.Control
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              required
            />
            <Form.Text className="text-muted">
              Only CSV files are supported
            </Form.Text>
          </Form.Group>

          <div className="alert alert-info shadow-sm">
            <h6 className="alert-heading fw-bold mb-3">Import Guidelines:</h6>
            <ul className="mb-0">
              <li>Use the provided template for correct formatting</li>
              <li>Ensure all required fields are filled</li>
              <li>Date format should be YYYY-MM-DD</li>
              <li>For multiple company types, separate with commas</li>
              <li>Revenue should be in a consistent format (e.g., €1M - €5M)</li>
              <li>Employee count should be numbers only</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading || !file}>
            {loading ? 'Importing...' : 'Import Companies'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ImportCompanyModal;
