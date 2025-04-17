import React, { useState } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { FaLayerGroup, FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaSave } from 'react-icons/fa';

const Families: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFamily, setNewFamily] = useState({
    name: '',
    code: '',
    description: ''
  });
  
  // Mock data for demonstration
  const families: any[] = [];
  const attributes: any[] = [];
  
  const handleAddFamily = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFamily({
      ...newFamily,
      [name]: value
    });
  };
  
  const handleSaveFamily = () => {
    // In a real app, this would call an API to save the family
    console.log('Saving family:', newFamily);
    
    // For demo purposes, we'll just close the modal
    setShowAddModal(false);
    
    // Reset the form
    setNewFamily({
      name: '',
      code: '',
      description: ''
    });
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Product Families</h1>
          <p className="text-muted mb-0">Define product families and their attributes</p>
        </div>
        <Button variant="primary" onClick={handleAddFamily}>
          <FaPlus className="me-2" />
          Add Family
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search families..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Families Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading families...</p>
            </div>
          ) : families.length === 0 ? (
            <div className="text-center py-5">
              <FaLayerGroup size={48} className="text-muted mb-3" />
              <h4>No Families Found</h4>
              <p className="text-muted">Get started by adding your first product family.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddFamily}>
                  <FaPlus className="me-2" />
                  Add Family
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Attributes</th>
                  <th>Products</th>
                  <th>Created</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {families.map((family) => (
                  <tr key={family.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaLayerGroup className="me-2 text-primary" />
                        {family.name}
                      </div>
                    </td>
                    <td>{family.code}</td>
                    <td>
                      <Badge bg="info">{family._count?.requiredAttributes || 0} attributes</Badge>
                    </td>
                    <td>
                      <Badge bg="secondary">{family._count?.products || 0} products</Badge>
                    </td>
                    <td>{new Date(family.createdAt).toLocaleDateString()}</td>
                    <td>{new Date(family.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Button variant="link" className="p-0 me-2" title="View">
                        <FaEye />
                      </Button>
                      <Button variant="link" className="p-0 me-2" title="Edit">
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 text-danger" title="Delete">
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

      {/* Family Info */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">About Product Families</h5>
        </Card.Header>
        <Card.Body>
          <p>
            Product families help you organize your products by grouping them based on common attributes.
            Each family defines a set of attributes that products in that family should have.
          </p>
          <h6>Benefits of using product families:</h6>
          <ul>
            <li>Standardize product information across similar products</li>
            <li>Ensure consistent data quality by defining required attributes</li>
            <li>Simplify product creation with predefined attribute sets</li>
            <li>Organize attributes into logical groups for better management</li>
            <li>Improve product data completeness and quality</li>
          </ul>
        </Card.Body>
      </Card>

      {/* Family Detail View (would be shown when a family is selected) */}
      {/* This would typically be a separate component or a modal */}
      <div style={{ display: 'none' }}>
        <Card className="mt-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Family Details</h5>
            <div>
              <Button variant="outline-primary" size="sm" className="me-2">
                <FaEdit className="me-1" />
                Edit
              </Button>
              <Button variant="outline-danger" size="sm">
                <FaTrash className="me-1" />
                Delete
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <p><strong>Name:</strong> [Family Name]</p>
                <p><strong>Code:</strong> [Family Code]</p>
                <p><strong>Created:</strong> [Creation Date]</p>
                <p><strong>Updated:</strong> [Update Date]</p>
              </Col>
              <Col md={6}>
                <p><strong>Attributes:</strong> [Attribute Count]</p>
                <p><strong>Products:</strong> [Product Count]</p>
              </Col>
            </Row>

            <h6 className="mt-4">Attribute Groups</h6>
            <Table responsive>
              <thead>
                <tr>
                  <th>Group Name</th>
                  <th>Attributes</th>
                  <th>Order</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Basic Information</td>
                  <td>5 attributes</td>
                  <td>1</td>
                </tr>
                <tr>
                  <td>Technical Specifications</td>
                  <td>8 attributes</td>
                  <td>2</td>
                </tr>
              </tbody>
            </Table>

            <h6 className="mt-4">Required Attributes</h6>
            <Table responsive>
              <thead>
                <tr>
                  <th>Attribute</th>
                  <th>Type</th>
                  <th>Group</th>
                  <th>Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Name</td>
                  <td>Text</td>
                  <td>Basic Information</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>Text Area</td>
                  <td>Basic Information</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
      
      {/* Add Family Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Family</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newFamily.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control 
                type="text" 
                name="code"
                value={newFamily.code}
                onChange={handleInputChange}
                placeholder="e.g. electronics, clothing"
              />
              <Form.Text className="text-muted">
                A unique identifier for the family. If left blank, it will be generated from the name.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={newFamily.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Attributes</Form.Label>
              <p className="text-muted small">You can add attributes to this family after creation.</p>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveFamily}>
            <FaSave className="me-2" />
            Save Family
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Families;
