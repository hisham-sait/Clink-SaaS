import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Alert, Modal } from 'react-bootstrap';
import { FaFolder, FaFolderPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';
import { CategoriesService } from '../../../../services/products';

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
    code: '',
    parentId: '',
    level: 1
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
      
      // Use the service layer to create the category
      await CategoriesService.createCategory(apiData);
      
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
      
      // Use the service layer to update the category
      await CategoriesService.updateCategory(categoryData.id, apiData);
      
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
  
  const handleMoveCategory = async (category: any, direction: 'up' | 'down') => {
    try {
      setLoading(true);
      
      if (!category?.id) {
        throw new Error('Invalid category');
      }
      
      // Use the service layer to move the category
      await CategoriesService.moveCategory(category.id, direction);
      
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
      
      {/* Modals */}
      <AddCategoryModal
        show={showAddModal}
        onHide={handleCloseModal}
        newCategory={newCategory}
        categories={categories}
        handleInputChange={handleInputChange}
        handleSaveCategory={handleSaveCategory}
      />
      
      <EditCategoryModal
        show={showEditModal}
        onHide={handleCloseModal}
        selectedCategory={selectedCategory}
        categories={categories}
        handleInputChange={handleEditInputChange}
        handleUpdateCategory={handleUpdateCategory}
      />
      
      <DeleteCategoryModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        selectedCategory={selectedCategory ? {
          id: selectedCategory.id,
          name: selectedCategory.name,
          productCount: selectedCategory.productsCount,
          childrenCount: categories.filter(cat => cat.parentId === selectedCategory.id).length
        } : null}
        handleConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};

export default Categories;
