import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { FaTag, FaPlus, FaSearch, FaEdit, FaTrash, FaSave, FaTable } from 'react-icons/fa';
import api from '../../../../services/api';

const Attributes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
  const [newAttribute, setNewAttribute] = useState({
    name: '',
    code: '',
    type: 'TEXT',
    isRequired: false,
    isUnique: false,
    isLocalizable: false,
    isScopable: false,
    options: '',
    tableConfig: {
      columns: [
        { name: 'Name', key: 'name' },
        { name: 'Value', key: 'value' },
        { name: 'Unit', key: 'unit' }
      ]
    },
    sectionId: ''
  });
  const [sections, setSections] = useState<any[]>([]);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  
  // Fetch attributes and sections on component mount
  useEffect(() => {
    fetchAttributes();
    fetchSections();
  }, []);
  
  // Function to fetch sections from the API
  const fetchSections = async () => {
    try {
      setSectionsLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await api.get(`/products/sections/${user.companyId}`);
      setSections(response.data || []);
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      setError(err.message || 'Failed to fetch sections');
    } finally {
      setSectionsLoading(false);
    }
  };
  
  // Function to fetch attributes from the API
  const fetchAttributes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Add type filter if selected
      const typeParam = selectedType ? `?type=${selectedType}` : '';
      
      const response = await api.get(`/products/attributes/${user.companyId}${typeParam}`);
      setAttributes(response.data || []);
    } catch (err: any) {
      console.error('Error fetching attributes:', err);
      setError(err.message || 'Failed to fetch attributes');
    } finally {
      setLoading(false);
    }
  };
  
  // Refetch attributes when type filter changes
  useEffect(() => {
    fetchAttributes();
  }, [selectedType]);
  
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
    { value: 'METRIC', label: 'Metric', color: 'success' },
    { value: 'TABLE', label: 'Table', color: 'info' }
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
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedAttribute(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setNewAttribute({
      ...newAttribute,
      [name]: checked !== undefined ? checked : value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSelectedAttribute({
      ...selectedAttribute,
      [name]: checked !== undefined ? checked : value
    });
  };
  
  const handleSaveAttribute = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the attribute data to modify
      const attributeData = { ...newAttribute };
      
      // Generate a code from the name if it's empty
      if (!attributeData.code.trim()) {
        attributeData.code = attributeData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Handle different attribute types
      if (attributeData.type === 'SELECT' || attributeData.type === 'MULTISELECT') {
        // Convert options string to array for SELECT and MULTISELECT types
        const optionsArray = attributeData.options
          .split('\n')
          .map((option: string) => option.trim())
          .filter((option: string) => option.length > 0);
        
        // Prepare the data to send to the API
        const apiData = {
          ...attributeData,
          options: optionsArray.length > 0 ? optionsArray : null
        };
        
        // Log the attribute being saved (for debugging)
        console.log('Saving attribute:', apiData);
        
        // Make the API call to save the attribute
        await api.post(`/products/attributes/${user.companyId}`, apiData);
      } else if (attributeData.type === 'TABLE') {
        // For TABLE type, include the tableConfig
        const apiData = {
          ...attributeData,
          tableConfig: attributeData.tableConfig
        };
        
        // Log the attribute being saved (for debugging)
        console.log('Saving TABLE attribute:', apiData);
        
        // Make the API call to save the attribute
        await api.post(`/products/attributes/${user.companyId}`, apiData);
      } else {
        // For other types, just remove the options field
        const { options, tableConfig, ...apiData } = attributeData;
        
        // Log the attribute being saved (for debugging)
        console.log('Saving attribute:', apiData);
        
        // Make the API call to save the attribute
        await api.post(`/products/attributes/${user.companyId}`, apiData);
      }
      
      // Refresh the attributes list
      await fetchAttributes();
      
      // Close the modal
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
        options: '',
        tableConfig: {
          columns: [
            { name: 'Name', key: 'name' },
            { name: 'Value', key: 'value' },
            { name: 'Unit', key: 'unit' }
          ]
        },
        sectionId: ''
      });
    } catch (err: any) {
      console.error('Error saving attribute:', err);
      setError(err.message || 'Failed to save attribute');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditAttribute = (attribute: any) => {
    // Create a copy of the attribute with options as string if needed
    const attributeCopy = { ...attribute };
    if (attribute.options && Array.isArray(attribute.options)) {
      attributeCopy.options = attribute.options.join('\n');
    } else {
      attributeCopy.options = '';
    }
    
    // Ensure tableConfig exists
    if (!attributeCopy.tableConfig && attribute.type === 'TABLE') {
      attributeCopy.tableConfig = {
        columns: [
          { name: 'Name', key: 'name' },
          { name: 'Value', key: 'value' },
          { name: 'Unit', key: 'unit' }
        ]
      };
    }
    
    setSelectedAttribute(attributeCopy);
    setShowEditModal(true);
  };
  
  const handleDeleteAttribute = (attribute: any) => {
    setSelectedAttribute(attribute);
    setShowDeleteModal(true);
  };
  
  const handleUpdateAttribute = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the attribute data to modify
      const attributeData = { ...selectedAttribute };
      
      // Generate a code from the name if it's empty
      if (!attributeData.code.trim()) {
        attributeData.code = attributeData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Handle different attribute types
      if (attributeData.type === 'SELECT' || attributeData.type === 'MULTISELECT') {
        // Convert options string to array for SELECT and MULTISELECT types
        const optionsArray = typeof attributeData.options === 'string' 
          ? attributeData.options
              .split('\n')
              .map((option: string) => option.trim())
              .filter((option: string) => option.length > 0)
          : attributeData.options;
        
        // Prepare the data to send to the API
        const apiData = {
          ...attributeData,
          options: optionsArray.length > 0 ? optionsArray : null
        };
        
        // Log the attribute being updated (for debugging)
        console.log('Updating attribute:', apiData);
        
        // Make the API call to update the attribute
        await api.put(`/products/attributes/${user.companyId}/${attributeData.id}`, apiData);
      } else if (attributeData.type === 'TABLE') {
        // For TABLE type, include the tableConfig
        const apiData = {
          ...attributeData,
          tableConfig: attributeData.tableConfig
        };
        
        // Log the attribute being updated (for debugging)
        console.log('Updating TABLE attribute:', apiData);
        
        // Make the API call to update the attribute
        await api.put(`/products/attributes/${user.companyId}/${attributeData.id}`, apiData);
      } else {
        // For other types, just remove the options field
        const { options, tableConfig, ...apiData } = attributeData;
        
        // Log the attribute being updated (for debugging)
        console.log('Updating attribute:', apiData);
        
        // Make the API call to update the attribute
        await api.put(`/products/attributes/${user.companyId}/${attributeData.id}`, apiData);
      }
      
      // Refresh the attributes list
      await fetchAttributes();
      
      // Close the modal
      setShowEditModal(false);
      setSelectedAttribute(null);
    } catch (err: any) {
      console.error('Error updating attribute:', err);
      setError(err.message || 'Failed to update attribute');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Make the API call to delete the attribute
      await api.delete(`/products/attributes/${user.companyId}/${selectedAttribute.id}`);
      
      // Refresh the attributes list
      await fetchAttributes();
      
      // Close the modal
      setShowDeleteModal(false);
      setSelectedAttribute(null);
    } catch (err: any) {
      console.error('Error deleting attribute:', err);
      setError(err.message || 'Failed to delete attribute');
    } finally {
      setLoading(false);
    }
  };
  
  // Render TABLE configuration UI
  const renderTableConfig = (isEdit = false) => {
    const attribute = isEdit ? selectedAttribute : newAttribute;
    
    if (attribute?.type !== 'TABLE') return null;
    
    return (
      <Form.Group className="mb-3">
        <Form.Label>Table Configuration</Form.Label>
        <div className="border rounded p-3 mb-2">
          <p className="text-muted mb-2">
            This attribute will store data in a table format, perfect for nutritional information.
          </p>
          <div className="mb-2">
            <strong>Default Columns:</strong>
          </div>
          <ul className="list-unstyled">
            <li><Badge bg="secondary" className="me-2">Name</Badge> e.g., Calories, Fat, Protein</li>
            <li><Badge bg="secondary" className="me-2">Value</Badge> e.g., 120, 5, 10</li>
            <li><Badge bg="secondary" className="me-2">Unit</Badge> e.g., kcal, g, g</li>
          </ul>
        </div>
        <Form.Text className="text-muted">
          The table structure is pre-configured for nutritional information. Products using this attribute will be able to add multiple rows of data.
        </Form.Text>
      </Form.Group>
    );
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

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

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
                {attributes
                  .filter(attr => searchTerm ? attr.name.toLowerCase().includes(searchTerm.toLowerCase()) || attr.code.toLowerCase().includes(searchTerm.toLowerCase()) : true)
                  .map((attribute) => (
                  <tr key={attribute.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        {attribute.type === 'TABLE' ? (
                          <FaTable className="me-2 text-info" />
                        ) : (
                          <FaTag className="me-2 text-primary" />
                        )}
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
                      <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleEditAttribute(attribute)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 text-danger" title="Delete" onClick={() => handleDeleteAttribute(attribute)}>
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
      <Modal show={showAddModal} onHide={handleCloseModal} size={newAttribute.type === 'TABLE' ? 'lg' : undefined}>
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
            <Row>
              <Col md={6}>
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
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Section</Form.Label>
                  <Form.Select 
                    name="sectionId"
                    value={newAttribute.sectionId}
                    onChange={handleInputChange}
                  >
                    <option value="">No Section</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>{section.name}</option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    Select a section to display this attribute in.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
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
            
            {/* TABLE configuration */}
            {renderTableConfig()}
            
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
      
      {/* Edit Attribute Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} size={selectedAttribute?.type === 'TABLE' ? 'lg' : undefined}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Attribute</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttribute && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name"
                      value={selectedAttribute.name}
                      onChange={handleEditInputChange}
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
                      value={selectedAttribute.code}
                      onChange={handleEditInputChange}
                      placeholder="e.g. color, size"
                    />
                    <Form.Text className="text-muted">
                      A unique identifier for the attribute. If left blank, it will be generated from the name.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select 
                      name="type"
                      value={selectedAttribute.type}
                      onChange={handleEditInputChange}
                    >
                      {attributeTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Section</Form.Label>
                    <Form.Select 
                      name="sectionId"
                      value={selectedAttribute.sectionId || ''}
                      onChange={handleEditInputChange}
                    >
                      <option value="">No Section</option>
                      {sections.map((section) => (
                        <option key={section.id} value={section.id}>{section.name}</option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Select a section to display this attribute in.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              {(selectedAttribute.type === 'SELECT' || selectedAttribute.type === 'MULTISELECT') && (
                <Form.Group className="mb-3">
                  <Form.Label>Options</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3}
                    name="options"
                    value={selectedAttribute.options}
                    onChange={handleEditInputChange}
                    placeholder="Enter options, one per line"
                  />
                  <Form.Text className="text-muted">
                    Enter one option per line. These will be the available choices for this attribute.
                  </Form.Text>
                </Form.Group>
              )}
              
              {/* TABLE configuration for edit */}
              {renderTableConfig(true)}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Check 
                      type="checkbox"
                      id="editIsRequired"
                      name="isRequired"
                      label="Required"
                      checked={selectedAttribute.isRequired}
                      onChange={handleEditInputChange}
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
                      id="editIsUnique"
                      name="isUnique"
                      label="Unique"
                      checked={selectedAttribute.isUnique}
                      onChange={handleEditInputChange}
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
                      id="editIsLocalizable"
                      name="isLocalizable"
                      label="Localizable"
                      checked={selectedAttribute.isLocalizable}
                      onChange={handleEditInputChange}
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
                      id="editIsScopable"
                      name="isScopable"
                      label="Scopable"
                      checked={selectedAttribute.isScopable}
                      onChange={handleEditInputChange}
                    />
                    <Form.Text className="text-muted">
                      If checked, this attribute can have different values per channel.
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateAttribute}>
            <FaSave className="me-2" />
            Update Attribute
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedAttribute && (
            <p>
              Are you sure you want to delete the attribute <strong>{selectedAttribute.name}</strong>?
              This action cannot be undone.
              {selectedAttribute.usage && (selectedAttribute.usage.productCount > 0 || selectedAttribute.usage.familyCount > 0) && (
                <Alert variant="warning" className="mt-3">
                  <strong>Warning:</strong> This attribute is currently in use:
                  <ul className="mb-0 mt-2">
                    {selectedAttribute.usage.productCount > 0 && (
                      <li>Used by {selectedAttribute.usage.productCount} products</li>
                    )}
                    {selectedAttribute.usage.familyCount > 0 && (
                      <li>Used by {selectedAttribute.usage.familyCount} families</li>
                    )}
                  </ul>
                  <p className="mt-2 mb-0">Deleting this attribute may affect these items.</p>
                </Alert>
              )}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <FaTrash className="me-2" />
            Delete Attribute
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Attributes;
