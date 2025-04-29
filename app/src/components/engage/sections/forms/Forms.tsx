import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FormsService, EngageTypes } from '../../../../services/engage';
import * as CategoriesService from '../../../../services/engage/categories';
import { FaClipboardList, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaShareAlt, FaPencilAlt, FaChartBar } from 'react-icons/fa';

// Import modal components
import AddFormModal from './AddFormModal';
import ViewFormModal from './ViewFormModal';
import EditFormModal from './EditFormModal';
import DeleteFormModal from './DeleteFormModal';

const Forms: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [categories, setCategories] = useState<EngageTypes.FormCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedForm, setSelectedForm] = useState<any | null>(null);
  
  // Fetch forms and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [formsData, categoriesResponse] = await Promise.all([
          FormsService.getAllForms(),
          CategoriesService.getCategories()
        ]);
        
        // Filter categories to only include form categories
        const formCategories = categoriesResponse.categories.filter(
          category => category.type === 'form'
        );
        
        setForms(formsData);
        setCategories(formCategories);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch forms');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // State for copied link
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New form state
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active',
    type: '',
    elements: []
  });

  // Edited form state
  const [editedForm, setEditedForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active',
    type: ''
  });

  const handleAddForm = () => {
    setNewForm({
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
    setSelectedForm(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewForm({
      ...newForm,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedForm({
      ...editedForm,
      [name]: value
    });
  };

  const handleSaveForm = async () => {
    try {
      setLoading(true);
      const savedForm = await FormsService.createForm(newForm);
      setForms([savedForm, ...forms]);
      setShowAddModal(false);
      // After saving, navigate to the form designer
      navigate(`/engage/forms/designer/${savedForm.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateForm = async () => {
    if (!selectedForm) return;
    
    try {
      setLoading(true);
      const updatedForm = await FormsService.updateForm(selectedForm.id, editedForm);
      
      // Update the forms array with the updated form
      setForms(forms.map(form => 
        form.id === updatedForm.id ? updatedForm : form
      ));
      
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update form');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteForm = async () => {
    if (!selectedForm) return;
    
    try {
      setLoading(true);
      await FormsService.deleteForm(selectedForm.id);
      
      // Remove the deleted form from the forms array
      setForms(forms.filter(form => form.id !== selectedForm.id));
      
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete form');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    // Copy the form link to clipboard
    const link = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLink(slug);
        setTimeout(() => setCopiedLink(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleViewForm = (form: any) => {
    setSelectedForm(form);
    setShowViewModal(true);
  };

  const handleEditForm = (form: any) => {
    setSelectedForm(form);
    setEditedForm({
      title: form.title,
      description: form.description || '',
      categoryId: form.category ? form.category.id : '',
      status: form.status === 'Draft' ? 'Inactive' : form.status, // Map 'Draft' to 'Inactive'
      type: form.type || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteFormModal = (form: any) => {
    setSelectedForm(form);
    setShowDeleteModal(true);
  };

  const handleDesignForm = (form: any) => {
    navigate(`/engage/forms/designer/${form.id}`);
  };

  const handleEditFromView = () => {
    if (selectedForm) {
      setShowViewModal(false);
      handleEditForm(selectedForm);
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
          <h1 className="h3 mb-0">Forms</h1>
          <p className="text-muted mb-0">Create and manage forms to collect information from your audience</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddForm}>
            <FaPlus className="me-2" />
            Create Form
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <FaFileImport className="me-2" />
                Import Forms
              </Dropdown.Item>
              <Dropdown.Item>
                <FaFileExport className="me-2" />
                Export Forms
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
                  placeholder="Search forms..."
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

      {/* Forms Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading forms...</p>
            </div>
          ) : forms.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardList size={48} className="text-muted mb-3" />
              <h4>No Forms Found</h4>
              <p className="text-muted">Get started by creating your first form.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddForm}>
                  <FaPlus className="me-2" />
                  Create Form
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Form Name
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
                      Submissions
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-clipboard-data fs-5 me-3 text-primary"></i>
                        <div>
                          <div className="fw-medium">{form.title}</div>
                          <div className="small text-muted">{form.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{form.category ? form.category.name : 'Uncategorized'}</td>
                    <td>{formatDate(form.createdAt)}</td>
                    <td>{formatDate(form.updatedAt)}</td>
                    <td>
                      <Badge bg={
                        form.status === 'Active' ? 'success' : 
                        form.status === 'Draft' ? 'secondary' : 
                        'warning'
                      }>
                        {form.status}
                      </Badge>
                    </td>
                    <td>{form.submissions}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Link"
                        onClick={() => handleCopyLink(form.slug)}
                      >
                        <FaShareAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        onClick={() => handleViewForm(form)}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => handleEditForm(form)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-primary" 
                        title="Design Form"
                        onClick={() => handleDesignForm(form)}
                      >
                        <FaPencilAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-success" 
                        title="Analytics"
                        onClick={() => navigate(`/engage/forms/analytics/${form.id}`)}
                      >
                        <FaChartBar />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDeleteFormModal(form)}
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
      <AddFormModal
        show={showAddModal}
        onHide={handleCloseModal}
        newForm={newForm}
        handleInputChange={handleInputChange}
        handleSaveForm={handleSaveForm}
        categories={categories}
      />

      <ViewFormModal
        show={showViewModal}
        onHide={handleCloseModal}
        form={selectedForm}
        copiedLink={copiedLink}
        handleCopyLink={handleCopyLink}
        handleEdit={handleEditFromView}
        formatDate={formatDate}
      />

      <EditFormModal
        show={showEditModal}
        onHide={handleCloseModal}
        form={selectedForm}
        editedForm={editedForm}
        handleInputChange={handleEditInputChange}
        handleUpdateForm={handleUpdateForm}
        categories={categories}
      />

      <DeleteFormModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        form={selectedForm}
        handleDeleteForm={handleDeleteForm}
      />
    </div>
  );
};

export default Forms;
