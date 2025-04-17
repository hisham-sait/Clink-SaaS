import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FaQrcode, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaCopy } from 'react-icons/fa';
import { DigitalLinksService, CategoriesService, LinksTypes } from '../../../../services/links';
import { ProductsService, ProductsTypes } from '../../../../services/products';

// Import modal components
import AddDigitalLinkModal from './AddDigitalLinkModal';
import ViewDigitalLinkModal from './ViewDigitalLinkModal';
import EditDigitalLinkModal from './EditDigitalLinkModal';
import DeleteDigitalLinkModal from './DeleteDigitalLinkModal';
import QRCodeModal from './QRCodeModal';

const Digitallinks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDigitalLink, setSelectedDigitalLink] = useState<LinksTypes.DigitalLink | null>(null);
  const [digitalLinks, setDigitalLinks] = useState<LinksTypes.DigitalLink[]>([]);
  const [categories, setCategories] = useState<LinksTypes.Category[]>([]);
  const [products, setProducts] = useState<ProductsTypes.Product[]>([]);
  const [newDigitalLink, setNewDigitalLink] = useState({
    title: '',
    type: 'ProductInfo' as LinksTypes.DigitalLinkType,
    gs1Key: '',
    gs1KeyType: 'GTIN',
    redirectType: 'standard',
    customUrl: '',
    productId: '',
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    password: '',
    categoryId: ''
  });
  const [editedDigitalLink, setEditedDigitalLink] = useState({
    title: '',
    type: 'ProductInfo' as LinksTypes.DigitalLinkType,
    gs1Key: '',
    gs1KeyType: '',
    redirectType: 'standard' as 'standard' | 'custom',
    customUrl: '',
    productId: '',
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    password: '',
    categoryId: ''
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Map GS1 key types to their corresponding application identifiers
  const gs1KeyTypeToAI: Record<string, string> = {
    'GTIN': '01',
    'GLN': '414',
    'SSCC': '00',
    'GRAI': '8003',
    'GIAI': '8004',
    'GSRN': '8018',
    'GDTI': '253',
    'GINC': '401',
    'GSIN': '402'
  };

  // Fetch digitallinks, categories, and products on component mount
  useEffect(() => {
    fetchDigitalLinks();
    fetchCategories();
    fetchProducts();
  }, []);

  // Refetch digitallinks when filters change
  useEffect(() => {
    fetchDigitalLinks();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Function to fetch digitallinks using the service layer
  const fetchDigitalLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: LinksTypes.LinkQueryParams = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus as LinksTypes.LinkStatus;
      
      const response = await DigitalLinksService.getDigitalLinks(params);
      setDigitalLinks(response.digitalLinks || []);
    } catch (err: any) {
      console.error('Error fetching digital links:', err);
      setError(err.message || 'Failed to fetch digital links');
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

  // Function to fetch products using the service layer
  const fetchProducts = async () => {
    try {
      const response = await ProductsService.getProducts();
      setProducts(response.products || []);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  const handleAddDigitalLink = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowQRCode(false);
    setSelectedDigitalLink(null);
    setEditedDigitalLink({
      title: '',
      type: 'ProductInfo',
      gs1Key: '',
      gs1KeyType: '',
      redirectType: 'standard',
      customUrl: '',
      productId: '',
      status: 'Active',
      expiresAt: '',
      password: '',
      categoryId: ''
    });
    setCopiedLink(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDigitalLink({
      ...newDigitalLink,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedDigitalLink({
      ...editedDigitalLink,
      [name]: value
    });
  };

  // Set up edited digitallink when selectedDigitalLink changes
  useEffect(() => {
    if (selectedDigitalLink && showEditModal) {
      setEditedDigitalLink({
        title: selectedDigitalLink.title || '',
        type: selectedDigitalLink.type || 'ProductInfo',
        gs1Key: selectedDigitalLink.gs1Key || '',
        gs1KeyType: selectedDigitalLink.gs1KeyType || '',
        redirectType: selectedDigitalLink.redirectType || 'standard',
        customUrl: selectedDigitalLink.customUrl || '',
        productId: selectedDigitalLink.productId || '',
        status: selectedDigitalLink.status || 'Active',
        expiresAt: selectedDigitalLink.expiresAt ? new Date(selectedDigitalLink.expiresAt).toISOString().split('T')[0] : '',
        password: selectedDigitalLink.password || '',
        categoryId: selectedDigitalLink.categoryId || ''
      });
    }
  }, [selectedDigitalLink, showEditModal]);

  const handleSaveDigitalLink = async () => {
    try {
      setLoading(true);
      
      // Use the service layer to create the digitallink
      await DigitalLinksService.createDigitalLink(newDigitalLink);
      
      // Refresh the digitallinks list
      await fetchDigitalLinks();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewDigitalLink({
        title: '',
        type: 'ProductInfo' as LinksTypes.DigitalLinkType,
        gs1Key: '',
        gs1KeyType: 'GTIN',
        redirectType: 'standard',
        customUrl: '',
        productId: '',
        status: 'Active' as LinksTypes.LinkStatus,
        expiresAt: '',
        password: '',
        categoryId: ''
      });
    } catch (err: any) {
      console.error('Error saving digital link:', err);
      setError(err.message || 'Failed to save digital link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDigitalLink = async () => {
    try {
      setLoading(true);
      
      if (!selectedDigitalLink) {
        throw new Error('No digital link selected');
      }
      
      // Use the service layer to update the digitallink
      await DigitalLinksService.updateDigitalLink(selectedDigitalLink.id, editedDigitalLink);
      
      // Refresh the digitallinks list
      await fetchDigitalLinks();
      
      // Close the modal
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error updating digital link:', err);
      setError(err.message || 'Failed to update digital link');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDigitalLink = async () => {
    try {
      setLoading(true);
      
      if (!selectedDigitalLink) {
        throw new Error('Missing required data');
      }
      
      // Use the service layer to delete the digitallink
      await DigitalLinksService.deleteDigitalLink(selectedDigitalLink.id);
      
      // Refresh the digitallinks list
      await fetchDigitalLinks();
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Error deleting digital link:', err);
      setError(err.message || 'Failed to delete digital link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (gs1Key: string, gs1KeyType: string) => {
    const baseUrl = window.location.origin;
    
    // Get the application identifier for the given key type
    const ai = gs1KeyTypeToAI[gs1KeyType] || gs1KeyType;
    
    // Format the GS1 URL
    const gs1Url = `${ai}/${gs1Key}`;
    const digitalUrl = `${baseUrl}/d/${gs1Url}`;
    
    navigator.clipboard.writeText(digitalUrl)
      .then(() => {
        setCopiedLink(gs1Key);
        setTimeout(() => setCopiedLink(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleShowQRCode = (gs1Url: string, gs1Key: string) => {
    const baseUrl = window.location.origin;
    const digitalUrl = `${baseUrl}/d/${gs1Url}`;
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(digitalUrl)}`);
    setShowQRCode(true);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const handleEditFromView = () => {
    setShowViewModal(false);
    setShowEditModal(true);
  };

  // Helper function to get product name by ID
  const getProductName = (productId: string | null | undefined): string => {
    if (!productId) return '-';
    const product = products.find(p => p.id === productId);
    return product ? product.name : '-';
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Digital Links</h1>
          <p className="text-muted mb-0">Manage your GS1 Digital Links</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddDigitalLink}>
            <FaPlus className="me-2" />
            Create Digital Link
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {}}>
                <FaFileImport className="me-2" />
                Import Links
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {}}>
                <FaFileExport className="me-2" />
                Export Links
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
                  placeholder="Search digital links..."
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
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
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
                    <option value="Expired">Expired</option>
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

      {/* DigitalLinks Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading digital links...</p>
            </div>
          ) : digitalLinks.length === 0 ? (
            <div className="text-center py-5">
              <FaQrcode size={48} className="text-muted mb-3" />
              <h4>No Digital Links Found</h4>
              <p className="text-muted">Get started by creating your first digital link.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddDigitalLink}>
                  <FaPlus className="me-2" />
                  Create Digital Link
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Type
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      GS1 Key
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Title
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Product
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
                      Created
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
                      Clicks
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {digitalLinks.map((digitalLink) => (
                  <tr key={digitalLink.id}>
                    <td>{digitalLink.type}</td>
                    <td>
                      <span className="text-primary">{digitalLink.gs1Key}</span>
                      <small className="text-muted d-block">{digitalLink.gs1KeyType}</small>
                    </td>
                    <td>{digitalLink.title || 'Untitled'}</td>
                    <td>{getProductName(digitalLink.productId)}</td>
                    <td>{digitalLink.category ? digitalLink.category.name : '-'}</td>
                    <td>{formatDate(digitalLink.createdAt)}</td>
                    <td>
                      <Badge bg={
                        digitalLink.status === 'Active' ? 'success' : 
                        digitalLink.status === 'Inactive' ? 'warning' : 
                        'secondary'
                      }>
                        {digitalLink.status}
                      </Badge>
                      {digitalLink.password && (
                        <Badge bg="info" className="ms-1">
                          Password
                        </Badge>
                      )}
                    </td>
                    <td>{digitalLink.clicks || 0}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Link" 
                        onClick={() => handleCopyLink(digitalLink.gs1Key, digitalLink.gs1KeyType)}
                      >
                        <FaCopy className={copiedLink === digitalLink.gs1Key ? 'text-success' : ''} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="QR Code" 
                        onClick={() => handleShowQRCode(digitalLink.gs1Url || '', digitalLink.gs1Key)}
                      >
                        <FaQrcode />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View" 
                        onClick={() => {
                          setSelectedDigitalLink(digitalLink);
                          setShowViewModal(true);
                        }}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => {
                          setSelectedDigitalLink(digitalLink);
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
                          setSelectedDigitalLink(digitalLink);
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
      <AddDigitalLinkModal
        show={showAddModal}
        onHide={handleCloseModal}
        newDigitalLink={newDigitalLink}
        handleInputChange={handleInputChange}
        handleSaveDigitalLink={handleSaveDigitalLink}
        categories={categories}
        products={products}
      />

      <ViewDigitalLinkModal
        show={showViewModal}
        onHide={handleCloseModal}
        digitalLink={selectedDigitalLink}
        copiedLink={copiedLink}
        handleCopyLink={handleCopyLink}
        handleEdit={handleEditFromView}
        formatDate={formatDate}
      />

      <EditDigitalLinkModal
        show={showEditModal}
        onHide={handleCloseModal}
        digitalLink={selectedDigitalLink}
        editedDigitalLink={editedDigitalLink}
        handleInputChange={handleEditInputChange}
        handleUpdateDigitalLink={handleUpdateDigitalLink}
        categories={categories}
        products={products}
      />

      <DeleteDigitalLinkModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        digitalLink={selectedDigitalLink}
        handleDeleteDigitalLink={handleDeleteDigitalLink}
      />

      <QRCodeModal
        show={showQRCode}
        onHide={handleCloseModal}
        qrCodeUrl={qrCodeUrl}
        gs1Key={selectedDigitalLink?.gs1Key || ''}
      />
    </div>
  );
};

export default Digitallinks;
