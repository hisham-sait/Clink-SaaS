import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Modal, Alert } from 'react-bootstrap';
import { FaFolder, FaFolderPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import api from '../../../../services/api';

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
    code: '',
    parentId: '',
    level: 1
  });
  
  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      const response = await api.get(`/products/categories/${user.companyId}`);
      setCategories(response.data.categories || []);
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
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the category data to modify
      const categoryData = { ...newCategory };
      
      // Generate a code from the name if it's empty
      if (!categoryData.code.trim()) {
        categoryData.code = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Prepare the data to send to the API
      const apiData = {
        ...categoryData,
        // Convert empty parentId to null for the API
        parentId: categoryData.parentId === '' ? null : categoryData.parentId
      };
      
      // Log the category being saved (for debugging)
      console.log('Saving category:', apiData);
      
      // Make the API call to save the category
      await api.post(`/products/categories/${user.companyId}`, apiData);
      
      // Refresh the categories list
      await fetchCategories();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewCategory({
        name: '',
        code: '',
        parentId: '',
        level: 1
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
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a copy of the category data to modify
      const categoryData = { ...selectedCategory };
      
      // Generate a code from the name if it's empty
      if (!categoryData.code.trim()) {
        categoryData.code = categoryData.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
      
      // Prepare the data to send to the API
      const apiData = {
        ...categoryData,
        // Convert empty parentId to null for the API
        parentId: categoryData.parentId === '' ? null : categoryData.parentId
      };
      
      // Log the category being updated (for debugging)
      console.log('Updating category:', apiData);
      
      // Make the API call to update the category
      await api.put(`/products/categories/${user.companyId}/${categoryData.id}`, apiData);
      
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
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Make the API call to delete the category
      await api.delete(`/products/categories/${user.companyId}/${selectedCategory.id}`);
      
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
  
  const handleMoveCategory = async (category: any, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Make the API call to move the category
      await api.put(`/products/categories/${user.companyId}/${category.id}/move`, { direction });
      
      // Refresh the categories list
      await fetchCategories();
    } catch (err: any) {
      console.error(`Error moving category ${direction}:`, err);
      setError(err.message || `Failed to move category ${direction}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Product Categories</h1>
          <p className="text-muted mb-0">Organize your products with categories</p>
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
              <p className="text-muted">Get started by adding your first product category.</p>
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
                  <th>Code</th>
                  <th>Parent Category</th>
                  <th>Products</th>
                  <th>Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <FaFolder className="me-2 text-warning" />
                        {category.name}
                      </div>
                    </td>
                    <td>{category.code}</td>
                    <td>{category.parent ? category.parent.name : '-'}</td>
                    <td>{category.productsCount || 0}</td>
                    <td>{category.level}</td>
                    <td>
                      <Button variant="link" className="p-0 me-2" title="Edit" onClick={() => handleEditCategory(category)}>
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 me-2 text-danger" title="Delete" onClick={() => handleDeleteCategory(category)}>
                        <FaTrash />
                      </Button>
                      <Button variant="link" className="p-0 me-2" title="Move Up" onClick={() => handleMoveCategory(category, 'up')}>
                        <FaArrowUp />
                      </Button>
                      <Button variant="link" className="p-0" title="Move Down" onClick={() => handleMoveCategory(category, 'down')}>
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

      {/* Category Tree View */}
      <Card className="mt-4">
        <Card.Header>
          <h5 className="mb-0">Category Tree</h5>
        </Card.Header>
        <Card.Body>
          {categories.length === 0 ? (
            <p className="text-muted">No categories to display in the tree view.</p>
          ) : (
            <div className="category-tree">
              {/* Tree view would be implemented here */}
              <p className="text-muted">Category tree view will be displayed here.</p>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Add Category Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control 
                type="text" 
                name="name"
                value={newCategory.name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Code</Form.Label>
              <Form.Control 
                type="text" 
                name="code"
                value={newCategory.code}
                onChange={handleInputChange}
                placeholder="e.g. electronics, clothing"
              />
              <Form.Text className="text-muted">
                A unique identifier for the category. If left blank, it will be generated from the name.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Parent Category</Form.Label>
              <Form.Select 
                name="parentId"
                value={newCategory.parentId}
                onChange={handleInputChange}
              >
                <option value="">None (Top Level)</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Level</Form.Label>
              <Form.Control 
                type="number" 
                name="level"
                value={newCategory.level}
                onChange={handleInputChange}
                min={1}
                max={10}
              />
              <Form.Text className="text-muted">
                The level in the category hierarchy. Top-level categories are level 1.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveCategory}>
            <FaSave className="me-2" />
            Save Category
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Edit Category Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={selectedCategory.name}
                  onChange={handleEditInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="code"
                  value={selectedCategory.code}
                  onChange={handleEditInputChange}
                  placeholder="e.g. electronics, clothing"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the category. If left blank, it will be generated from the name.
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Parent Category</Form.Label>
                <Form.Select 
                  name="parentId"
                  value={selectedCategory.parentId || ''}
                  onChange={handleEditInputChange}
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter(cat => cat.id !== selectedCategory.id) // Can't be its own parent
                    .map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))
                  }
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Level</Form.Label>
                <Form.Control 
                  type="number" 
                  name="level"
                  value={selectedCategory.level}
                  onChange={handleEditInputChange}
                  min={1}
                  max={10}
                />
                <Form.Text className="text-muted">
                  The level in the category hierarchy. Top-level categories are level 1.
                </Form.Text>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateCategory}>
            <FaSave className="me-2" />
            Update Category
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategory && (
            <p>
              Are you sure you want to delete the category <strong>{selectedCategory.name}</strong>?
              This action cannot be undone.
              {selectedCategory.productsCount > 0 && (
                <Alert variant="warning" className="mt-3">
                  <strong>Warning:</strong> This category has {selectedCategory.productsCount} products associated with it.
                  Deleting this category may affect these products.
                </Alert>
              )}
              {categories.some(cat => cat.parentId === selectedCategory.id) && (
                <Alert variant="warning" className="mt-3">
                  <strong>Warning:</strong> This category has subcategories.
                  Deleting this category may affect these subcategories.
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
            Delete Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Categories;
