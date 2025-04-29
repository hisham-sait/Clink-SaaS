import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FaLink, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaCopy, FaQrcode } from 'react-icons/fa';
import { ShortLinksService, CategoriesService, LinksTypes, buildShortLinkUrl, generateQRCodeUrl } from '../../../../services/links';
import { PagesService, FormsService } from '../../../../services/engage';

// Import modal components
import AddShortLinkModal from './AddShortLinkModal';
import ViewShortLinkModal from './ViewShortLinkModal';
import EditShortLinkModal from './EditShortLinkModal';
import DeleteShortLinkModal from './DeleteShortLinkModal';
import QRCodeModal from './QRCodeModal';

const Shortlinks: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedShortLink, setSelectedShortLink] = useState<LinksTypes.ShortLink | null>(null);
  const [shortLinks, setShortLinks] = useState<LinksTypes.ShortLink[]>([]);
  const [categories, setCategories] = useState<LinksTypes.Category[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [forms, setForms] = useState<any[]>([]);
  const [newShortLink, setNewShortLink] = useState({
    title: '',
    shortCode: '',
    originalUrl: '',
    linkType: 'url',
    pageId: '',
    formId: '',
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    password: '',
    categoryId: ''
  });
  const [editedShortLink, setEditedShortLink] = useState({
    title: '',
    shortCode: '',
    originalUrl: '',
    linkType: 'url',
    pageId: '',
    formId: '',
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    password: '',
    categoryId: ''
  });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Fetch shortlinks, categories, pages, and forms on component mount
  useEffect(() => {
    fetchShortLinks();
    fetchCategories();
    fetchPages();
    fetchForms();
  }, []);

  // Refetch shortlinks when filters change
  useEffect(() => {
    fetchShortLinks();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Function to fetch shortlinks using the service layer
  const fetchShortLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: LinksTypes.LinkQueryParams = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus as LinksTypes.LinkStatus;
      
      const response = await ShortLinksService.getShortLinks(params);
      setShortLinks(response.shortLinks || []);
    } catch (err: any) {
      console.error('Error fetching shortlinks:', err);
      setError(err.message || 'Failed to fetch shortlinks');
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

  // Function to fetch pages using the service layer
  const fetchPages = async () => {
    try {
      const pagesData = await PagesService.getAllPages();
      setPages(pagesData || []);
    } catch (err: any) {
      console.error('Error fetching pages:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  // Function to fetch forms using the service layer
  const fetchForms = async () => {
    try {
      const formsData = await FormsService.getAllForms();
      setForms(formsData || []);
    } catch (err: any) {
      console.error('Error fetching forms:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  const handleAddShortLink = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowQRCode(false);
    setSelectedShortLink(null);
    setEditedShortLink({
      title: '',
      shortCode: '',
      originalUrl: '',
      linkType: 'url',
      pageId: '',
      formId: '',
      status: 'Active' as LinksTypes.LinkStatus,
      expiresAt: '',
      password: '',
      categoryId: ''
    });
    setCopiedLink(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewShortLink({
      ...newShortLink,
      [name]: name === 'status' ? value as LinksTypes.LinkStatus : value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedShortLink({
      ...editedShortLink,
      [name]: name === 'status' ? value as LinksTypes.LinkStatus : value
    });
  };

  // Set up edited shortlink when selectedShortLink changes
  useEffect(() => {
    if (selectedShortLink && showEditModal) {
      // Determine link type and ID based on originalUrl
      let linkType = 'url';
      let pageId = '';
      let formId = '';
      const originalUrl = selectedShortLink.originalUrl || '';
      
      if (originalUrl.startsWith('/p/')) {
        linkType = 'page';
        const pageSlug = originalUrl.substring(3);
        const page = pages.find(p => p.slug === pageSlug);
        if (page) {
          pageId = page.id;
        }
      } else if (originalUrl.startsWith('/f/')) {
        linkType = 'form';
        const formSlug = originalUrl.substring(3);
        const form = forms.find(f => f.slug === formSlug);
        if (form) {
          formId = form.id;
        }
      }
      
      setEditedShortLink({
        title: selectedShortLink.title || '',
        shortCode: selectedShortLink.shortCode || '',
        originalUrl: originalUrl,
        linkType: linkType,
        pageId: pageId,
        formId: formId,
        status: selectedShortLink.status || 'Active' as LinksTypes.LinkStatus,
        expiresAt: selectedShortLink.expiresAt ? new Date(selectedShortLink.expiresAt).toISOString().split('T')[0] : '',
        password: selectedShortLink.password || '',
        categoryId: selectedShortLink.categoryId || ''
      });
    }
  }, [selectedShortLink, showEditModal, pages, forms]);

  const handleSaveShortLink = async () => {
    try {
      setLoading(true);
      
      // Prepare the payload based on the link type
      let originalUrl = newShortLink.originalUrl;
      
      if (newShortLink.linkType === 'page') {
        const selectedPage = pages.find(p => p.id === newShortLink.pageId);
        if (selectedPage) {
          originalUrl = `/p/${selectedPage.slug}`;
        }
      } else if (newShortLink.linkType === 'form') {
        const selectedForm = forms.find(f => f.id === newShortLink.formId);
        if (selectedForm) {
          originalUrl = `/f/${selectedForm.slug}`;
        }
      }
      
      // Use the service layer to create the shortlink
      await ShortLinksService.createShortLink({
        title: newShortLink.title,
        shortCode: newShortLink.shortCode,
        originalUrl,
        status: newShortLink.status,
        expiresAt: newShortLink.expiresAt,
        password: newShortLink.password,
        categoryId: newShortLink.categoryId
      });
      
      // Refresh the shortlinks list
      await fetchShortLinks();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewShortLink({
        title: '',
        shortCode: '',
        originalUrl: '',
        linkType: 'url',
        pageId: '',
        formId: '',
        status: 'Active' as LinksTypes.LinkStatus,
        expiresAt: '',
        password: '',
        categoryId: ''
      });
    } catch (err: any) {
      console.error('Error saving shortlink:', err);
      setError(err.message || 'Failed to save shortlink');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShortLink = async () => {
    try {
      setLoading(true);
      
      if (!selectedShortLink) {
        throw new Error('No shortlink selected');
      }
      
      // Prepare the payload based on the link type
      let originalUrl = editedShortLink.originalUrl;
      
      if (editedShortLink.linkType === 'page') {
        const selectedPage = pages.find(p => p.id === editedShortLink.pageId);
        if (selectedPage) {
          originalUrl = `/p/${selectedPage.slug}`;
        }
      } else if (editedShortLink.linkType === 'form') {
        const selectedForm = forms.find(f => f.id === editedShortLink.formId);
        if (selectedForm) {
          originalUrl = `/f/${selectedForm.slug}`;
        }
      }
      
      // Use the service layer to update the shortlink
      await ShortLinksService.updateShortLink(selectedShortLink.id, {
        title: editedShortLink.title,
        shortCode: editedShortLink.shortCode,
        originalUrl,
        status: editedShortLink.status,
        expiresAt: editedShortLink.expiresAt,
        password: editedShortLink.password,
        categoryId: editedShortLink.categoryId
      });
      
      // Refresh the shortlinks list
      await fetchShortLinks();
      
      // Close the modal
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error updating shortlink:', err);
      setError(err.message || 'Failed to update shortlink');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShortLink = async () => {
    try {
      setLoading(true);
      
      if (!selectedShortLink) {
        throw new Error('Missing required data');
      }
      
      // Use the service layer to delete the shortlink
      await ShortLinksService.deleteShortLink(selectedShortLink.id);
      
      // Refresh the shortlinks list
      await fetchShortLinks();
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Error deleting shortlink:', err);
      setError(err.message || 'Failed to delete shortlink');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (shortCode: string) => {
    const shortUrl = buildShortLinkUrl(shortCode);
    
    navigator.clipboard.writeText(shortUrl)
      .then(() => {
        setCopiedLink(shortCode);
        setTimeout(() => setCopiedLink(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleShowQRCode = (shortCode: string) => {
    const shortUrl = buildShortLinkUrl(shortCode);
    setQrCodeUrl(generateQRCodeUrl(shortUrl));
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

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Short Links</h1>
          <p className="text-muted mb-0">Manage your short URLs</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddShortLink}>
            <FaPlus className="me-2" />
            Create Short Link
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
                  placeholder="Search short links..."
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

      {/* ShortLinks Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading short links...</p>
            </div>
          ) : shortLinks.length === 0 ? (
            <div className="text-center py-5">
              <FaLink size={48} className="text-muted mb-3" />
              <h4>No Short Links Found</h4>
              <p className="text-muted">Get started by creating your first short link.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddShortLink}>
                  <FaPlus className="me-2" />
                  Create Short Link
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Short Code
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
                      Original URL
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
                      Expires
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
                {shortLinks.map((shortLink) => (
                  <tr key={shortLink.id}>
                    <td>
                      <span className="text-primary">{shortLink.shortCode}</span>
                    </td>
                    <td>{shortLink.title || 'Untitled'}</td>
                    <td>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {shortLink.originalUrl}
                      </span>
                    </td>
                    <td>{shortLink.category ? shortLink.category.name : '-'}</td>
                    <td>{formatDate(shortLink.createdAt)}</td>
                    <td>{formatDate(shortLink.expiresAt)}</td>
                    <td>
                      <Badge bg={
                        shortLink.status === 'Active' ? 'success' : 
                        shortLink.status === 'Inactive' ? 'warning' : 
                        'secondary'
                      }>
                        {shortLink.status}
                      </Badge>
                      {shortLink.password && (
                        <Badge bg="info" className="ms-1">
                          Password
                        </Badge>
                      )}
                    </td>
                    <td>{shortLink.clicks || 0}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Link" 
                        onClick={() => handleCopyLink(shortLink.shortCode)}
                      >
                        <FaCopy className={copiedLink === shortLink.shortCode ? 'text-success' : ''} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="QR Code" 
                        onClick={() => handleShowQRCode(shortLink.shortCode)}
                      >
                        <FaQrcode />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View" 
                        onClick={() => {
                          setSelectedShortLink(shortLink);
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
                          setSelectedShortLink(shortLink);
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
                          setSelectedShortLink(shortLink);
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
      <AddShortLinkModal
        show={showAddModal}
        onHide={handleCloseModal}
        newShortLink={newShortLink}
        handleInputChange={handleInputChange}
        handleSaveShortLink={handleSaveShortLink}
        categories={categories}
        pages={pages}
        forms={forms}
      />

      <ViewShortLinkModal
        show={showViewModal}
        onHide={handleCloseModal}
        shortLink={selectedShortLink}
        copiedLink={copiedLink}
        handleCopyLink={handleCopyLink}
        handleEdit={handleEditFromView}
        formatDate={formatDate}
      />

      <EditShortLinkModal
        show={showEditModal}
        onHide={handleCloseModal}
        shortLink={selectedShortLink}
        editedShortLink={editedShortLink}
        handleInputChange={handleEditInputChange}
        handleUpdateShortLink={handleUpdateShortLink}
        categories={categories}
        pages={pages}
        forms={forms}
      />

      <DeleteShortLinkModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        shortLink={selectedShortLink}
        handleDeleteShortLink={handleDeleteShortLink}
      />

      <QRCodeModal
        show={showQRCode}
        onHide={handleCloseModal}
        qrCodeUrl={qrCodeUrl}
        shortCode={selectedShortLink?.shortCode || ''}
      />
    </div>
  );
};

export default Shortlinks;
