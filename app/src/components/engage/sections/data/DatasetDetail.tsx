import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Table, Badge, Spinner, Row, Col, Form } from 'react-bootstrap';
import { FaArrowLeft, FaDownload, FaLink } from 'react-icons/fa';
import { DatasetData, DataRecord } from '../../../../services/engage/types';
import { getDatasetById, getDatasetRecords } from '../../../../services/engage/data';

interface RouteParams {
  datasetId: string;
}

const DatasetDetail: React.FC = () => {
  const { datasetId } = useParams<keyof RouteParams>() as RouteParams;
  
  // State for dataset and records
  const [dataset, setDataset] = useState<DatasetData | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for pagination
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(20);
  const [total, setTotal] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  
  // Fetch dataset and records on component mount
  useEffect(() => {
    fetchDataset();
    fetchRecords();
  }, [datasetId, page, limit]);
  
  // Fetch dataset from API
  const fetchDataset = async () => {
    try {
      const data = await getDatasetById(datasetId);
      setDataset(data);
    } catch (err) {
      console.error('Error fetching dataset:', err);
      setError('Failed to load dataset. Please try again later.');
      setLoading(false);
    }
  };
  
  // Fetch records from API
  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await getDatasetRecords(datasetId, {
        page,
        limit,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });
      
      setRecords(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching records:', err);
      setError('Failed to load records. Please try again later.');
      setLoading(false);
    }
  };
  
  // Export dataset as CSV
  const exportAsCSV = () => {
    if (!dataset || !records.length) return;
    
    // Get all unique keys from all records
    const allKeys = new Set<string>();
    records.forEach(record => {
      Object.keys(record.data).forEach(key => allKeys.add(key));
    });
    
    const keys = Array.from(allKeys);
    
    // Create CSV header
    let csv = keys.join(',') + '\n';
    
    // Add records
    records.forEach(record => {
      const row = keys.map(key => {
        const value = record.data[key];
        // Handle values with commas by wrapping in quotes
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',');
      
      csv += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${dataset.name}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  if (loading && !dataset) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  // Render error message
  if (error && !dataset) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Button as={Link as any} to="/engage/data" variant="outline-primary">
          <FaArrowLeft className="me-2" />
          Back to Datasets
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <Button as={Link as any} to="/engage/data" variant="link" className="p-0 mb-2 text-decoration-none">
            <FaArrowLeft className="me-2" />
            Back to Datasets
          </Button>
          <h1 className="h3 mb-0">{dataset?.name}</h1>
          <p className="text-muted mb-0">
            {dataset?.description}
            {' '}
            <Badge bg={getTypeBadgeColor(dataset?.type || '')}>
              {dataset?.type?.charAt(0).toUpperCase() + (dataset?.type?.slice(1) || '')}
            </Badge>
          </p>
        </div>
        <div>
          {dataset?.type === 'webhook' && (
            <Button 
              variant="outline-primary" 
              className="me-2"
              as={Link as any}
              to={`/engage/data/${datasetId}/webhook`}
            >
              <FaLink className="me-2" />
              Webhook Details
            </Button>
          )}
          <Button 
            variant="primary" 
            onClick={exportAsCSV}
            disabled={!records.length}
          >
            <FaDownload className="me-2" />
            Export CSV
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
      
      {/* Records Table */}
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Records</h5>
            <div>
              <Form.Select 
                size="sm"
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value));
                  setPage(1);
                }}
                style={{ width: 'auto', display: 'inline-block' }}
                className="me-2"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </Form.Select>
              <span className="text-muted small">
                {total > 0 ? `Showing ${(page - 1) * limit + 1} to ${Math.min(page * limit, total)} of ${total}` : 'No records'}
              </span>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {records.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted mb-0">No records available in this dataset.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    {/* Get headers from first record */}
                    {records.length > 0 && Object.keys(records[0].data).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      {/* Render each field from the record */}
                      {Object.keys(records[0].data).map((key) => (
                        <td key={`${record.id}-${key}`}>
                          {typeof record.data[key] === 'object' 
                            ? JSON.stringify(record.data[key]) 
                            : String(record.data[key] || '')}
                        </td>
                      ))}
                      <td>{formatDate(record.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
        {totalPages > 1 && (
          <Card.Footer className="bg-white">
            <div className="d-flex justify-content-center">
              <ul className="pagination mb-0">
                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, i) => (
                  <li key={i} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => setPage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </div>
          </Card.Footer>
        )}
      </Card>
      
      {/* Dataset Info */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Dataset Information</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p><strong>ID:</strong> {dataset?.id}</p>
              <p><strong>Name:</strong> {dataset?.name}</p>
              <p><strong>Type:</strong> {dataset?.type}</p>
              <p><strong>Records:</strong> {total}</p>
            </Col>
            <Col md={6}>
              <p><strong>Source:</strong> {dataset?.sourceName || 'N/A'}</p>
              <p><strong>Created:</strong> {dataset?.createdAt ? formatDate(dataset.createdAt) : 'N/A'}</p>
              <p><strong>Updated:</strong> {dataset?.updatedAt ? formatDate(dataset.updatedAt) : 'N/A'}</p>
              {dataset?.type === 'webhook' && (
                <p><strong>Webhook ID:</strong> {dataset?.webhookId}</p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DatasetDetail;
