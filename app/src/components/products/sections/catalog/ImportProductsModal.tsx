import React from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { FaFileImport, FaDownload } from 'react-icons/fa';

interface ImportProductsModalProps {
  show: boolean;
  onHide: () => void;
  importFile: File | null;
  importLoading: boolean;
  importResult: any | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImportProducts: () => Promise<void>;
  handleDownloadTemplate: () => Promise<void>;
}

const ImportProductsModal: React.FC<ImportProductsModalProps> = ({
  show,
  onHide,
  importFile,
  importLoading,
  importResult,
  handleFileChange,
  handleImportProducts,
  handleDownloadTemplate
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Import Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {importResult ? (
          <div>
            <Alert variant={importResult.success ? 'success' : 'danger'}>
              <Alert.Heading>{importResult.success ? 'Import Successful' : 'Import Failed'}</Alert.Heading>
              <p>
                Processed: {importResult.processed} products<br />
                Succeeded: {importResult.succeeded} products<br />
                Failed: {importResult.failed} products
              </p>
            </Alert>
            
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-3">
                <h6>Errors:</h6>
                <ul className="text-danger">
                  {importResult.errors.map((error: any, index: number) => (
                    <li key={index}>
                      Row {error.row}: {error.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="d-flex justify-content-end mt-3">
              <Button variant="primary" onClick={onHide}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>CSV File</Form.Label>
              <Form.Control 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                disabled={importLoading}
              />
              <Form.Text className="text-muted">
                Upload a CSV file with product data. Make sure it follows the required format.
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={handleDownloadTemplate}
                disabled={importLoading}
              >
                <FaDownload className="me-2" />
                Download Template
              </Button>
              
              <Button 
                variant="primary" 
                onClick={handleImportProducts}
                disabled={!importFile || importLoading}
              >
                {importLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Importing...
                  </>
                ) : (
                  <>
                    <FaFileImport className="me-2" />
                    Import Products
                  </>
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ImportProductsModal;
