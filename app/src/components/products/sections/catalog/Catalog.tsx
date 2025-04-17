import React, { useState } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Modal } from 'react-bootstrap';
import { FaBox, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaSave } from 'react-icons/fa';

const Catalog: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    type: 'PHYSICAL',
    status: 'Active',
    categoryId: '',
    familyId: ''
  });
  
  // Mock data for demonstration
  const products: any[] = [];
  const categories: any[] = [];
  const families: any[] = [];
  
  const handleAddProduct = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };
  
  const handleSaveProduct = () => {
    // In a real app, this would call an API to save the product
    console.log('Saving product:', newProduct);
    
    // For demo purposes, we'll just close the modal
    setShowAddModal(false);
    
    // Reset the form
    setNewProduct({
      name: '',
      sku: '',
      description: '',
      type: 'PHYSICAL',
      status: 'Active',
      categoryId: '',
      familyId: ''
    });
  };
  
  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Product Catalog</h1>
          <p className="text-muted mb-0">Manage your products and variants</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddProduct}>
            <FaPlus className="me-2" />
            Add Product
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item href="#/import">
                <FaFileImport className="me-2" />
                Import Products
              </Dropdown.Item>
              <Dropdown.Item href="#/export">
                <FaFileExport className="me-2" />
                Export Products
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item href="#/bulk-edit">Bulk Edit</Dropdown.Item>
              <Dropdown.Item href="#/bulk-delete" className="text-danger">Bulk Delete</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={8}>
              <div className="d-flex gap-3">
                <Form.Group className="flex-grow-1">
                  <Form.Select 
                    value={selectedCategory || ''} 
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="flex-grow-1">
                  <Form.Select 
                    value={selectedFamily || ''} 
                    onChange={(e) => setSelectedFamily(e.target.value || null)}
                  >
                    <option value="">All Families</option>
                    {families.map((family: any) => (
                      <option key={family.id} value={family.id}>{family.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
                <Form.Group className="flex-grow-1">
                  <Form.Select 
                    value={selectedStatus || ''} 
                    onChange={(e) => setSelectedStatus(e.target.value || null)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Archived">Archived</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="outline-secondary">
                  <FaFilter className="me-2" />
                  More Filters
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-5">
              <FaBox size={48} className="text-muted mb-3" />
              <h4>No Products Found</h4>
              <p className="text-muted">Get started by adding your first product or importing products.</p>
              <div className="mt-3">
                <Button variant="primary" className="me-2" onClick={handleAddProduct}>
                  <FaPlus className="me-2" />
                  Add Product
                </Button>
                <Button variant="outline-secondary">
                  <FaFileImport className="me-2" />
                  Import Products
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <Form.Check type="checkbox" />
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Image
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Name
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      SKU
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Category
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Family
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Status
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Completeness
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Products will be mapped here */}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add Product Modal */}
      <Modal show={showAddModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
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
                    value={newProduct.name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>SKU</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="sku"
                    value={newProduct.sku}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="description"
                value={newProduct.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Type</Form.Label>
                  <Form.Select 
                    name="type"
                    value={newProduct.type}
                    onChange={handleInputChange}
                  >
                    <option value="PHYSICAL">Physical</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="SERVICE">Service</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select 
                    name="status"
                    value={newProduct.status}
                    onChange={handleInputChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Draft">Draft</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select 
                    name="categoryId"
                    value={newProduct.categoryId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Family</Form.Label>
                  <Form.Select 
                    name="familyId"
                    value={newProduct.familyId}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Family</option>
                    {families.map((family: any) => (
                      <option key={family.id} value={family.id}>{family.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveProduct}>
            <FaSave className="me-2" />
            Save Product
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Catalog;
