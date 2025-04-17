import React, { useState } from 'react';
import { Card, Button, Table, Row, Col, Form, InputGroup, Modal } from 'react-bootstrap';
import { FaFolder, FaFolderPlus, FaSearch, FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaSave } from 'react-icons/fa';

const Categories: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    code: '',
    parentId: '',
    level: 1
  });
  
  // Mock data for demonstration
  const categories: any[] = [];
  
  const handleAddCategory = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };
  
  const handleSaveCategory = () => {
    // In a real app, this would call an API to save the category
    console.log('Saving category:', newCategory);
    
    // For demo purposes, we'll just close the modal
    setShowAddModal(false);
    
    // Reset the form
    setNewCategory({
      name: '',
      code: '',
      parentId: '',
      level: 1
    });
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
                      <Button variant="link" className="p-0 me-2" title="Edit">
                        <FaEdit />
                      </Button>
                      <Button variant="link" className="p-0 me-2 text-danger" title="Delete">
                        <FaTrash />
                      </Button>
                      <Button variant="link" className="p-0 me-2" title="Move Up">
                        <FaArrowUp />
                      </Button>
                      <Button variant="link" className="p-0" title="Move Down">
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
    </div>
  );
};

export default Categories;
