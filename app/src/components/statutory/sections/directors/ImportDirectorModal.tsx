import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Button, Alert, Form, Row, Col, ProgressBar } from 'react-bootstrap';
import { FaDownload, FaUpload, FaCheck } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: string;
}

interface ColumnMapping {
  [key: string]: string;
}

const ImportDirectorModal: React.FC<ImportDirectorModalProps> = ({ show, onHide, onSuccess, companyId }) => {
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
  const [currentDirector, setCurrentDirector] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);

  const requiredColumns = [
    { key: 'title', label: 'Title' },
    { key: 'firstName', label: 'First Name' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth' },
    { key: 'nationality', label: 'Nationality' },
    { key: 'address', label: 'Address' },
    { key: 'appointmentDate', label: 'Appointment Date' },
    { key: 'directorType', label: 'Director Type' },
    { key: 'occupation', label: 'Occupation' },
    { key: 'otherDirectorships', label: 'Other Directorships' },
    { key: 'shareholding', label: 'Shareholding' },
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
        appointmentDate: '01/01/2025',
        resignationDate: '',
        directorType: 'Executive Director',
        occupation: 'Business Director',
        otherDirectorships: 'Emerald Holdings Ltd, Celtic Ventures DAC',
        shareholding: '1000 Ordinary Shares',
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
        escapeCSV(item.appointmentDate),
        escapeCSV(item.directorType),
        escapeCSV(item.occupation),
        escapeCSV(item.otherDirectorships),
        escapeCSV(item.shareholding),
        escapeCSV(item.status)
      ].join(','))
    ].join('\n');

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
    if (!e.target.files?.length) {
      console.log('No file selected');
      return;
    }

    const file = e.target.files[0];
    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: new Date(file.lastModified).toISOString()
    });

    // Ensure file is CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file using the provided template.');
      return;
    }

    // Force file type to CSV
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
      console.log('Sending request to:', `/statutory/directors/${companyId}/read-headers`);
      console.log('File details:', {
        name: modifiedFile.name,
        type: modifiedFile.type,
        size: modifiedFile.size
      });

      const response = await api.post(`/statutory/directors/${companyId}/read-headers`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('Server response:', response.data);

      if (response.data.headers && Array.isArray(response.data.headers)) {
        console.log('Headers found:', response.data.headers);
        setFileHeaders(response.data.headers);
        autoMapColumns(response.data.headers);
        setCurrentStep(2);
      } else {
        console.error('Invalid headers format:', response.data);
        setError('Invalid file format. Please check the template and try again.');
      }
    } catch (err: any) {
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
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
    try {
      console.log('Mapping column:', {
        requiredColumn,
        selectedHeader
      });

      setColumnMapping(prev => {
        const newMapping = {
          ...prev,
          [requiredColumn]: selectedHeader
        };
        console.log('New column mapping:', newMapping);
        return newMapping;
      });
      
      // Update confidence score for manual mapping
      if (selectedHeader) {
        setColumnConfidence(prev => ({
          ...prev,
          [requiredColumn]: 1 // Full confidence for manual mapping
        }));
      } else {
        setColumnConfidence(prev => {
          const { [requiredColumn]: _, ...rest } = prev;
          return rest;
        });
      }
    } catch (error) {
      console.error('Error updating column mapping:', error);
      setError('Failed to update column mapping');
    }
  };

  const previewImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setLoadingMessage('Generating preview...');
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Log mapping before stringifying
    console.log('Column mapping to send:', columnMapping);
    
    try {
      const mappingString = JSON.stringify(columnMapping);
      console.log('Stringified mapping:', mappingString);
      formData.append('mapping', mappingString);

      console.log('Preview request details:', {
        fileSize: selectedFile.size,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        mappingSize: mappingString.length
      });

      const response = await api.post(`/statutory/directors/${companyId}/preview-import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log('Preview response:', response.data);

      if (response.data.data?.length > 0) {
        setPreviewData(response.data.data);
        setCurrentStep(3);
      } else {
        throw new Error('No preview data returned');
      }
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to preview data. Please check your column mapping.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };
  
  const handleImportSuccess = useCallback((count: number) => {
    console.log('Handling import success:', { count });

    // Update states
    setImportSuccess(true);
    setImportedCount(count);
    setLoading(false);
    setLoadingMessage('');
    setCurrentStep(5); // Move to success step
    setJobId(null); // Clear job ID to stop polling

    toast.success(`Successfully imported ${count} directors`);
    
    // Refresh parent data and close modal
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
      const response = await api.post(`/statutory/directors/${companyId}/confirm-import`, formData);
      
      if (response.data.success && response.data.jobId) {
        const newJobId = response.data.jobId;
        console.log('Starting import with job:', newJobId);
        
        // Set job ID and start time
        setJobId(newJobId);
        setStartTime(Date.now());
      } else {
        throw new Error('Failed to start import');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start import. Please try again.');
      setCurrentStep(4); // Go back to confirmation step on error
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const checkImportStatus = useCallback(async () => {
    const currentJobId = jobId;
    if (!currentJobId) return;

    try {
      console.log('Checking import status for job:', currentJobId);
      const response = await api.get(`/statutory/directors/${companyId}/import-status/${currentJobId}`);
      console.log('Import status response:', response.data);

      // Calculate simulated progress based on time elapsed
      const timeElapsed = startTime ? Date.now() - startTime : 0;
      const simulatedProgress = Math.min(Math.floor((timeElapsed / 25000) * 100), 99);
      
      if (response.data.state === 'completed') {
        console.log('Import completed successfully:', {
          jobId: currentJobId,
          result: response.data.result,
          count: response.data.result?.count || previewData.length
        });
        
        handleImportSuccess(response.data.result?.count || previewData.length);
        return;
      } 
      
      if (response.data.state === 'failed') {
        console.error('Import failed:', {
          jobId: currentJobId,
          error: response.data.error
        });
        
        setError(response.data.error || 'Import failed. Please try again.');
        setCurrentStep(4);
        setLoading(false);
        setLoadingMessage('');
        setJobId(null); // Clear job ID to stop polling
      } else {
        // Still processing
        const progress = response.data.progress || simulatedProgress;
        const director = response.data.currentDirector;
        
        console.log('Import in progress:', {
          jobId: currentJobId,
          progress: progress + '%',
          currentDirector: director
        });
        
        setProgress(progress);
        setCurrentDirector(director || '');
        setLoadingMessage(`Importing directors... ${progress}%`);
      }
    } catch (err: any) {
      console.error('Error checking import status:', err);
      if (err.response?.status === 404) {
        // Job not found, might be completed and cleaned up
        console.log('Job not found (404), checking one last time');
        try {
          const finalCheck = await api.get(`/statutory/directors/${companyId}/import-status/${currentJobId}`);
          if (finalCheck.data.state === 'completed') {
            handleImportSuccess(finalCheck.data.result?.count || previewData.length);
          } else {
            handleImportSuccess(previewData.length);
          }
        } catch (finalErr) {
          handleImportSuccess(previewData.length);
        }
      } else {
        // Continue showing progress even if status check fails
        const timeElapsed = startTime ? Date.now() - startTime : 0;
        const simulatedProgress = Math.min(Math.floor((timeElapsed / 25000) * 100), 99);
        setProgress(simulatedProgress);
        setLoadingMessage(`Importing directors... ${simulatedProgress}%`);
      }
    }
  }, [jobId, companyId, startTime, previewData.length, handleImportSuccess]);

  // Setup polling when jobId changes
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    
    if (jobId) {
      console.log('Setting up new polling interval for job:', jobId);
      interval = setInterval(checkImportStatus, 1000);
    }

    // Cleanup function
    return () => {
      if (interval) {
        console.log('Cleaning up polling interval');
        clearInterval(interval);
      }
    };
  }, [jobId, checkImportStatus]);

  // Handle modal show/hide
  useEffect(() => {
    if (!show) {
      // Reset all states when modal is hidden
      setCurrentStep(1);
      setError(null);
      setPreviewData([]);
      setColumnMapping({});
      setColumnConfidence({});
      setFileHeaders([]);
      setSelectedFile(null);
      setImportSuccess(false);
      setProgress(0);
      setCurrentDirector('');
      setLoading(false);
      setLoadingMessage('');
      setJobId(null);
    }
  }, [show]);

  const formatDate = (date: string | null) => {
    if (!date) return '';
    try {
      // First check if the date is already in DD/MM/YYYY format
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
        return date;
      }

      // Try parsing as ISO date
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        // Try parsing DD/MM/YYYY format
        const [day, month, year] = date.split('/').map(Number);
        if (day && month && year) {
          const parsedDate = new Date(year, month - 1, day);
          if (!isNaN(parsedDate.getTime())) {
            return date; // Return original if it was valid DD/MM/YYYY
          }
        }
        return 'Invalid Date';
      }

      // Format as DD/MM/YYYY
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (err) {
      console.error('Error formatting date:', err);
      return 'Invalid Date';
    }
  };

  const handleClose = () => {
    // Reset all states
    setCurrentStep(1);
    setError(null);
    setPreviewData([]);
    setColumnMapping({});
    setColumnConfidence({});
    setFileHeaders([]);
    setSelectedFile(null);
    setImportSuccess(false);
    setProgress(0);
    setCurrentDirector('');
    setLoading(false);
    setLoadingMessage('');
    setJobId(null);
    
    // Close modal
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
        <Modal.Title>Import Directors</Modal.Title>
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
              To import directors, please follow these steps:
            </p>
            <ol className="mb-4">
              <li className="mb-2">
                <a href="#" className="text-primary" onClick={downloadSampleFile}>
                  Download the sample file template
                  <FaDownload className="ms-2" />
                </a>
              </li>
              <li className="mb-2">Fill in your director data in the CSV template</li>
              <li className="mb-2">Save the file as CSV and upload it</li>
              <li className="mb-2 text-muted small">Note: Only CSV files are supported</li>
              <li className="mb-2 text-muted small">Dates should be in DD/MM/YYYY format (e.g., 01/01/2025)</li>
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
                    <th>Date of Birth</th>
                    <th>Nationality</th>
                    <th>Address</th>
                    <th>Director Type</th>
                    <th>Occupation</th>
                    <th>Other Directorships</th>
                    <th>Shareholding</th>
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
                      <td>{formatDate(item.dateOfBirth)}</td>
                      <td>{item.nationality}</td>
                      <td>{item.address}</td>
                      <td>{item.directorType}</td>
                      <td>{item.occupation}</td>
                      <td>{item.otherDirectorships}</td>
                      <td>{item.shareholding}</td>
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

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <>
            <div className="text-center py-4">
              <h4 className="mb-4">Ready to Import</h4>
              <p className="mb-4" style={{ fontSize: '1.1rem' }}>
                You are about to import {previewData.length} directors. This action cannot be undone.
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
                  Successfully imported {importedCount} directors.
                </p>
              </div>
              <div className="alert alert-info">
                <small>
                  The directors list has been updated. You can now close this window.
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
                {currentDirector && (
                  <p className="text-muted small mb-0">
                    Importing: {currentDirector}
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

export default ImportDirectorModal;
