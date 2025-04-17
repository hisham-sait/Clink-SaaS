import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { FaLayerGroup, FaPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import api from '../../../../services/api';

const Sections: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  const [newSection, setNewSection] = useState({
    name: '',
    code: '',
    description: '',
    displayIn: 'both' // 'left', 'right', or 'both'
  });
  
  // Fetch sections on component mount
  useEffect(() => {
    fetchSections();
  }, []);
  
  const fetchSections = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await api.get(`/products/sections/${user.companyId}`);
      setSections(response.data);
    } catch (err: any) {
      console.error('Error fetching sections:', err);
      setError(err.message || 'Failed to fetch sections');
      
      // If API fails, use default sections as fallback
      const defaultSections = [
        { 
          id: '1', 
          name: 'General Information', 
          code: 'general-info', 
          description: 'Basic product information',
          displayIn: 'both'
        },
        { 
          id: '2', 
          name: 'Technical Specifications', 
          code: 'tech-specs', 
          description: 'Technical details and specifications',
          displayIn: 'right'
        },
        { 
          id: '3', 
          name: 'Marketing', 
          code: 'marketing', 
          description: 'Marketing information and materials',
          displayIn: 'left'
        }
      ];
      
      setSections(defaultSections);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddSection = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedSection(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSection({
      ...newSection,
      [name]: value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedSection({
      ...selectedSection,
      [name]: value
    });
  };
  
  const handleSaveSection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Generate a code from the name if it's empty
      let sectionCode = newSection.code;
      if (!sectionCode.trim()) {
        sectionCode = newSection.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      const sectionData = {
        name: newSection.name,
        code: sectionCode,
        description: newSection.description,
        displayIn: newSection.displayIn
      };
      
      // Save to API
      const response = await api.post(`/products/sections/${user.companyId}`, sectionData);
      
      // Add the new section to the state
      setSections([...sections, response.data]);
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewSection({
        name: '',
        code: '',
        description: '',
        displayIn: 'both'
      });
    } catch (err: any) {
      console.error('Error saving section:', err);
      setError(err.message || 'Failed to save section');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditSection = (section: any) => {
    setSelectedSection({...section});
    setShowEditModal(true);
  };
  
  const handleDeleteSection = (section: any) => {
    setSelectedSection(section);
    setShowDeleteModal(true);
  };
  
  const handleUpdateSection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Update via API
      const response = await api.put(`/products/sections/${user.companyId}/${selectedSection.id}`, selectedSection);
      
      // Update the section in the state
      const updatedSections = sections.map(section => 
        section.id === selectedSection.id ? response.data : section
      );
      
      setSections(updatedSections);
      
      // Close the modal
      setShowEditModal(false);
      setSelectedSection(null);
    } catch (err: any) {
      console.error('Error updating section:', err);
      setError(err.message || 'Failed to update section');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Delete via API
      await api.delete(`/products/sections/${user.companyId}/${selectedSection.id}`);
      
      // Remove the section from the state
      const filteredSections = sections.filter(section => section.id !== selectedSection.id);
      setSections(filteredSections);
      
      // Close the modal
      setShowDeleteModal(false);
      setSelectedSection(null);
    } catch (err: any) {
      console.error('Error deleting section:', err);
      setError(err.message || 'Failed to delete section');
    } finally {
      setLoading(false);
    }
  };
  
  const handleMoveSection = async (section: any, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      const sectionIndex = sections.findIndex(s => s.id === section.id);
      
      if ((direction === 'up' && sectionIndex > 0) || 
          (direction === 'down' && sectionIndex < sections.length - 1)) {
        
        // Create a new array with the sections in the new order
        const newSections = [...sections];
        
        if (direction === 'up') {
          const temp = newSections[sectionIndex];
          newSections[sectionIndex] = newSections[sectionIndex - 1];
          newSections[sectionIndex - 1] = temp;
        } else {
          const temp = newSections[sectionIndex];
          newSections[sectionIndex] = newSections[sectionIndex + 1];
          newSections[sectionIndex + 1] = temp;
        }
        
        // Get the IDs in the new order
        const sectionIds = newSections.map(s => s.id);
        
        // Update via API
        const response = await api.put(`/products/sections/${user.companyId}/reorder`, { sectionIds });
        
        // Update the state with the response
        setSections(response.data);
      }
    } catch (err: any) {
      console.error(`Error moving section ${direction}:`, err);
      setError(err.message || `Failed to move section ${direction}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to get display location text
  const getDisplayLocationText = (displayIn: string) => {
    switch (displayIn) {
      case 'left': return 'Left Panel';
      case 'right': return 'Right Panel';
      case 'both': return 'Both Panels';
      default: return 'Both Panels';
    }
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Product Sections</h1>
          <p className="text-muted mb-0">Organize your product details with customizable sections</p>
        </div>
        <Button variant="primary" onClick={handleAddSection}>
          <FaPlus className="me-2" />
          Add Section
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
                  placeholder="Search sections..."
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

      {/* Sections Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading sections...</p>
            </div>
          ) : sections.length === 0 ? (
            <div className="text-center py-5">
              <FaLayerGroup size={48} className="text-muted mb-3" />
              <h4>No Sections Found</h4>
              <p className="text-muted">Get started by adding your first product section.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddSection}>
                  <FaPlus className="me-2" />
                  Add Section
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Description</th>
                  <th>Display In</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections
                  .filter(section => 
                    section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    section.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    section.description.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((section) => (
                  <tr key={section.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaLayerGroup className="me-2 text-primary" />
                        {section.name}
                      </div>
                    </td>
                    <td>{section.code}</td>
                    <td>{section.description}</td>
                    <td>{getDisplayLocationText(section.displayIn)}</td>
                    <td>
                      <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleEditSection(section)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 me-2 text-danger" title="Delete" onClick={() => handleDeleteSection(section)}>
                        <FaTrash />
                      </Button>
                      <Button variant="link" className="p-0 me-2" title="Move Up" onClick={() => handleMoveSection(section, 'up')}>
                        <FaArrowUp />
                      </Button>
                      <Button variant="link" className="p-0" title="Move Down" onClick={() => handleMoveSection(section, 'down')}>
                        <FaArrowDown />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
      
      {/* Add Section Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newSection.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control 
                type="text" 
                name="code"
                value={newSection.code}
                onChange={handleInputChange}
                placeholder="e.g. technical-specs, dimensions"
              />
              <Form.Text className="text-muted">
                A unique identifier for the section. If left blank, it will be generated from the name.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={newSection.description}
                onChange={handleInputChange}
                placeholder="Describe the purpose of this section"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Display In</Form.Label>
              <Form.Select
                name="displayIn"
                value={newSection.displayIn}
                onChange={handleInputChange}
              >
                <option value="both">Both Panels</option>
                <option value="left">Left Panel Only</option>
                <option value="right">Right Panel Only</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Choose where this section should be displayed in the product view.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveSection}>
            <FaSave className="me-2" />
            Save Section
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Section Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSection && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={selectedSection.name}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="code"
                  value={selectedSection.code}
                  onChange={handleEditInputChange}
                  placeholder="e.g. technical-specs, dimensions"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the section. If left blank, it will be generated from the name.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  name="description"
                  value={selectedSection.description}
                  onChange={handleEditInputChange}
                  placeholder="Describe the purpose of this section"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Display In</Form.Label>
                <Form.Select
                  name="displayIn"
                  value={selectedSection.displayIn || 'both'}
                  onChange={handleEditInputChange}
                >
                  <option value="both">Both Panels</option>
                  <option value="left">Left Panel Only</option>
                  <option value="right">Right Panel Only</option>
                </Form.Select>
                <Form.Text className="text-muted">
                  Choose where this section should be displayed in the product view.
                </Form.Text>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateSection}>
            <FaSave className="me-2" />
            Update Section
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSection && (
            <p>
              Are you sure you want to delete the section <strong>{selectedSection.name}</strong>?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            <FaTrash className="me-2" />
            Delete Section
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Sections;
