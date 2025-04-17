import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Row, Col, Alert, ProgressBar, Table, Badge } from 'react-bootstrap';
import { FaFileImport, FaFileExport, FaDownload, FaUpload, FaHistory, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { ImportExportService, CategoriesService } from '../../../../services/products';

const ImportExport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'pdf'>('csv');
  const [exportFilter, setExportFilter] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importResult, setImportResult] = useState<any | null>(null);
  
  // State for categories
  const [categories, setCategories] = useState<any[]>([]);
  
  // Mock data for import history
  const importHistory: any[] = [];
  
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await CategoriesService.getCategories();
        setCategories(response.categories || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      // Use the service layer to import products
      const result = await ImportExportService.importProducts(importFile);
      
      // Complete the progress bar
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set the import result
      setImportResult(result);
    } catch (error: any) {
      console.error('Error importing products:', error);
      setImportResult({
        success: false,
        processed: 0,
        succeeded: 0,
        failed: 0,
        errors: [{ row: 0, error: error.message || 'Unknown error occurred during import' }]
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleExportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Build query parameters
      const params: any = {};
      if (exportFilter) params.categoryId = exportFilter;
      
      // Use the service layer to export products
      const exportBlob = await ImportExportService.exportProducts(params);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(exportBlob);
      
      // Create a link to download the export
      const link = document.createElement('a');
      link.href = url;
      link.download = `products-export.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting products:', error);
      alert('Failed to export products. Please try again.');
    }
  };
  
  const handleDownloadTemplate = async () => {
    try {
      // Use the service layer to download the template
      const templateBlob = await ImportExportService.downloadTemplate();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(templateBlob);
      
      // Create a link to download the template
      const link = document.createElement('a');
      link.href = url;
      link.download = 'import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Import & Export</h1>
          <p className="text-muted mb-0">Import and export your product data</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="d-flex mb-4">
        <Button 
          variant={activeTab === 'import' ? 'primary' : 'outline-primary'} 
          className="me-2"
          onClick={() => setActiveTab('import')}
        >
          <FaFileImport className="me-2" />
          Import
        </Button>
        <Button 
          variant={activeTab === 'export' ? 'primary' : 'outline-primary'} 
          onClick={() => setActiveTab('export')}
        >
          <FaFileExport className="me-2" />
          Export
        </Button>
      </div>
      
      {/* Import Tab */}
      {activeTab === 'import' && (
        <>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Import Products</h5>
            </Card.Header>
            <Card.Body>
              <p>Upload a CSV file to import products into your catalog. Make sure your file follows the required format.</p>
              
              <Button 
                variant="outline-secondary" 
                className="mb-4"
                onClick={handleDownloadTemplate}
              >
                <FaDownload className="me-2" />
                Download Import Template
              </Button>
              
              <Form onSubmit={handleImportSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Select CSV File</Form.Label>
                  <Form.Control 
                    type="file" 
                    accept=".csv" 
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                  <Form.Text className="text-muted">
                    Only CSV files are supported. Maximum file size: 10MB.
                  </Form.Text>
                </Form.Group>
                
                {isUploading && (
                  <div className="mb-3">
                    <p>Uploading file...</p>
                    <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
                  </div>
                )}
                
                {importResult && (
                  <Alert variant={importResult.failed > 0 ? 'warning' : 'success'} className="mb-3">
                    <div className="d-flex align-items-center">
                      {importResult.failed > 0 ? (
                        <FaExclamationTriangle className="me-2" size={20} />
                      ) : (
                        <FaCheck className="me-2" size={20} />
                      )}
                      <div>
                        <Alert.Heading>Import {importResult.failed > 0 ? 'Completed with Errors' : 'Successful'}</Alert.Heading>
                        <p className="mb-0">
                          Processed {importResult.processed} products: {importResult.succeeded} succeeded, {importResult.failed} failed.
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}
                
                {importResult && importResult.errors && importResult.errors.length > 0 && (
                  <div className="mb-3">
                    <h6>Import Errors</h6>
                    <Table responsive striped bordered hover size="sm">
                      <thead>
                        <tr>
                          <th>Row</th>
                          <th>Error</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.errors.map((error: any, index: number) => (
                          <tr key={index}>
                            <td>{error.row}</td>
                            <td>{error.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!importFile || isUploading}
                >
                  <FaUpload className="me-2" />
                  Upload and Import
                </Button>
              </Form>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Import History</h5>
              <Badge bg="secondary">{importHistory.length} imports</Badge>
            </Card.Header>
            <Card.Body>
              {importHistory.length === 0 ? (
                <p className="text-muted">No import history available.</p>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>File</th>
                      <th>Status</th>
                      <th>Processed</th>
                      <th>Succeeded</th>
                      <th>Failed</th>
                      <th>User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importHistory.map((import_, index) => (
                      <tr key={index}>
                        <td>{new Date(import_.date).toLocaleString()}</td>
                        <td>{import_.filename}</td>
                        <td>
                          <Badge bg={import_.status === 'Completed' ? 'success' : import_.status === 'Failed' ? 'danger' : 'warning'}>
                            {import_.status}
                          </Badge>
                        </td>
                        <td>{import_.processed}</td>
                        <td>{import_.succeeded}</td>
                        <td>{import_.failed}</td>
                        <td>{import_.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
      
      {/* Export Tab */}
      {activeTab === 'export' && (
        <Card>
          <Card.Header>
            <h5 className="mb-0">Export Products</h5>
          </Card.Header>
          <Card.Body>
            <p>Export your product data to CSV or PDF format. You can filter the products to export.</p>
            
            <Form onSubmit={handleExportSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Export Format</Form.Label>
                    <div>
                      <Form.Check
                        inline
                        type="radio"
                        id="export-csv"
                        label="CSV"
                        name="exportFormat"
                        checked={exportFormat === 'csv'}
                        onChange={() => setExportFormat('csv')}
                      />
                      <Form.Check
                        inline
                        type="radio"
                        id="export-pdf"
                        label="PDF"
                        name="exportFormat"
                        checked={exportFormat === 'pdf'}
                        onChange={() => setExportFormat('pdf')}
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Filter by Category</Form.Label>
                    <Form.Select
                      value={exportFilter || ''}
                      onChange={(e) => setExportFilter(e.target.value || null)}
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Button type="submit" variant="primary">
                <FaFileExport className="me-2" />
                Export Products
              </Button>
            </Form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ImportExport;
