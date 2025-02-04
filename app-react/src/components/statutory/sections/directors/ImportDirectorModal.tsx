import React, { useState, useRef } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaDownload, FaUpload } from 'react-icons/fa';
import api from '../../../../services/api';

interface ImportDirectorModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  companyId: string;
}

interface PreviewData {
  title: string;
  firstName: string;
  lastName: string;
  directorType: string;
  appointmentDate: string;
  status: string;
}

const ImportDirectorModal: React.FC<ImportDirectorModalProps> = ({
  show,
  onHide,
  onSuccess,
  companyId
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleFile = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Sample data structure with all possible fields
    const sampleData = [
      {
        title: 'Mr',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        nationality: 'British',
        address: '123 Main St, London, UK',
        appointmentDate: '2025-01-01',
        resignationDate: '',
        directorType: 'Executive Director',
        occupation: 'Business Executive',
        otherDirectorships: 'Company A Ltd, Company B Ltd',
        shareholding: '1000 Ordinary Shares',
        status: 'Active'
      }
    ];

    // Create CSV content
    const headers = [
      'Title',
      'First Name',
      'Last Name',
      'Date of Birth',
      'Nationality',
      'Address',
      'Appointment Date',
      'Resignation Date',
      'Director Type',
      'Occupation',
      'Other Directorships',
      'Shareholding',
      'Status'
    ];
    const csvContent = [
      headers.join(','),
      ...sampleData.map(item => [
        item.title,
        item.firstName,
        item.lastName,
        item.dateOfBirth,
        item.nationality,
        item.address,
        item.appointmentDate,
        item.resignationDate,
        item.directorType,
        item.occupation,
        item.otherDirectorships,
        item.shareholding,
        item.status
      ].join(','))
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'directors_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setLoading(true);
    setLoadingMessage('Analyzing file...');
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/statutory/directors/${companyId}/preview-import`, formData);
      if (response.data.data?.length > 0) {
        setPreviewData(response.data.data);
        setCurrentStep(2);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to preview file. Please check the file format and try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const confirmImport = async () => {
    setLoading(true);
    setLoadingMessage('Importing directors...');
    setError(null);

    try {
      const response = await api.post(`/statutory/directors/${companyId}/confirm-import`);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to import directors. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    setPreviewData([]);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Import Directors</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Step 1: Initial State */}
        {currentStep === 1 && (
          <>
            <p className="mb-4">
              To import directors, please follow these steps:
            </p>
            <ol className="mb-4">
              <li className="mb-2">
                <a href="#" className="text-primary" onClick={downloadSampleFile}>
                  Download the sample file template
                  <FaDownload className="ms-2" />
                </a>
              </li>
              <li className="mb-2">Fill in your director data following the template format</li>
              <li className="mb-2">Upload your completed file</li>
            </ol>

            <div className="text-center">
              <Button variant="primary" onClick={triggerFileInput}>
                <FaUpload className="me-2" />
                Upload File
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="d-none"
                accept=".csv,.xlsx,.xls"
                onChange={onFileSelected}
              />
            </div>
          </>
        )}

        {/* Step 2: Preview Data */}
        {currentStep === 2 && (
          <>
            <Alert variant="info" className="mb-4">
              <i className="bi bi-info-circle me-2"></i>
              Preview of data to be imported
            </Alert>

            {error && (
              <Alert variant="danger" className="mb-4">
                {error}
              </Alert>
            )}

            <div className="mb-4">
              <h6>Total Records: {previewData.length}</h6>
            </div>

            <div className="table-responsive mb-4">
              <table className="table table-sm table-bordered">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Director Type</th>
                    <th>Appointment Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td>{item.title}</td>
                      <td>{item.firstName}</td>
                      <td>{item.lastName}</td>
                      <td>{item.directorType}</td>
                      <td>{formatDate(item.appointmentDate)}</td>
                      <td>{item.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {previewData.length > 5 && (
              <div className="text-muted mb-4">
                Showing 5 of {previewData.length} records
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary"></div>
            <p className="mt-2 mb-0">{loadingMessage}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="link" onClick={handleClose}>
          Cancel
        </Button>
        
        {currentStep === 2 && (
          <Button
            variant="primary"
            onClick={confirmImport}
            disabled={loading}
          >
            <i className="bi bi-check2 me-2"></i>
            Confirm Import
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportDirectorModal;
