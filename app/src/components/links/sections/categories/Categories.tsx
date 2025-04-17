import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Alert, Badge, Spinner } from 'react-bootstrap';
import { FaFolder, FaFolderPlus, FaSearch, FaEdit, FaTrash, FaLink, FaQrcode } from 'react-icons/fa';
import { CategoriesService, LinksTypes } from '../../../../services/links';

// Import modal components
import AddCategoryModal from './AddCategoryModal';
import EditCategoryModal from './EditCategoryModal';
import DeleteCategoryModal from './DeleteCategoryModal';

const Categories: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categories, setCategories] = useState<LinksTypes.Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<LinksTypes.Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3498db',
    status: 'Active' as LinksTypes.LinkStatus
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Function to fetch categories using the service layer
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await CategoriesService.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };
  
  // Effect to refetch categories when search term changes
  useEffect(() => {
    fetchCategories();
  }, [searchTerm]);
  
  const handleAddCategory = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
    setNewCategory({
      name: '',
      description: '',
      color: '#3498db',
      status: 'Active'
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!selectedCategory) return;
    
    const { name, value } = e.target;
    setSelectedCategory({
      ...selectedCategory,
      [name]: value
    });
  };
  
  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      
      // Use the service layer to create the category
      await CategoriesService.createCategory(newCategory);
      
      // Refresh the categories list
      await fetchCategories();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewCategory({
        name: '',
        description: '',
        color: '#3498db',
        status: 'Active'
      });
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCategory = (category: LinksTypes.Category) => {
    setSelectedCategory({...category});
    setShowEditModal(true);
  };
  
  const handleDeleteCategory = (category: LinksTypes.Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };
  
  const handleUpdateCategory = async () => {
    try {
      if (!selectedCategory) return;
      
      setLoading(true);
      
      // Use the service layer to update the category
      await CategoriesService.updateCategory(selectedCategory.id, {
        name: selectedCategory.name,
        description: selectedCategory.description,
        color: selectedCategory.color
      });
      
      // Refresh the categories list
      await fetchCategories();
      
      // Close the modal
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      if (!selectedCategory) return;
      
      setLoading(true);
      
      // Use the service layer to delete the category
      await CategoriesService.deleteCategory(selectedCategory.id);
      
      // Refresh the categories list
      await fetchCategories();
      
      // Close the modal
      setShowDeleteModal(false);
      setSelectedCategory(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Link Categories</h1>
          <p className="text-muted mb-0">Organize your links with categories</p>
        </div>
        <Button variant="primary" onClick={handleAddCategory}>
          <FaFolderPlus className="me-2" />
          Add Category
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
                  placeholder="Search categories..."
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

      {/* Categories Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <FaFolder size={48} className="text-muted mb-3" />
              <h4>No Categories Found</h4>
              <p className="text-muted">Get started by adding your first link category.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddCategory}>
                  <FaFolderPlus className="me-2" />
                  Add Category
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Color</th>
                  <th>Links</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaFolder className="me-2" style={{ color: category.color || '#3498db' }} />
                        {category.name}
                      </div>
                    </td>
                    <td>{category.description || '-'}</td>
                    <td>
                      {category.color ? (
                        <div 
                          className="color-preview" 
                          style={{ 
                            width: '24px', 
                            height: '24px', 
                            backgroundColor: category.color,
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                          }}
                        />
                      ) : '-'}
                    </td>
                    <td>
                      <Badge bg="primary" pill>
                        {category.linkCount || 0}
                      </Badge>
                    </td>
                    <td>{formatDate(category.createdAt)}</td>
                    <td>
                      <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleEditCategory(category)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 text-danger" title="Delete" onClick={() => handleDeleteCategory(category)}>
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

      {/* Category Usage Stats */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Category Usage</h5>
        </Card.Header>
        <Card.Body>
          {categories.length === 0 ? (
            <p className="text-muted">No categories to display statistics for.</p>
          ) : (
            <Row>
              {categories.map(category => (
                <Col md={4} key={category.id} className="mb-3">
                  <Card>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">
                          <FaFolder className="me-2" style={{ color: category.color || '#3498db' }} />
                          {category.name}
                        </h6>
                        <Badge bg="primary" pill>
                          {category.linkCount || 0} links
                        </Badge>
                      </div>
                      <div className="d-flex justify-content-between mt-3">
                        <div className="d-flex align-items-center">
                          <FaLink className="me-1 text-muted" />
                          <small className="text-muted">Short Links</small>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaQrcode className="me-1 text-muted" />
                          <small className="text-muted">Digital Links</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
      
      {/* Modals */}
      <AddCategoryModal
        show={showAddModal}
        onHide={handleCloseModal}
        newCategory={newCategory}
        handleInputChange={handleInputChange}
        handleSaveCategory={handleSaveCategory}
      />

      <EditCategoryModal
        show={showEditModal}
        onHide={handleCloseModal}
        selectedCategory={selectedCategory}
        handleInputChange={handleEditInputChange}
        handleUpdateCategory={handleUpdateCategory}
      />

      <DeleteCategoryModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        selectedCategory={selectedCategory}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Categories;
