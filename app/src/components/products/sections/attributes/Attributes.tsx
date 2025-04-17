import React, { useState } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, Modal } from 'react-bootstrap';
import { FaTag, FaPlus, FaSearch, FaEdit, FaTrash, FaSave } from 'react-icons/fa';

const Attributes: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    code: '',
    type: 'TEXT',
    isRequired: false,
    isUnique: false,
    isLocalizable: false,
    isScopable: false,
    options: ''
  });
  
  // Mock data for demonstration
  const attributes: any[] = [];
  
  // Attribute type options
  const attributeTypes = [
    { value: 'TEXT', label: 'Text', color: 'primary' },
    { value: 'TEXTAREA', label: 'Text Area', color: 'primary' },
    { value: 'NUMBER', label: 'Number', color: 'success' },
    { value: 'BOOLEAN', label: 'Boolean', color: 'warning' },
    { value: 'DATE', label: 'Date', color: 'info' },
    { value: 'DATETIME', label: 'Date & Time', color: 'info' },
    { value: 'SELECT', label: 'Select', color: 'secondary' },
    { value: 'MULTISELECT', label: 'Multi-select', color: 'secondary' },
    { value: 'PRICE', label: 'Price', color: 'success' },
    { value: 'IMAGE', label: 'Image', color: 'danger' },
    { value: 'FILE', label: 'File', color: 'danger' },
    { value: 'REFERENCE', label: 'Reference', color: 'dark' },
    { value: 'METRIC', label: 'Metric', color: 'success' }
  ];
  
  // Get badge color for attribute type
  const getTypeColor = (type: string) => {
    const typeObj = attributeTypes.find(t => t.value === type);
    return typeObj ? typeObj.color : 'secondary';
  };
  
  const handleAddAttribute = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewAttribute({
      ...newAttribute,
      [name]: checked !== undefined ? checked : value
    });
  };
  
  const handleSaveAttribute = () => {
    // In a real app, this would call an API to save the attribute
    console.log('Saving attribute:', newAttribute);
    
    // For demo purposes, we'll just close the modal
    setShowAddModal(false);
    
    // Reset the form
    setNewAttribute({
      name: '',
      code: '',
      type: 'TEXT',
      isRequired: false,
      isUnique: false,
      isLocalizable: false,
      isScopable: false,
      options: ''
    });
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Product Attributes</h1>
          <p className="text-muted mb-0">Define and manage product attributes</p>
        </div>
        <Button variant="primary" onClick={handleAddAttribute}>
          <FaPlus className="me-2" />
          Add Attribute
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
                  placeholder="Search attributes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Select 
                  value={selectedType || ''} 
                  onChange={(e) => setSelectedType(e.target.value || null)}
                >
                  <option value="">All Types</option>
                  {attributeTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Attributes Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading attributes...</p>
            </div>
          ) : attributes.length === 0 ? (
            <div className="text-center py-5">
              <FaTag size={48} className="text-muted mb-3" />
              <h4>No Attributes Found</h4>
              <p className="text-muted">Get started by adding your first product attribute.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddAttribute}>
                  <FaPlus className="me-2" />
                  Add Attribute
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Unique</th>
                  <th>Localizable</th>
                  <th>Scopable</th>
                  <th>Usage</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attributes.map((attribute) => (
                  <tr key={attribute.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaTag className="me-2 text-primary" />
                        {attribute.name}
                      </div>
                    </td>
                    <td>{attribute.code}</td>
                    <td>
                      <Badge bg={getTypeColor(attribute.type)}>
                        {attribute.type}
                      </Badge>
                    </td>
                    <td>{attribute.isRequired ? 'Yes' : 'No'}</td>
                    <td>{attribute.isUnique ? 'Yes' : 'No'}</td>
                    <td>{attribute.isLocalizable ? 'Yes' : 'No'}</td>
                    <td>{attribute.isScopable ? 'Yes' : 'No'}</td>
                    <td>
                      {attribute.usage ? (
                        <div>
                          <div>Products: {attribute.usage.productCount}</div>
                          <div>Families: {attribute.usage.familyCount}</div>
                        </div>
                      ) : (
                        'Not used'
                      )}
                    </td>
                    <td>
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

      {/* Attribute Types Info */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Attribute Types</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            {attributeTypes.map((type) => (
              <Col md={3} key={type.value} className="mb-3">
                <div className="d-flex align-items-center">
                  <Badge bg={type.color} className="me-2">{type.value}</Badge>
                  <span>{type.label}</span>
                </div>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
      
      {/* Add Attribute Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Attribute</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Name</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="name"
                    value={newAttribute.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Code</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="code"
                    value={newAttribute.code}
                    onChange={handleInputChange}
                    placeholder="e.g. color, size"
                  />
                  <Form.Text className="text-muted">
                    A unique identifier for the attribute. If left blank, it will be generated from the name.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Type</Form.Label>
              <Form.Select 
                name="type"
                value={newAttribute.type}
                onChange={handleInputChange}
              >
                {attributeTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
            {(newAttribute.type === 'SELECT' || newAttribute.type === 'MULTISELECT') && (
              <Form.Group className="mb-3">
                <Form.Label>Options</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="options"
                  value={newAttribute.options}
                  onChange={handleInputChange}
                  placeholder="Enter options, one per line"
                />
                <Form.Text className="text-muted">
                  Enter one option per line. These will be the available choices for this attribute.
                </Form.Text>
              </Form.Group>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="isRequired"
                    name="isRequired"
                    label="Required"
                    checked={newAttribute.isRequired}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    If checked, this attribute must have a value.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="isUnique"
                    name="isUnique"
                    label="Unique"
                    checked={newAttribute.isUnique}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    If checked, this attribute's value must be unique across products.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="isLocalizable"
                    name="isLocalizable"
                    label="Localizable"
                    checked={newAttribute.isLocalizable}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    If checked, this attribute can have different values per locale.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="isScopable"
                    name="isScopable"
                    label="Scopable"
                    checked={newAttribute.isScopable}
                    onChange={handleInputChange}
                  />
                  <Form.Text className="text-muted">
                    If checked, this attribute can have different values per channel.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveAttribute}>
            <FaSave className="me-2" />
            Save Attribute
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Attributes;
