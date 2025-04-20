import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Spinner, Modal, Form, Row, Col } from 'react-bootstrap';
import { FaPlus, FaEye, FaEdit, FaTrash, FaUpload, FaLink } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../../../services/api';
import { DatasetData } from '../../../../services/engage/types';
import { getAllDatasets, createDataset, deleteDataset, importData, regenerateWebhookSecret } from '../../../../services/engage/data';

const Data: React.FC = () => {
  // State for datasets
  const [datasets, setDatasets] = useState<DatasetData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showWebhookModal, setShowWebhookModal] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  
  // State for form data
  const [newDataset, setNewDataset] = useState<{
    name: string;
    description: string;
    type: 'form' | 'survey' | 'upload' | 'webhook';
  }>({
    name: '',
    description: '',
    type: 'upload'
  });
  
  // State for webhook dataset
  const [webhookDataset, setWebhookDataset] = useState<DatasetData | null>(null);
  
  // State for file upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDatasetName, setUploadDatasetName] = useState<string>('');
  const [uploadDescription, setUploadDescription] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  
  // Fetch datasets on component mount
  useEffect(() => {
    fetchDatasets();
  }, []);
  
  // Fetch datasets from API
  const fetchDatasets = async () => {
    try {
      setLoading(true);
      const data = await getAllDatasets();
      setDatasets(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching datasets:', err);
      setError('Failed to load datasets. Please try again later.');
      setLoading(false);
    }
  };
  
  // Handle creating a new dataset
  const handleCreateDataset = async () => {
    try {
      const response = await createDataset(newDataset);
      
      // If it's a webhook dataset, show the webhook modal
      if (newDataset.type === 'webhook') {
        setWebhookDataset(response);
        setShowCreateModal(false);
        setShowWebhookModal(true);
      } else {
        // Otherwise, just close the modal and refresh the list
        setShowCreateModal(false);
        fetchDatasets();
      }
      
      // Reset form
      setNewDataset({
        name: '',
        description: '',
        type: 'upload'
      });
    } catch (err) {
      console.error('Error creating dataset:', err);
      setError('Failed to create dataset. Please try again.');
    }
  };
  
  // Handle deleting a dataset
  const handleDeleteDataset = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      try {
        await deleteDataset(id);
        fetchDatasets();
      } catch (err) {
        console.error('Error deleting dataset:', err);
        setError('Failed to delete dataset. Please try again.');
      }
    }
  };
  
  // Handle file upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadFile) {
      return;
    }
    
    try {
      setUploading(true);
      await importData(uploadFile, {
        name: uploadDatasetName || uploadFile.name.split('.')[0],
        description: uploadDescription || 'Uploaded data'
      });
      
      setUploading(false);
      setShowUploadModal(false);
      fetchDatasets();
      
      // Reset form
      setUploadFile(null);
      setUploadDatasetName('');
      setUploadDescription('');
    } catch (err) {
      console.error('Error uploading file:', err);
      setError('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };
  
  // Get badge color based on dataset type
  const getTypeBadgeColor = (type: string): string => {
    switch (type) {
      case 'form':
        return 'primary';
      case 'survey':
        return 'success';
      case 'upload':
        return 'info';
      case 'webhook':
        return 'warning';
      default:
        return 'secondary';
    }
  };
  
  // Render loading spinner
  if (loading && datasets.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Data Management</h1>
          <p className="text-muted mb-0">Manage your datasets, form submissions, and survey responses</p>
        </div>
        <div>
          <Button 
            variant="primary" 
            className="me-2" 
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus className="me-2" />
            New Dataset
          </Button>
          <Button 
            variant="outline-primary" 
            onClick={() => setShowUploadModal(true)}
          >
            <FaUpload className="me-2" />
            Upload Data
          </Button>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          {error}
          <button 
            type="button" 
            className="btn-close float-end" 
            onClick={() => setError(null)}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      {/* Datasets Table */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Datasets</h5>
        </Card.Header>
        <Card.Body>
          {datasets.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No datasets available. Create your first dataset to get started.</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Records</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {datasets.map((dataset) => (
                  <tr key={dataset.id}>
                    <td>{dataset.name}</td>
                    <td>
                      <Badge bg={getTypeBadgeColor(dataset.type)}>
                        {dataset.type.charAt(0).toUpperCase() + dataset.type.slice(1)}
                      </Badge>
                    </td>
                    <td>{dataset.recordCount || 0}</td>
                    <td>{dataset.createdAt ? formatDate(dataset.createdAt) : 'N/A'}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        as={Link as any}
                        to={`/engage/data/${dataset.id}`}
                      >
                        <FaEye />
                      </Button>
                      {dataset.type === 'webhook' && (
                        <Button 
                          variant="link" 
                          className="p-0 me-2" 
                          title="Webhook Details"
                          onClick={() => {
                            setWebhookDataset(dataset);
                            setShowWebhookModal(true);
                          }}
                        >
                          <FaLink />
                        </Button>
                      )}
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDeleteDataset(dataset.id!)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Create Dataset Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Dataset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter dataset name" 
                value={newDataset.name}
                onChange={(e) => setNewDataset({...newDataset, name: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Enter dataset description" 
                value={newDataset.description}
                onChange={(e) => setNewDataset({...newDataset, description: e.target.value})}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                value={newDataset.type}
                onChange={(e) => setNewDataset({...newDataset, type: e.target.value as any})}
              >
                <option value="upload">Upload</option>
                <option value="webhook">Webhook</option>
              </Form.Select>
              <Form.Text className="text-muted">
                {newDataset.type === 'webhook' ? 
                  'Create an empty dataset with a webhook endpoint for receiving data from external sources.' : 
                  'Create an empty dataset for uploading data files.'}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleCreateDataset}
            disabled={!newDataset.name}
          >
            Create
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Webhook Details Modal */}
      <Modal show={showWebhookModal} onHide={() => setShowWebhookModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Webhook Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {webhookDataset && (
            <>
              <p>Use the following webhook URL and secret to send data to this dataset:</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Webhook URL</Form.Label>
                <Form.Control 
                  type="text" 
                  value={`${window.location.origin}/api/engage/data/webhook/${webhookDataset.webhookId}`}
                  readOnly
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Webhook Secret</Form.Label>
                <Form.Control 
                  type="text" 
                  value={webhookDataset.webhookSecret || ''}
                  readOnly
                />
                <Form.Text className="text-muted">
                  Include this secret in the X-Webhook-Secret header when making requests.
                </Form.Text>
              </Form.Group>
              
              <h5 className="mt-4">Example Usage</h5>
              <pre className="bg-light p-3 rounded">
{`// Example using fetch API
fetch('${window.location.origin}/api/engage/data/webhook/${webhookDataset.webhookId}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Webhook-Secret': '${webhookDataset.webhookSecret || 'your-webhook-secret'}'
  },
  body: JSON.stringify({
    // Your data here
    name: 'John Doe',
    email: 'john@example.com',
    // ...
  })
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));`}
              </pre>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowWebhookModal(false)}>
            Close
          </Button>
          {webhookDataset && (
            <Button 
              variant="primary" 
              onClick={async () => {
                try {
                  const response = await regenerateWebhookSecret(webhookDataset.id!);
                  setWebhookDataset(response);
                } catch (err) {
                  console.error('Error regenerating webhook secret:', err);
                  setError('Failed to regenerate webhook secret. Please try again.');
                }
              }}
            >
              Regenerate Secret
            </Button>
          )}
        </Modal.Footer>
      </Modal>
      
      {/* Upload Data Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleFileUpload}>
            <Form.Group className="mb-3">
              <Form.Label>File</Form.Label>
              <Form.Control 
                type="file" 
                accept=".csv,.xlsx,.xls" 
                onChange={(e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    setUploadFile(files[0]);
                    // Set default name from filename if not already set
                    if (!uploadDatasetName) {
                      setUploadDatasetName(files[0].name.split('.')[0]);
                    }
                  }
                }}
              />
              <Form.Text className="text-muted">
                Supported formats: CSV, Excel (.xlsx, .xls)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Dataset Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter dataset name" 
                value={uploadDatasetName}
                onChange={(e) => setUploadDatasetName(e.target.value)}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="Enter dataset description" 
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleFileUpload}
            disabled={!uploadFile || uploading}
          >
            {uploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Data;
