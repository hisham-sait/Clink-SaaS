import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Alert, Modal } from 'react-bootstrap';
import { FaFolder, FaFolderPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import * as CategoriesService from '../../../../services/engage/categories';

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
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    type: 'form' // Default to form
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
  
  const handleAddCategory = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedCategory(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSelectedCategory({
      ...selectedCategory,
      [name]: value
    });
  };
  
  const handleSaveCategory = async () => {
    try {
      setLoading(true);
      
      // Create a copy of the category data to modify
      const categoryData = { ...newCategory };
      
      // Log the category being saved (for debugging)
      console.log('Saving category:', categoryData);
      
      // Use the service layer to create the category
      await CategoriesService.createCategory(categoryData);
      
      // Refresh the categories list
      await fetchCategories();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewCategory({
        name: '',
        type: 'form'
      });
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditCategory = (category: any) => {
    setSelectedCategory({...category});
    setShowEditModal(true);
  };
  
  const handleDeleteCategory = (category: any) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };
  
  const handleUpdateCategory = async () => {
    try {
      setLoading(true);
      
      // Create a copy of the category data to modify
      const categoryData = { 
        name: selectedCategory.name
      };
      
      // Log the category being updated (for debugging)
      console.log('Updating category:', categoryData);
      
      // Use the service layer to update the category
      if (selectedCategory.type === 'form') {
        await CategoriesService.updateFormCategory(selectedCategory.id, categoryData);
      } else {
        await CategoriesService.updateSurveyCategory(selectedCategory.id, categoryData);
      }
      
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
      setLoading(true);
      
      if (!selectedCategory?.id) {
        throw new Error('No category selected');
      }
      
      // Use the service layer to delete the category
      if (selectedCategory.type === 'form') {
        await CategoriesService.deleteFormCategory(selectedCategory.id);
      } else {
        await CategoriesService.deleteSurveyCategory(selectedCategory.id);
      }
      
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
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Categories</h1>
          <p className="text-muted mb-0">Organize your forms and surveys with categories</p>
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
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5">
              <FaFolder size={48} className="text-muted mb-3" />
              <h4>No Categories Found</h4>
              <p className="text-muted">Get started by adding your first category.</p>
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
                  <th>Type</th>
                  <th>Items Count</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories
                  .filter(category => category.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((category) => (
                    <tr key={`${category.type}-${category.id}`}>
                      <td>
                        <div className="d-flex align-items-center">
                          <FaFolder className="me-2 text-warning" />
                          {category.name}
                        </div>
                      </td>
                      <td>{category.type === 'form' ? 'Form' : 'Survey'}</td>
                      <td>
                        {category.type === 'form' 
                          ? (category.formsCount || 0) 
                          : (category.surveysCount || 0)}
                      </td>
                      <td>{new Date(category.createdAt).toLocaleDateString()}</td>
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
