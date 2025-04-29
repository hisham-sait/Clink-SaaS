import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { PagesService, EngageTypes } from '../../../../services/engage';
import * as CategoriesService from '../../../../services/engage/categories';
import { FaClipboardList, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaShareAlt, FaPencilAlt, FaChartBar } from 'react-icons/fa';

// Import modal components
import AddPageModal from './AddPageModal';
import ViewPageModal from './ViewPageModal';
import EditPageModal from './EditPageModal';
import DeletePageModal from './DeletePageModal';

const Pages: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [categories, setCategories] = useState<EngageTypes.FormCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState<any | null>(null);
  
  // Fetch pages and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get categories first
        const categoriesResponse = await CategoriesService.getCategories();
        
        // Filter categories to only include page categories
        const pageCategories = categoriesResponse.categories.filter(
          category => category.type === 'page'
        ) || [];
        
        setCategories(pageCategories);
        
        // Then get pages
        try {
          const pagesData = await PagesService.getAllPages();
          setPages(pagesData || []);
        } catch (pageErr: any) {
          console.warn('Error fetching pages:', pageErr);
          setPages([]);
          // Don't set the error state here, just log it
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // State for copied link
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New page state
  const [newPage, setNewPage] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active',
    type: '',
    elements: []
  });

  // Edited page state
  const [editedPage, setEditedPage] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active',
    type: ''
  });

  const handleAddPage = () => {
    setNewPage({
      title: '',
      description: '',
      categoryId: '',
      status: 'Active',
      type: '',
      elements: []
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedPage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPage({
      ...newPage,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedPage({
      ...editedPage,
      [name]: value
    });
  };

  const handleSavePage = async () => {
    try {
      setLoading(true);
      const savedPage = await PagesService.createPage(newPage);
      setPages([savedPage, ...pages]);
      setShowAddModal(false);
      // After saving, navigate to the page designer
      navigate(`/engage/pages/designer/${savedPage.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create page');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePage = async () => {
    if (!selectedPage) return;
    
    try {
      setLoading(true);
      const updatedPage = await PagesService.updatePage(selectedPage.id, editedPage);
      
      // Update the pages array with the updated page
      setPages(pages.map(page => 
        page.id === updatedPage.id ? updatedPage : page
      ));
      
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update page');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;
    
    try {
      setLoading(true);
      await PagesService.deletePage(selectedPage.id);
      
      // Remove the deleted page from the pages array
      setPages(pages.filter(page => page.id !== selectedPage.id));
      
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete page');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    // Copy the page link to clipboard
    const link = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLink(slug);
        setTimeout(() => setCopiedLink(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleViewPage = (page: any) => {
    setSelectedPage(page);
    setShowViewModal(true);
  };

  const handleEditPage = (page: any) => {
    setSelectedPage(page);
    setEditedPage({
      title: page.title,
      description: page.description || '',
      categoryId: page.categoryId || '',
      status: page.status === 'Draft' ? 'Inactive' : page.status, // Map 'Draft' to 'Inactive'
      type: page.type || ''
    });
    setShowEditModal(true);
  };

  const handleDeletePageModal = (page: any) => {
    setSelectedPage(page);
    setShowDeleteModal(true);
  };

  const handleDesignPage = (page: any) => {
    navigate(`/engage/pages/designer/${page.id}`);
  };

  const handleEditFromView = () => {
    if (selectedPage) {
      setShowViewModal(false);
      handleEditPage(selectedPage);
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
          <h1 className="h3 mb-0">Pages</h1>
          <p className="text-muted mb-0">Create and manage pages to display information to your audience</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddPage}>
            <FaPlus className="me-2" />
            Create Page
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <FaFileImport className="me-2" />
                Import Pages
              </Dropdown.Item>
              <Dropdown.Item>
                <FaFileExport className="me-2" />
                Export Pages
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
                  placeholder="Search pages..."
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
                    <option value="Draft">Draft</option>
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

      {/* Pages Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardList size={48} className="text-muted mb-3" />
              <h4>No Pages Found</h4>
              <p className="text-muted">Get started by creating your first page.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddPage}>
                  <FaPlus className="me-2" />
                  Create Page
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Page Name
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
                      Last Modified
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
                      Views
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-text fs-5 me-3 text-primary"></i>
                        <div>
                          <div className="fw-medium">{page.title}</div>
                          <div className="small text-muted">{page.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {page.categoryId ? 
                        categories.find(cat => cat.id === page.categoryId)?.name || 'Categorized' 
                        : 'Uncategorized'}
                    </td>
                    <td>{formatDate(page.createdAt)}</td>
                    <td>{formatDate(page.updatedAt)}</td>
                    <td>
                      <Badge bg={
                        page.status === 'Active' ? 'success' : 
                        page.status === 'Draft' ? 'secondary' : 
                        'warning'
                      }>
                        {page.status}
                      </Badge>
                    </td>
                    <td>{page.submissions}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Link"
                        onClick={() => handleCopyLink(page.slug)}
                      >
                        <FaShareAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        onClick={() => handleViewPage(page)}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => handleEditPage(page)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-primary" 
                        title="Design Page"
                        onClick={() => handleDesignPage(page)}
                      >
                        <FaPencilAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-success" 
                        title="Analytics"
                        onClick={() => navigate(`/engage/pages/analytics/${page.id}`)}
                      >
                        <FaChartBar />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDeletePageModal(page)}
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
      <AddPageModal
        show={showAddModal}
        onHide={handleCloseModal}
        newPage={newPage}
        handleInputChange={handleInputChange}
        handleSavePage={handleSavePage}
        categories={categories}
      />

      <ViewPageModal
        show={showViewModal}
        onHide={handleCloseModal}
        page={selectedPage}
        copiedLink={copiedLink}
        handleCopyLink={handleCopyLink}
        handleEdit={handleEditFromView}
        formatDate={formatDate}
      />

      <EditPageModal
        show={showEditModal}
        onHide={handleCloseModal}
        page={selectedPage}
        editedPage={editedPage}
        handleInputChange={handleEditInputChange}
        handleUpdatePage={handleUpdatePage}
        categories={categories}
      />

      <DeletePageModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        page={selectedPage}
        handleDeletePage={handleDeletePage}
      />
    </div>
  );
};

export default Pages;
