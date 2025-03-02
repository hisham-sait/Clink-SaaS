import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { FaCloudUploadAlt, FaFileDownload, FaUpload } from 'react-icons/fa';
import api from '../../../../services/api';

interface ImportClientModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  companyId: string;
}

const ImportClientModal: React.FC<ImportClientModalProps> = ({ show, onHide, onSuccess, companyId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/crm/clients/import/template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'client_import_template.csv');
      
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

    setLoading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/crm/clients/${companyId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('Clients imported successfully');
      onSuccess();
      setTimeout(() => {
        onHide();
      }, 2000);
    } catch (err) {
      console.error('Error importing clients:', err);
      setError('Failed to import clients. Please check your file and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" dialogClassName="modal-tall">
      <Form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Import Clients</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light p-4">
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert variant="success" className="mb-3">
              {success}
            </Alert>
          )}

          <div className="text-center mb-4 py-4">
            <div className="mb-3">
              <FaCloudUploadAlt size={64} className="text-primary mb-3" />
            </div>
            <h5>Upload Clients CSV File</h5>
            <p className="text-muted">
              Import your clients using our CSV template format
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
              Only CSV files are supported. Make sure your data follows the template format.
            </Form.Text>
          </Form.Group>

          <div className="alert alert-info shadow-sm">
            <h6 className="alert-heading fw-bold mb-3">Import Guidelines:</h6>
            <ul className="mb-0">
              <li>Use the provided template for correct data formatting</li>
              <li>All required fields must be filled</li>
              <li>Dates should be in YYYY-MM-DD format</li>
              <li>Multiple types should be separated by semicolons</li>
              <li>Status must be either Active, Inactive, or Archived</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              <>
                <FaUpload className="me-2" />
                Import Clients
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ImportClientModal;
