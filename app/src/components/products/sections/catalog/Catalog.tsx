import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Modal, Alert, ProgressBar } from 'react-bootstrap';
import { FaBox, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaSave, FaEdit, FaTrash, FaEye, FaDownload } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { ProductsService, CategoriesService, FamiliesService, ImportExportService } from '../../../../services/products';
import { ProductType, ProductStatus } from '../../../../services/products/types';

// Import modal components
import AddProductModal from './AddProductModal';
import EditProductModal from './EditProductModal';
import DeleteProductModal from './DeleteProductModal';
import BulkEditModal from './BulkEditModal';
import BulkDeleteModal from './BulkDeleteModal';
import ImportProductsModal from './ImportProductsModal';

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
    categoryId: null,
    familyId: null
  });
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [families, setFamilies] = useState<any[]>([]);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [newProduct, setNewProduct] = useState<{
    name: string;
    sku: string;
    description: string;
    type: ProductType;
    status: ProductStatus;
    categoryId: string | null;
    familyId: string | null;
  }>({
    name: '',
    sku: '',
    description: '',
    type: 'PHYSICAL',
    status: 'Active',
    categoryId: null,
    familyId: null
  });
  
  // Fetch products, categories, and families on component mount
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchFamilies();
  }, []);
  
  // Function to fetch products using the service layer
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedFamily) params.familyId = selectedFamily;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await ProductsService.getProducts(params);
      setProducts(response.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to fetch categories using the service layer
  const fetchCategories = async () => {
    try {
      const response = await CategoriesService.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };
  
  // Function to fetch families using the service layer
  const fetchFamilies = async () => {
    try {
      const response = await FamiliesService.getFamilies();
      // The API returns the families array directly, not wrapped in a families property
      setFamilies(Array.isArray(response) ? response : response.families || []);
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
      categoryId: null,
      familyId: null
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
      const categoryId = selectedProduct.categoryId || selectedProduct.category?.id || null;
      const familyId = selectedProduct.familyId || selectedProduct.family?.id || null;
      
      setEditedProduct({
        name: selectedProduct.name || '',
        sku: selectedProduct.sku || '',
        description: selectedProduct.description || '',
        type: selectedProduct.type || 'PHYSICAL',
        status: selectedProduct.status || 'Active',
        categoryId,
        familyId
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
      
      if (!selectedProduct) {
        throw new Error('No product selected');
      }
      
      // Create a copy of the product data for submission
      const productToUpdate = { ...editedProduct };
      
      // Handle empty categoryId and familyId to prevent foreign key constraint violations
      if (!productToUpdate.categoryId || productToUpdate.categoryId.trim() === '') {
        productToUpdate.categoryId = null;
      }
      
      if (!productToUpdate.familyId || productToUpdate.familyId.trim() === '') {
        productToUpdate.familyId = null;
      }
      
      // Use the service layer to update the product
      await ProductsService.updateProduct(selectedProduct.id, productToUpdate);
      
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
      
      // Create a copy of the product data for submission
      const productToSubmit = { ...newProduct };
      
      // Generate SKU if empty
      if (!productToSubmit.sku.trim()) {
        // Create a normalized version of the product name (uppercase, no spaces, alphanumeric only)
        const normalizedName = productToSubmit.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 8); // Limit to 8 chars
        
        // Add a prefix based on product type
        const typePrefix = productToSubmit.type.charAt(0); // First letter of type (P, D, or S)
        
        // Add a unique timestamp suffix (last 4 digits)
        const timestamp = Date.now().toString().slice(-4);
        
        // Combine to create the SKU
        productToSubmit.sku = `${typePrefix}-${normalizedName}-${timestamp}`;
      }
      
      // Handle empty categoryId and familyId to prevent foreign key constraint violations
      if (!productToSubmit.categoryId || productToSubmit.categoryId.trim() === '') {
        productToSubmit.categoryId = null;
      }
      
      if (!productToSubmit.familyId || productToSubmit.familyId.trim() === '') {
        productToSubmit.familyId = null;
      }
      
      // Use the service layer to create the product
      await ProductsService.createProduct(productToSubmit);
      
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
        categoryId: null,  // Use null for the initial state
        familyId: null     // Use null for the initial state
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
      
      // Use the service layer to import products
      const response = await ImportExportService.importProducts(importFile);
      
      // Set import result
      setImportResult(response);
      
      // Refresh the products list if import was successful
      if (response.success) {
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
      // Use the service layer to download the template
      const templateBlob = await ImportExportService.downloadImportTemplate();
      
      // Create a URL for the blob
      const url = URL.createObjectURL(templateBlob);
      
      // Create a link to download the template
      const link = document.createElement('a');
      link.href = url;
      link.download = 'import-template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading template:', err);
      setError(err.message || 'Failed to download template');
    }
  };
  
  const handleExportProducts = async () => {
    try {
      // Build query parameters
      const params: any = {};
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedFamily) params.familyId = selectedFamily;
      
      // Use the service layer to export products
      const exportBlob = await ImportExportService.exportProducts(params);
      
      // Create a URL for the blob
      const url = URL.createObjectURL(exportBlob);
      
      // Create a link to download the export
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products-export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the URL
      URL.revokeObjectURL(url);
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

      {/* Modals */}
      <AddProductModal
        show={showAddModal}
        onHide={handleCloseModal}
        newProduct={newProduct}
        categories={categories}
        families={families}
        handleInputChange={handleInputChange}
        handleSaveProduct={handleSaveProduct}
      />
      
      <EditProductModal
        show={showEditModal}
        onHide={handleCloseModal}
        selectedProduct={selectedProduct}
        editedProduct={editedProduct}
        categories={categories}
        families={families}
        handleInputChange={handleEditInputChange}
        handleUpdateProduct={handleUpdateProduct}
      />
      
      <DeleteProductModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        selectedProduct={selectedProduct}
        handleConfirmDelete={async () => {
          try {
            setLoading(true);
            
            if (!selectedProduct) {
              throw new Error('No product selected');
            }
            
            // Use the service layer to delete the product
            await ProductsService.deleteProduct(selectedProduct.id);
            
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
      />
      
      <BulkEditModal
        show={showBulkEditModal}
        onHide={handleCloseModal}
        selectedProducts={selectedProducts}
        editedProduct={editedProduct}
        categories={categories}
        families={families}
        handleInputChange={handleEditInputChange}
        handleBulkUpdate={async () => {
          try {
            setLoading(true);
            
            // Create update data object, only including fields that have values
            const updateData: any = {};
            if (editedProduct.status) updateData.status = editedProduct.status;
            
            // Handle categoryId - explicitly set to null if empty string
            if (editedProduct.categoryId !== undefined) {
              updateData.categoryId = (!editedProduct.categoryId || editedProduct.categoryId.trim() === '') 
                ? null 
                : editedProduct.categoryId;
            }
            
            // Handle familyId - explicitly set to null if empty string
            if (editedProduct.familyId !== undefined) {
              updateData.familyId = (!editedProduct.familyId || editedProduct.familyId.trim() === '') 
                ? null 
                : editedProduct.familyId;
            }
            
            // Use the service layer to bulk edit products
            await ProductsService.bulkEditProducts(selectedProducts, updateData);
            
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
      />
      
      <BulkDeleteModal
        show={showBulkDeleteModal}
        onHide={handleCloseModal}
        selectedProducts={selectedProducts}
        handleBulkDelete={async () => {
          try {
            setLoading(true);
            
            // Use the service layer to bulk delete products
            await ProductsService.bulkDeleteProducts(selectedProducts);
            
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
      />
      
      <ImportProductsModal
        show={showImportModal}
        onHide={handleCloseModal}
        importFile={importFile}
        importLoading={importLoading}
        importResult={importResult}
        handleFileChange={handleFileChange}
        handleImportProducts={handleImportProducts}
        handleDownloadTemplate={handleDownloadTemplate}
      />
    </div>
  );
};

export default Catalog;
