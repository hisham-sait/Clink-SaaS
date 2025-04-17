import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { FaLayerGroup, FaPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import { SectionsService } from '../../../../services/products';

// Import modal components
import AddSectionModal from './AddSectionModal';
import EditSectionModal from './EditSectionModal';
import DeleteSectionModal from './DeleteSectionModal';

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
      
      const sections = await SectionsService.getSections();
      setSections(sections || []);
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
      
      // Use the service layer to create the section
      const createdSection = await SectionsService.createSection(sectionData);
      
      // Add the new section to the state
      setSections([...sections, createdSection]);
      
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
      
      if (!selectedSection?.id) {
        throw new Error('No section selected');
      }
      
      // Use the service layer to update the section
      const updatedSection = await SectionsService.updateSection(selectedSection.id, selectedSection);
      
      // Update the section in the state
      const updatedSections = sections.map(section => 
        section.id === selectedSection.id ? updatedSection : section
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
      
      if (!selectedSection?.id) {
        throw new Error('No section selected');
      }
      
      // Use the service layer to delete the section
      await SectionsService.deleteSection(selectedSection.id);
      
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
      
      if (!section?.id) {
        throw new Error('Invalid section');
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
        
        // Use the service layer to reorder sections
        const updatedSections = await SectionsService.reorderSections(sectionIds);
        
        // Update the state with the response
        setSections(updatedSections);
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
      
      {/* Modals */}
      <AddSectionModal
        show={showAddModal}
        onHide={handleCloseModal}
        newSection={newSection}
        handleInputChange={handleInputChange}
        handleSaveSection={handleSaveSection}
      />
      
      <EditSectionModal
        show={showEditModal}
        onHide={handleCloseModal}
        selectedSection={selectedSection}
        handleInputChange={handleEditInputChange}
        handleUpdateSection={handleUpdateSection}
      />
      
      <DeleteSectionModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        selectedSection={selectedSection ? {
          id: selectedSection.id,
          name: selectedSection.name,
          attributeCount: selectedSection._count?.attributes
        } : null}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Sections;
