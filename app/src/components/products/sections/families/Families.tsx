import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Badge, Modal, Alert } from 'react-bootstrap';
import { FaLayerGroup, FaPlus, FaSearch, FaEdit, FaTrash, FaEye, FaSave } from 'react-icons/fa';
import api from '../../../../services/api';

const Families: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [families, setFamilies] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [newFamily, setNewFamily] = useState({
    name: '',
    code: '',
    description: ''
  });
  
  // Fetch families on component mount
  useEffect(() => {
    fetchFamilies();
  }, []);
  
  // Function to fetch families from the API
  const fetchFamilies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await api.get(`/products/families/${user.companyId}`);
      setFamilies(response.data || []);
    } catch (err: any) {
      console.error('Error fetching families:', err);
      setError(err.message || 'Failed to fetch families');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddFamily = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setSelectedFamily(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFamily({
      ...newFamily,
      [name]: value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedFamily({
      ...selectedFamily,
      [name]: value
    });
  };
  
  const handleSaveFamily = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the family data to modify
      const familyData = { ...newFamily };
      
      // Generate a code from the name if it's empty
      if (!familyData.code.trim()) {
        familyData.code = familyData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Log the family being saved (for debugging)
      console.log('Saving family:', familyData);
      
      // Make the API call to save the family
      await api.post(`/products/families/${user.companyId}`, familyData);
      
      // Refresh the families list
      await fetchFamilies();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewFamily({
        name: '',
        code: '',
        description: ''
      });
    } catch (err: any) {
      console.error('Error saving family:', err);
      setError(err.message || 'Failed to save family');
    } finally {
      setLoading(false);
    }
  };
  
  const handleViewFamily = (family: any) => {
    setSelectedFamily(family);
    setShowViewModal(true);
  };
  
  const handleEditFamily = (family: any) => {
    setSelectedFamily({...family});
    setShowEditModal(true);
  };
  
  const handleDeleteFamily = (family: any) => {
    setSelectedFamily(family);
    setShowDeleteModal(true);
  };
  
  const handleUpdateFamily = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the family data to modify
      const familyData = { ...selectedFamily };
      
      // Generate a code from the name if it's empty
      if (!familyData.code.trim()) {
        familyData.code = familyData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Log the family being updated (for debugging)
      console.log('Updating family:', familyData);
      
      // Make the API call to update the family
      await api.put(`/products/families/${user.companyId}/${familyData.id}`, familyData);
      
      // Refresh the families list
      await fetchFamilies();
      
      // Close the modal
      setShowEditModal(false);
      setSelectedFamily(null);
    } catch (err: any) {
      console.error('Error updating family:', err);
      setError(err.message || 'Failed to update family');
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
      
      // Make the API call to delete the family
      await api.delete(`/products/families/${user.companyId}/${selectedFamily.id}`);
      
      // Refresh the families list
      await fetchFamilies();
      
      // Close the modal
      setShowDeleteModal(false);
      setSelectedFamily(null);
    } catch (err: any) {
      console.error('Error deleting family:', err);
      setError(err.message || 'Failed to delete family');
    } finally {
      setLoading(false);
    }
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

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

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
                      <Button variant="link" className="p-0 me-2" title="View" onClick={() => handleViewFamily(family)}>
                        <FaEye />
                      </Button>
                      <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleEditFamily(family)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 text-danger" title="Delete" onClick={() => handleDeleteFamily(family)}>
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
      
      {/* Edit Family Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Family</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFamily && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={selectedFamily.name}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="code"
                  value={selectedFamily.code}
                  onChange={handleEditInputChange}
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
                  value={selectedFamily.description || ''}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateFamily}>
            <FaSave className="me-2" />
            Update Family
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* View Family Modal */}
      <Modal show={showViewModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Family Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFamily && (
            <>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {selectedFamily.name}</p>
                  <p><strong>Code:</strong> {selectedFamily.code}</p>
                  <p><strong>Created:</strong> {new Date(selectedFamily.createdAt).toLocaleDateString()}</p>
                  <p><strong>Updated:</strong> {new Date(selectedFamily.updatedAt).toLocaleDateString()}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Attributes:</strong> {selectedFamily._count?.requiredAttributes || 0}</p>
                  <p><strong>Products:</strong> {selectedFamily._count?.products || 0}</p>
                  <p><strong>Description:</strong> {selectedFamily.description || 'No description provided'}</p>
                </Col>
              </Row>

              <h6 className="mt-4">Required Attributes</h6>
              {selectedFamily.requiredAttributes && selectedFamily.requiredAttributes.length > 0 ? (
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Attribute</th>
                      <th>Type</th>
                      <th>Required</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedFamily.requiredAttributes.map((attr: any) => (
                      <tr key={attr.id}>
                        <td>{attr.attribute.name}</td>
                        <td>{attr.attribute.type}</td>
                        <td>{attr.isRequired ? 'Yes' : 'No'}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">No attributes assigned to this family yet.</p>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
          <Button variant="primary" onClick={() => {
            handleCloseModal();
            if (selectedFamily) {
              handleEditFamily(selectedFamily);
            }
          }}>
            <FaEdit className="me-2" />
            Edit Family
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFamily && (
            <p>
              Are you sure you want to delete the family <strong>{selectedFamily.name}</strong>?
              This action cannot be undone.
              {selectedFamily._count?.products > 0 && (
                <Alert variant="warning" className="mt-3">
                  <strong>Warning:</strong> This family has {selectedFamily._count.products} products associated with it.
                  Deleting this family may affect these products.
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
            Delete Family
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Families;
