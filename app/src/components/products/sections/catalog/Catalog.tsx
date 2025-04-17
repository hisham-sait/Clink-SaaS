import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Modal, Alert, ProgressBar } from 'react-bootstrap';
import { FaBox, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaSave, FaEdit, FaTrash, FaEye, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../../../../services/api';

const Catalog: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [editedProduct, setEditedProduct] = useState<any>({
    name: '',
    sku: '',
    description: '',
    type: 'PHYSICAL',
    status: 'Active',
    categoryId: '',
    familyId: ''
  });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    description: '',
    type: 'PHYSICAL',
    status: 'Active',
    categoryId: '',
    familyId: ''
  });
  
  // Fetch products, categories, and families on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFamilies();
  }, []);
  
  // Function to fetch products from the API
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedFamily) params.append('familyId', selectedFamily);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await api.get(`/products/products/${user.companyId}?${params.toString()}`);
      setProducts(response.data.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
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
      // Don't set error state here to avoid blocking the UI
    }
  };
  
  // Function to fetch families from the API
  const fetchFamilies = async () => {
    try {
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
      // Don't set error state here to avoid blocking the UI
    }
  };
  
  // Refetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedFamily, selectedStatus]);
  
  const handleAddProduct = () => {
    setShowAddModal(true);
  };
  
  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowImportModal(false);
    setShowBulkEditModal(false);
    setShowBulkDeleteModal(false);
    setSelectedProduct(null);
    setEditedProduct({
      name: '',
      sku: '',
      description: '',
      type: 'PHYSICAL',
      status: 'Active',
      categoryId: '',
      familyId: ''
    });
    setImportFile(null);
    setImportResult(null);
  };
  
  // Handle checkbox selection for bulk operations
  const handleSelectProduct = (productId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };
  
  // Handle select all checkbox
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedProducts(products.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  // Set up edited product when selectedProduct changes
  useEffect(() => {
    if (selectedProduct && showEditModal) {
      setEditedProduct({
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        description: selectedProduct.description || '',
        type: selectedProduct.type || 'PHYSICAL',
        status: selectedProduct.status || 'Active',
        categoryId: selectedProduct.categoryId || selectedProduct.category?.id || '',
        familyId: selectedProduct.familyId || selectedProduct.family?.id || ''
      });
    }
  }, [selectedProduct, showEditModal]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct({
      ...newProduct,
      [name]: value
    });
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProduct({
      ...editedProduct,
      [name]: value
    });
  };
  
  const handleUpdateProduct = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      if (!selectedProduct) {
        throw new Error('No product selected');
      }
      
      // Make the API call to update the product
      await api.put(`/products/products/${user.companyId}/${selectedProduct.id}`, editedProduct);
      
      // Refresh the products list
      await fetchProducts();
      
      // Close the modal
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveProduct = async () => {
    try {
      setLoading(true);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Make the API call to save the product
      await api.post(`/products/products/${user.companyId}`, newProduct);
      
      // Refresh the products list
      await fetchProducts();
      
      // Close the modal
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
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };
  
  const handleShowImportModal = () => {
    setShowImportModal(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };
  
  const handleImportProducts = async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }
    
    try {
      setImportLoading(true);
      setError(null);
      
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', importFile);
      
      // Make the API call to import products
      const response = await api.post(`/products/import-export/${user.companyId}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Set import result
      setImportResult(response.data);
      
      // Refresh the products list if import was successful
      if (response.data.success) {
        await fetchProducts();
      }
    } catch (err: any) {
      console.error('Error importing products:', err);
      setError(err.message || 'Failed to import products');
    } finally {
      setImportLoading(false);
    }
  };
  
  const handleDownloadTemplate = async () => {
    try {
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Create a link to download the template
      const link = document.createElement('a');
      link.href = `/api/products/import-export/${user.companyId}/import-template`;
      link.download = 'import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      setError(err.message || 'Failed to download template');
    }
  };
  
  const handleExportProducts = async () => {
    try {
      // Get the user from localStorage to get the companyId
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      
      if (!user?.companyId) {
        throw new Error('Company ID not found');
      }
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (selectedFamily) params.append('familyId', selectedFamily);
      
      // Create a link to download the export
      const link = document.createElement('a');
      link.href = `/api/products/import-export/${user.companyId}/export?${params.toString()}`;
      link.download = 'products-export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error exporting products:', err);
      setError(err.message || 'Failed to export products');
    }
  };
  
  // Navigate to product detail view
  const handleViewProduct = (productId: string) => {
    navigate(`/products/view/${productId}`);
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
              <Dropdown.Item onClick={handleShowImportModal}>
                <FaFileImport className="me-2" />
                Import Products
              </Dropdown.Item>
              <Dropdown.Item onClick={handleExportProducts}>
                <FaFileExport className="me-2" />
                Export Products
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item 
                onClick={() => {
                  if (selectedProducts.length > 0) {
                    setShowBulkEditModal(true);
                  } else {
                    setError('Please select at least one product to edit');
                  }
                }}
              >
                Bulk Edit
              </Dropdown.Item>
              <Dropdown.Item 
                onClick={() => {
                  if (selectedProducts.length > 0) {
                    setShowBulkDeleteModal(true);
                  } else {
                    setError('Please select at least one product to delete');
                  }
                }}
                className="text-danger"
              >
                Bulk Delete
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

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
                <Button variant="outline-secondary" onClick={handleShowImportModal}>
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
                    <Form.Check 
                      type="checkbox" 
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
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
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <Form.Check 
                        type="checkbox" 
                        checked={selectedProducts.includes(product.id)}
                        onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                      />
                    </td>
                    <td>
                      {product.media && product.media.length > 0 ? (
                        <img 
                          src={product.media[0].url} 
                          alt={product.name} 
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div 
                          className="bg-light d-flex align-items-center justify-content-center"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <FaBox className="text-muted" />
                        </div>
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.sku || '-'}</td>
                    <td>{product.category ? product.category.name : '-'}</td>
                    <td>{product.family ? product.family.name : '-'}</td>
                    <td>
                      <Badge bg={
                        product.status === 'Active' ? 'success' : 
                        product.status === 'Inactive' ? 'warning' : 
                        'secondary'
                      }>
                        {product.status}
                      </Badge>
                    </td>
                    <td>
                      {product.completeness !== undefined ? (
                        <ProgressBar 
                          now={product.completeness} 
                          label={`${product.completeness}%`}
                          variant={
                            product.completeness < 30 ? 'danger' :
                            product.completeness < 70 ? 'warning' :
                            'success'
                          }
                        />
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View" 
                        onClick={() => handleViewProduct(product.id)}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowDeleteModal(true);
                        }}
                      >
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

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="name"
                      value={editedProduct.name}
                      onChange={handleEditInputChange}
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
                      value={editedProduct.sku}
                      onChange={handleEditInputChange}
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
                  value={editedProduct.description}
                  onChange={handleEditInputChange}
                />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select 
                      name="type"
                      value={editedProduct.type}
                      onChange={handleEditInputChange}
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
                      value={editedProduct.status}
                      onChange={handleEditInputChange}
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
                      value={editedProduct.categoryId}
                      onChange={handleEditInputChange}
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
                      value={editedProduct.familyId}
                      onChange={handleEditInputChange}
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
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateProduct}>
            <FaSave className="me-2" />
            Update Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Product Modal */}
      <Modal show={showDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <p>
              Are you sure you want to delete the product <strong>{selectedProduct.name}</strong>?
              This action cannot be undone.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={async () => {
              try {
                setLoading(true);
                
                // Get the user from localStorage to get the companyId
                const storedUser = localStorage.getItem('user');
                const user = storedUser ? JSON.parse(storedUser) : null;
                
                if (!user?.companyId || !selectedProduct) {
                  throw new Error('Missing required data');
                }
                
                // Make the API call to delete the product
                await api.delete(`/products/products/${user.companyId}/${selectedProduct.id}`);
                
                // Refresh the products list
                await fetchProducts();
                
                // Close the modal
                setShowDeleteModal(false);
              } catch (err: any) {
                console.error('Error deleting product:', err);
                setError(err.message || 'Failed to delete product');
              } finally {
                setLoading(false);
              }
            }}
          >
            <FaTrash className="me-2" />
            Delete Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Edit Modal */}
      <Modal show={showBulkEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Bulk Edit Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>You are editing {selectedProducts.length} products.</p>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select 
                name="status"
                value={editedProduct.status}
                onChange={handleEditInputChange}
              >
                <option value="">No Change</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Draft">Draft</option>
              </Form.Select>
              <Form.Text className="text-muted">
                Leave as "No Change" to keep the current status for each product.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select 
                name="categoryId"
                value={editedProduct.categoryId}
                onChange={handleEditInputChange}
              >
                <option value="">No Change</option>
                {categories.map((category: any) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Leave as "No Change" to keep the current category for each product.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Family</Form.Label>
              <Form.Select 
                name="familyId"
                value={editedProduct.familyId}
                onChange={handleEditInputChange}
              >
                <option value="">No Change</option>
                {families.map((family: any) => (
                  <option key={family.id} value={family.id}>{family.name}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Leave as "No Change" to keep the current family for each product.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={async () => {
              try {
                setLoading(true);
                
                // Get the user from localStorage to get the companyId
                const storedUser = localStorage.getItem('user');
                const user = storedUser ? JSON.parse(storedUser) : null;
                
                if (!user?.companyId) {
                  throw new Error('Company ID not found');
                }
                
                // Create update data object, only including fields that have values
                const updateData: any = {};
                if (editedProduct.status) updateData.status = editedProduct.status;
                if (editedProduct.categoryId) updateData.categoryId = editedProduct.categoryId;
                if (editedProduct.familyId) updateData.familyId = editedProduct.familyId;
                
                // Make the API call to bulk update products
                await api.post(`/products/products/${user.companyId}/bulk-edit`, {
                  ids: selectedProducts,
                  data: updateData
                });
                
                // Refresh the products list
                await fetchProducts();
                
                // Reset selected products
                setSelectedProducts([]);
                
                // Close the modal
                setShowBulkEditModal(false);
              } catch (err: any) {
                console.error('Error bulk editing products:', err);
                setError(err.message || 'Failed to bulk edit products');
              } finally {
                setLoading(false);
              }
            }}
          >
            <FaSave className="me-2" />
            Update Products
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal show={showBulkDeleteModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Bulk Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete <strong>{selectedProducts.length}</strong> products?
            This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={async () => {
              try {
                setLoading(true);
                
                // Get the user from localStorage to get the companyId
                const storedUser = localStorage.getItem('user');
                const user = storedUser ? JSON.parse(storedUser) : null;
                
                if (!user?.companyId) {
                  throw new Error('Company ID not found');
                }
                
                // Make the API call to bulk delete products
                await api.post(`/products/products/${user.companyId}/bulk-delete`, {
                  ids: selectedProducts
                });
                
                // Refresh the products list
                await fetchProducts();
                
                // Reset selected products
                setSelectedProducts([]);
                
                // Close the modal
                setShowBulkDeleteModal(false);
              } catch (err: any) {
                console.error('Error bulk deleting products:', err);
                setError(err.message || 'Failed to bulk delete products');
              } finally {
                setLoading(false);
              }
            }}
          >
            <FaTrash className="me-2" />
            Delete Products
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Import Products Modal */}
      <Modal show={showImportModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Import Products</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {importResult ? (
            <div>
              <Alert variant={importResult.success ? 'success' : 'danger'}>
                <Alert.Heading>{importResult.success ? 'Import Successful' : 'Import Failed'}</Alert.Heading>
                <p>
                  Processed: {importResult.processed} products<br />
                  Succeeded: {importResult.succeeded} products<br />
                  Failed: {importResult.failed} products
                </p>
              </Alert>
              
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-3">
                  <h6>Errors:</h6>
                  <ul className="text-danger">
                    {importResult.errors.map((error: any, index: number) => (
                      <li key={index}>
                        Row {error.row}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="d-flex justify-content-end mt-3">
                <Button variant="primary" onClick={handleCloseModal}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>CSV File</Form.Label>
                <Form.Control 
                  type="file" 
                  accept=".csv"
                  onChange={handleFileChange}
                  disabled={importLoading}
                />
                <Form.Text className="text-muted">
                  Upload a CSV file with product data. Make sure it follows the required format.
                </Form.Text>
              </Form.Group>
              
              <div className="d-flex justify-content-between mt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleDownloadTemplate}
                  disabled={importLoading}
                >
                  <FaDownload className="me-2" />
                  Download Template
                </Button>
                
                <Button 
                  variant="primary" 
                  onClick={handleImportProducts}
                  disabled={!importFile || importLoading}
                >
                  {importLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Importing...
                    </>
                  ) : (
                    <>
                      <FaFileImport className="me-2" />
                      Import Products
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Catalog;
