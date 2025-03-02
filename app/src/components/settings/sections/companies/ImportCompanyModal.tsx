import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import * as CompaniesService from '../../../../services/settings/companies';
import { handleApiError } from '../../../../services/settings';

interface ImportCompanyModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

const ImportCompanyModal: React.FC<ImportCompanyModalProps> = ({ show, onHide, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await CompaniesService.importCompanies(file);
      onSuccess();
      onHide();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
      <form onSubmit={handleSubmit}>
        <Modal.Header closeButton>
          <Modal.Title>Import Companies</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && (
            <div className="alert alert-danger mb-3">
              {error}
            </div>
          )}
          <p className="text-muted mb-3">
            Upload a CSV or Excel file containing company data. Download the template below for the correct format.
          </p>
          <div className="mb-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => CompaniesService.downloadTemplate()}
              className="d-inline-flex align-items-center gap-2"
            >
              <i className="bi bi-download"></i>
              <span>Download Template</span>
            </Button>
          </div>
          <Form.Group controlId="file">
            <Form.Label>Select File</Form.Label>
            <Form.Control
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
            <Form.Text className="text-muted">
              Supported formats: CSV, Excel (.xlsx, .xls)
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="link" onClick={onHide} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={!file || loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              'Import'
            )}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default ImportCompanyModal;
