import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Table, Badge, Spinner, Row, Col, Form, Modal } from 'react-bootstrap';
import { FaArrowLeft, FaDownload, FaLink, FaCode, FaCopy } from 'react-icons/fa';
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
  
  // State for SQL modal
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const sqlTextAreaRef = useRef<HTMLTextAreaElement>(null);
  
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
  
  // Generate SQL query for Superset
  const generateSqlQuery = () => {
    if (!records.length) return '';
    
    // Get current date for the query header
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get all unique keys from all records
    const allKeys = new Set<string>();
    records.forEach(record => {
      Object.keys(record.data).forEach(key => allKeys.add(key));
    });
    
    const keys = Array.from(allKeys);
    
    // Determine data types for each field
    const fieldTypes = new Map<string, string>();
    const fieldDescriptions = new Map<string, string>();
    
    keys.forEach(key => {
      // Default to text
      let type = 'text';
      let isConsistentType = true;
      let detectedType = '';
      
      // Check all records to ensure consistent type
      for (let i = 0; i < Math.min(records.length, 20); i++) {
        const value = records[i].data[key];
        
        if (value !== null && value !== undefined) {
          let currentType = '';
          
          if (typeof value === 'number') {
            currentType = Number.isInteger(value) ? 'int' : 'float';
          } else if (typeof value === 'boolean') {
            currentType = 'boolean';
          } else if (typeof value === 'string') {
            // Try to parse as number first
            if (/^-?\d+$/.test(value)) {
              currentType = 'int';
            } else if (/^-?\d+(\.\d+)?$/.test(value)) {
              currentType = 'float';
            } else {
              // Check if it's a date
              const datePattern = /^\d{4}-\d{2}-\d{2}(T|\s)\d{2}:\d{2}:\d{2}/;
              if (datePattern.test(value)) {
                currentType = 'timestamp';
              } else {
                // Check if it's a boolean
                if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
                  currentType = 'boolean';
                } else {
                  currentType = 'text';
                }
              }
            }
          } else if (typeof value === 'object') {
            currentType = 'json';
          }
          
          // If this is the first value we're checking
          if (detectedType === '') {
            detectedType = currentType;
          } 
          // If the type is inconsistent with previous values
          else if (detectedType !== currentType) {
            isConsistentType = false;
            break;
          }
        }
      }
      
      // If we have a consistent type, use it
      if (isConsistentType && detectedType !== '') {
        type = detectedType;
      } 
      // Otherwise, use some heuristics based on field name
      else {
        // Check field name for hints about type
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('id') && !lowerKey.includes('idea') && !lowerKey.includes('hide')) {
          type = 'int';
        } else if (lowerKey.includes('count') || lowerKey.includes('number') || lowerKey.includes('qty') || lowerKey.includes('quantity')) {
          type = 'int';
        } else if (lowerKey.includes('price') || lowerKey.includes('amount') || lowerKey.includes('cost') || lowerKey.includes('fee')) {
          type = 'float';
        } else if (lowerKey.includes('date') || lowerKey.includes('time')) {
          type = 'timestamp';
        } else if (lowerKey.startsWith('is') || lowerKey.startsWith('has') || lowerKey.includes('flag') || lowerKey.includes('enabled') || lowerKey.includes('active')) {
          type = 'boolean';
        }
      }
      
      fieldTypes.set(key, type);
      
      // Generate field descriptions based on field name and type
      let description = key;
      if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
        description = type === 'timestamp' ? 'Date/time value' : 'Date/time as text';
      } else if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('cost')) {
        description = 'Monetary value';
      } else if (key.toLowerCase().includes('email')) {
        description = 'Email address';
      } else if (key.toLowerCase().includes('phone')) {
        description = 'Phone number';
      } else if (key.toLowerCase().includes('name')) {
        description = 'Name value';
      } else if (key.toLowerCase().includes('id')) {
        description = 'Identifier';
      } else if (key.toLowerCase().includes('count') || key.toLowerCase().includes('number')) {
        description = 'Numeric count';
      } else if (key.toLowerCase().includes('is') || key.toLowerCase().includes('has')) {
        description = 'Boolean flag';
      } else if (key.toLowerCase().includes('address')) {
        description = 'Address information';
      }
      
      fieldDescriptions.set(key, description);
    });
    
    // Generate SQL query
    let sql = `/* 
DATASET QUERY FOR SUPERSET SQL LAB
Table: DataRecord
Dataset ID: ${datasetId}
Dataset Name: ${dataset?.name || 'Unknown'}
Generated: ${currentDate}
*/\n\n`;
    
    sql += `SELECT\n`;
    
    // Add field extractions with type information as text comments
    keys.forEach((key, index) => {
      const type = fieldTypes.get(key) || 'text';
      const description = fieldDescriptions.get(key) || key;
      let fieldExtraction = '';
      
      // Add type information as a comment
      sql += `  /* ${type.toUpperCase()}: ${description} */\n`;
      
      switch (type) {
        case 'int':
          fieldExtraction = `  CAST(dr.data->>'${key}' AS INTEGER) AS "${key}"`;
          break;
        case 'float':
          fieldExtraction = `  CAST(dr.data->>'${key}' AS NUMERIC) AS "${key}"`;
          break;
        case 'boolean':
          fieldExtraction = `  CAST(dr.data->>'${key}' AS BOOLEAN) AS "${key}"`;
          break;
        case 'timestamp':
          fieldExtraction = `  CAST(dr.data->>'${key}' AS TIMESTAMP) AS "${key}"`;
          break;
        case 'json':
          fieldExtraction = `  dr.data->'${key}' AS "${key}"`;
          break;
        default:
          fieldExtraction = `  dr.data->>'${key}' AS "${key}"`;
      }
      
      // Add comma if not the last field
      if (index < keys.length - 1) {
        fieldExtraction += ',';
      }
      
      sql += fieldExtraction + '\n';
      
      // Add a blank line between fields for readability
      if (index < keys.length - 1) {
        sql += '\n';
      }
    });
    
    // Add system field for record creation date
    if (keys.length > 0) {
      sql += `,\n\n  /* TIMESTAMP: Record creation date */\n  dr."createdAt"\n`;
    } else {
      sql += `  /* TIMESTAMP: Record creation date */\n  dr."createdAt"\n`;
    }
    
    sql += `FROM "DataRecord" dr\n`;
    sql += `WHERE dr."datasetId" = '${datasetId}'\n`;
    sql += `ORDER BY dr."createdAt" DESC\n`;
    sql += `LIMIT 1000;`;
    
    return sql;
  };
  
  // Show SQL modal with generated query
  const showSqlQueryModal = () => {
    const query = generateSqlQuery();
    setSqlQuery(query);
    setShowSqlModal(true);
    setCopySuccess(false);
  };
  
  // Copy SQL query to clipboard
  const copySqlToClipboard = () => {
    if (sqlTextAreaRef.current) {
      sqlTextAreaRef.current.select();
      document.execCommand('copy');
      setCopySuccess(true);
      
      // Reset copy success message after 3 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 3000);
    }
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
            variant="outline-primary" 
            className="me-2"
            onClick={showSqlQueryModal}
            disabled={!records.length}
          >
            <FaCode className="me-2" />
            SQL Query
          </Button>
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
      
      {/* SQL Query Modal */}
      <Modal 
        show={showSqlModal} 
        onHide={() => setShowSqlModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>SQL Query for Superset</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Use this PostgreSQL query in Superset's SQL Lab to extract fields from your JSON data.
            This query is configured to work with the DataRecord table in your database.
          </p>
          <div className="position-relative">
            <Form.Control
              as="textarea"
              ref={sqlTextAreaRef}
              value={sqlQuery}
              readOnly
              rows={15}
              className="font-monospace"
              style={{ 
                backgroundColor: '#f8f9fa',
                color: '#212529',
                fontSize: '0.875rem'
              }}
            />
            <Button
              variant="outline-primary"
              size="sm"
              className="position-absolute"
              style={{ top: '10px', right: '10px' }}
              onClick={copySqlToClipboard}
            >
              <FaCopy className="me-1" />
              {copySuccess ? 'Copied!' : 'Copy'}
            </Button>
          </div>
          {copySuccess && (
            <div className="alert alert-success mt-3 mb-0" role="alert">
              SQL query copied to clipboard!
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSqlModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DatasetDetail;
