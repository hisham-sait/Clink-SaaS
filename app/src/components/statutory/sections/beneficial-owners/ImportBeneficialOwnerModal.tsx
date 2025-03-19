import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button, Alert, Form, Row, Col } from 'react-bootstrap';
import { FaDownload, FaUpload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../../../../services/api';

import { BeneficialOwner } from '../../../../services/statutory/types';
import { 
  parseDate, 
  formatDDMMYYYY,
  isValidStatutoryDate,
  isValidDateOfBirth,
  formatStatutoryDate
} from '@bradan/shared';

interface ImportBeneficialOwnerModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  companyId: string;
}

// PreviewData extends BeneficialOwner but with string type for numeric fields since they come from CSV
interface PreviewData extends Omit<BeneficialOwner, 'ownershipPercentage'> {
  ownershipPercentage: string;
}

interface ColumnMapping {
  [key: string]: string;
}

const ImportBeneficialOwnerModal: React.FC<ImportBeneficialOwnerModalProps> = ({ show, onHide, onSuccess, companyId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({});
  const [columnConfidence, setColumnConfidence] = useState<{[key: string]: number}>({});
  const [previewData, setPreviewData] = useState<PreviewData[]>([]);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [currentOwner, setCurrentOwner] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const requiredColumns = [
    { key: 'title', label: 'Title' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'address', label: 'Address' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'natureOfControl', label: 'Nature of Control' },
    { key: 'ownershipPercentage', label: 'Ownership Percentage' },
    { key: 'registrationDate', label: 'Registration Date' },
    { key: 'status', label: 'Status' }
  ];

  // Function to calculate string similarity (0-1)
  const calculateSimilarity = (str1: string, str2: string): number => {
    const s1 = str1.toLowerCase().replace(/[^a-z0-9]/g, '');
    const s2 = str2.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;
    
    const pairs1 = new Set();
    const pairs2 = new Set();
    
    for (let i = 0; i < s1.length - 1; i++) {
      pairs1.add(s1.slice(i, i + 2));
    }
    for (let i = 0; i < s2.length - 1; i++) {
      pairs2.add(s2.slice(i, i + 2));
    }
    
    const union = new Set([...pairs1, ...pairs2]);
    const intersection = new Set([...pairs1].filter(x => pairs2.has(x)));
    
    return intersection.size / union.size;
  };

  // Auto-map columns based on similarity
  const autoMapColumns = (headers: string[]) => {
    const newMapping: ColumnMapping = {};
    const newConfidence: {[key: string]: number} = {};
    
    requiredColumns.forEach(({ key, label }) => {
      let bestMatch = '';
      let bestScore = 0;
      
      headers.forEach(header => {
        const score = calculateSimilarity(header, label);
        if (score > bestScore && score > 0.5) { // Only map if confidence > 50%
          bestScore = score;
          bestMatch = header;
        }
      });
      
      if (bestMatch) {
        newMapping[key] = bestMatch;
        newConfidence[key] = bestScore;
      }
    });
    
    setColumnMapping(newMapping);
    setColumnConfidence(newConfidence);
  };

  const escapeCSV = (str: string) => {
    if (!str) return '""';
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const downloadSampleFile = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const sampleData = [
      {
        title: 'Mr',
        firstName: 'Seán',
        lastName: 'O\'Brien',
        dateOfBirth: '01/01/1980',
        nationality: 'Irish',
        address: '15 St. Stephen\'s Green, Dublin 2, D02 Y098',
        email: 'sean.obrien@example.com',
        phone: '+353 1 234 5678',
        natureOfControl: 'Shares;Voting Rights',
        ownershipPercentage: '25.5',
        registrationDate: '01/01/2025',
        status: 'Active'
      }
    ];

    const headers = requiredColumns.map(col => col.label);
    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...sampleData.map(item => [
        escapeCSV(item.title),
        escapeCSV(item.firstName),
        escapeCSV(item.lastName),
        escapeCSV(item.dateOfBirth),
        escapeCSV(item.nationality),
        escapeCSV(item.address),
        escapeCSV(item.email),
        escapeCSV(item.phone),
        escapeCSV(item.natureOfControl),
        escapeCSV(item.ownershipPercentage),
        escapeCSV(item.registrationDate),
        escapeCSV(item.status)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'beneficial_owners_template.csv';
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
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file using the provided template.');
      return;
    }

    const modifiedFile = new File([file], file.name, {
      type: 'text/csv'
    });

    setSelectedFile(modifiedFile);
    setLoading(true);
    setLoadingMessage('Reading file headers...');
    setError(null);

    const formData = new FormData();
    formData.append('file', modifiedFile);

    try {
      const response = await api.post(`/statutory/beneficial-owners/${companyId}/read-headers`, formData);
      if (response.data.headers && Array.isArray(response.data.headers)) {
        setFileHeaders(response.data.headers);
        autoMapColumns(response.data.headers);
        setCurrentStep(2);
      } else {
        setError('Invalid file format. Please check the template and try again.');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error || 
        'Failed to read file headers. Please ensure you are using the correct template.'
      );
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleColumnMappingChange = (requiredColumn: string, selectedHeader: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [requiredColumn]: selectedHeader
    }));
    
    if (selectedHeader) {
      setColumnConfidence(prev => ({
        ...prev,
        [requiredColumn]: 1
      }));
    } else {
      setColumnConfidence(prev => {
        const { [requiredColumn]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    try {
      const parsedDate = parseDate(date);
      return parsedDate ? formatDDMMYYYY(parsedDate) : 'Invalid Date';
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

  const validateDates = (data: PreviewData) => {
    if (!isValidDateOfBirth(data.dateOfBirth)) {
      return 'Invalid date of birth';
    }

    const registrationDate = parseDate(data.registrationDate);
    if (!registrationDate || !isValidStatutoryDate(registrationDate, { allowFuture: false })) {
      return 'Invalid registration date';
    }

    return null;
  };

  const previewImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setLoadingMessage('Generating preview...');
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mapping', JSON.stringify(columnMapping));

    try {
      const response = await api.post(`/statutory/beneficial-owners/${companyId}/preview-import`, formData);
      if (response.data.data?.length > 0) {
        // Validate dates in preview data
        const dateErrors = response.data.data.map((item: PreviewData, index: number) => {
          const error = validateDates(item);
          return error ? `Row ${index + 1}: ${error}` : null;
        }).filter(Boolean);

        if (dateErrors.length > 0) {
          throw new Error(`Date validation errors:\n${dateErrors.join('\n')}`);
        }

        setPreviewData(response.data.data);
        setCurrentStep(3);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to preview data. Please check your column mapping.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleImportSuccess = useCallback((count: number) => {
    setImportSuccess(true);
    setImportedCount(count);
    setLoading(false);
    setLoadingMessage('');
    setCurrentStep(5);
    setJobId(null);

    toast.success(`Successfully imported ${count} beneficial owners`);
    onSuccess();
    onHide();
  }, [onSuccess, onHide]);

  const confirmImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setLoadingMessage('Starting import...');
    setError(null);
    setImportSuccess(false);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('mapping', JSON.stringify(columnMapping));

    try {
      const response = await api.post(`/statutory/beneficial-owners/${companyId}/confirm-import`, formData);
      if (response.data.success && response.data.jobId) {
        setJobId(response.data.jobId);
        setStartTime(Date.now());
      } else {
        throw new Error('Failed to start import');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start import. Please try again.');
      setCurrentStep(4);
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const checkImportStatus = useCallback(async () => {
    const currentJobId = jobId;
    if (!currentJobId) return;

    try {
      const response = await api.get(`/statutory/beneficial-owners/${companyId}/import-status/${currentJobId}`);
      const timeElapsed = startTime ? Date.now() - startTime : 0;
      const simulatedProgress = Math.min(Math.floor((timeElapsed / 25000) * 100), 99);

      if (response.data.state === 'completed') {
        handleImportSuccess(response.data.result?.count || previewData.length);
        return;
      }

      if (response.data.state === 'failed') {
        setError(response.data.error || 'Import failed. Please try again.');
        setCurrentStep(4);
        setLoading(false);
        setLoadingMessage('');
        setJobId(null);
      } else {
        const progress = response.data.progress || simulatedProgress;
        setProgress(progress);
        setCurrentOwner(response.data.currentOwner || '');
        setLoadingMessage(`Importing beneficial owners... ${progress}%`);
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        handleImportSuccess(previewData.length);
      } else {
        const timeElapsed = startTime ? Date.now() - startTime : 0;
        const simulatedProgress = Math.min(Math.floor((timeElapsed / 25000) * 100), 99);
        setProgress(simulatedProgress);
        setLoadingMessage(`Importing beneficial owners... ${simulatedProgress}%`);
      }
    }
  }, [jobId, companyId, startTime, previewData.length, handleImportSuccess]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (jobId) {
      interval = setInterval(checkImportStatus, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [jobId, checkImportStatus]);

  useEffect(() => {
    if (!show) {
      setCurrentStep(1);
      setError(null);
      setPreviewData([]);
      setColumnMapping({});
      setColumnConfidence({});
      setFileHeaders([]);
      setSelectedFile(null);
      setImportSuccess(false);
      setProgress(0);
      setCurrentOwner('');
      setLoading(false);
      setLoadingMessage('');
      setJobId(null);
    }
  }, [show]);


  const handleClose = () => {
    setCurrentStep(1);
    setError(null);
    setPreviewData([]);
    setColumnMapping({});
    setColumnConfidence({});
    setFileHeaders([]);
    setSelectedFile(null);
    setImportSuccess(false);
    setProgress(0);
    setCurrentOwner('');
    setLoading(false);
    setLoadingMessage('');
    setJobId(null);
    onHide();
  };

  const renderStepIndicator = () => (
    <div className="d-flex justify-content-center mb-4">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="d-flex align-items-center">
          <div className={`rounded-circle p-2 ${currentStep >= step ? 'bg-primary' : 'bg-light'}`} style={{ width: 35, height: 35 }}>
            <div className="text-center text-white">{currentStep > step ? <FaCheck size={16} /> : step}</div>
          </div>
          {step < 4 && <div className={`flex-grow-1 mx-2 height-2 ${currentStep > step ? 'bg-primary' : 'bg-light'}`} style={{ height: 2, width: 50 }} />}
        </div>
      ))}
    </div>
  );

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton={!loading || importSuccess}>
        <Modal.Title>Import Beneficial Owners</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {renderStepIndicator()}

        {error && (
          <Alert variant="danger" className="mb-4 text-center">
            {error}
          </Alert>
        )}

        {/* Step 1: Upload File */}
        {currentStep === 1 && (
          <>
            <p className="mb-4">
              To import beneficial owners, please follow these steps:
            </p>
            <ol className="mb-4">
              <li className="mb-2">
                <a href="#" className="text-primary" onClick={downloadSampleFile}>
                  Download the sample file template
                  <FaDownload className="ms-2" />
                </a>
              </li>
              <li className="mb-2">Fill in your beneficial owner data in the CSV template</li>
              <li className="mb-2">Save the file as CSV and upload it</li>
              <li className="mb-2 text-muted small">Note: Only CSV files are supported</li>
              <li className="mb-2 text-muted small">Dates should be in DD/MM/YYYY format (e.g., 01/01/2025)</li>
              <li className="mb-2 text-muted small">Nature of Control should be semicolon-separated (e.g., "Shares;Voting Rights")</li>
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
                accept=".csv"
                onChange={onFileSelected}
              />
            </div>
          </>
        )}

        {/* Step 2: Column Mapping */}
        {currentStep === 2 && (
          <>
            <h6 className="mb-3">Map Your Columns</h6>
            <p className="text-muted mb-4">
              Match your file columns to the required fields
            </p>

            <Row>
              {requiredColumns.map(({ key, label }) => (
                <Col md={6} key={key} className="mb-3">
                  <Form.Group>
                    <Form.Label>
                      {label}
                      {columnConfidence[key] && columnConfidence[key] < 1 && (
                        <span className="text-danger ms-1">*</span>
                      )}
                    </Form.Label>
                    <Form.Select
                      value={columnMapping[key] || ''}
                      onChange={(e) => handleColumnMappingChange(key, e.target.value)}
                      className={columnConfidence[key] && columnConfidence[key] < 1 ? 'border-danger' : ''}
                    >
                      <option value="">Select column</option>
                      {fileHeaders.map((header) => (
                        <option key={header} value={header}>
                          {header}
                          {columnConfidence[key] && columnMapping[key] === header && columnConfidence[key] < 1 && 
                            ` (${Math.round(columnConfidence[key] * 100)}% match)`
                          }
                        </option>
                      ))}
                    </Form.Select>
                    {columnConfidence[key] && columnConfidence[key] < 1 && (
                      <Form.Text className="text-danger">
                        Please verify this mapping
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              ))}
            </Row>
          </>
        )}

        {/* Step 3: Preview Data */}
        {currentStep === 3 && (
          <>
            <h6 className="mb-3">Preview Import Data</h6>
            <p className="text-muted mb-4">
              Review the data before confirming import
            </p>

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
                    <th>Email</th>
                    <th>Nature of Control</th>
                    <th>Ownership %</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(0, 5).map((item, index) => (
                    <tr key={index}>
                      <td>{item.title}</td>
                      <td>{item.firstName}</td>
                      <td>{item.lastName}</td>
                      <td>{item.email}</td>
                      <td>{Array.isArray(item.natureOfControl) ? item.natureOfControl.join(', ') : item.natureOfControl}</td>
                      <td>{item.ownershipPercentage}%</td>
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

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <>
            <div className="text-center py-4">
              <h4 className="mb-4">Ready to Import</h4>
              <p className="mb-4" style={{ fontSize: '1.1rem' }}>
                You are about to import {previewData.length} beneficial owners. This action cannot be undone.
              </p>
            </div>
          </>
        )}

        {/* Step 5: Success */}
        {currentStep === 5 && (
          <>
            <div className="text-center py-4">
              <div className="mb-4">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle d-inline-block mb-3">
                  <FaCheck className="text-success" size={32} />
                </div>
                <h5 className="mb-3">Import Successful!</h5>
                <p className="text-muted mb-4">
                  Successfully imported {importedCount} beneficial owners.
                </p>
              </div>
              <div className="alert alert-info">
                <small>
                  The beneficial owners list has been updated. You can now close this window.
                </small>
              </div>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="mb-3">{loadingMessage}</p>
            {progress > 0 && (
              <>
                <div className="progress mb-2" style={{ height: '20px' }}>
                  <div 
                    className="progress-bar progress-bar-striped progress-bar-animated" 
                    role="progressbar" 
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress} 
                    aria-valuemin={0} 
                    aria-valuemax={100}
                  >
                    {progress}%
                  </div>
                </div>
                {currentOwner && (
                  <p className="text-muted small mb-0">
                    Importing: {currentOwner}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {currentStep > 1 && (
          <Button
            variant="light"
            onClick={() => setCurrentStep(prev => prev - 1)}
            disabled={loading}
          >
            Back
          </Button>
        )}
        <Button 
          variant="link"
          onClick={handleClose}
          disabled={loading && !importSuccess}
        >
          Cancel
        </Button>
        {currentStep === 2 && (
          <Button
            variant="primary"
            onClick={previewImport}
            disabled={loading || Object.keys(columnMapping).length !== requiredColumns.length}
          >
            Preview Import
          </Button>
        )}
        {currentStep === 3 && (
          <Button
            variant="primary"
            onClick={() => setCurrentStep(4)}
            disabled={loading}
          >
            Continue
          </Button>
        )}
        {currentStep === 4 && (
          <Button
            variant="primary"
            onClick={confirmImport}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Importing...
              </>
            ) : (
              'Confirm Import'
            )}
          </Button>
        )}
        {currentStep === 5 && (
          <Button
            variant="primary"
            onClick={handleClose}
          >
            Close
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default ImportBeneficialOwnerModal;
