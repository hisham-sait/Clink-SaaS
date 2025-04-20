import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { SurveysService, EngageTypes } from '../../../../services/engage';
import { FaClipboardList, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaShareAlt, FaPencilAlt } from 'react-icons/fa';

// Import modal components
import AddSurveyModal from './AddSurveyModal';
import ViewSurveyModal from './ViewSurveyModal';
import EditSurveyModal from './EditSurveyModal';
import DeleteSurveyModal from './DeleteSurveyModal';

const Survey: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [surveys, setSurveys] = useState<any[]>([]);
  const [categories, setCategories] = useState<EngageTypes.SurveyCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // New survey state
  const [newSurvey, setNewSurvey] = useState<EngageTypes.SurveyData>({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active',
    sections: []
  });

  // Edited survey state
  const [editedSurvey, setEditedSurvey] = useState<EngageTypes.SurveyData>({
    title: '',
    description: '',
    categoryId: '',
    status: 'Active'
  });
  
  // Fetch surveys and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [surveysData, categoriesData] = await Promise.all([
          SurveysService.getAllSurveys(),
          // Temporarily use mock categories until API endpoint is available
          // SurveysService.getSurveyCategories()
          Promise.resolve([
            { id: '1', name: 'Customer' },
            { id: '2', name: 'Events' },
            { id: '3', name: 'Website' },
            { id: '4', name: 'Products' },
            { id: '5', name: 'Internal' },
            { id: '6', name: 'Marketing' }
          ])
        ]);
        
        setSurveys(surveysData);
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch surveys');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddSurvey = () => {
    setNewSurvey({
      title: '',
      description: '',
      categoryId: '', // This will be cast to the expected type in the modal
      status: 'Active', // This will be cast to the expected type in the modal
      sections: []
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedSurvey(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewSurvey({
      ...newSurvey,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSurvey({
      ...editedSurvey,
      [name]: value
    });
  };

  const handleSaveSurvey = async () => {
    try {
      setLoading(true);
      const savedSurvey = await SurveysService.createSurvey(newSurvey);
      setSurveys([savedSurvey, ...surveys]);
      setShowAddModal(false);
      // After saving, navigate to the survey designer
      navigate(`/engage/survey/designer/${savedSurvey.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSurvey = async () => {
    if (!selectedSurvey) return;
    
    try {
      setLoading(true);
      const updatedSurvey = await SurveysService.updateSurvey(selectedSurvey.id, editedSurvey);
      
      // Update the surveys array with the updated survey
      setSurveys(surveys.map(survey => 
        survey.id === updatedSurvey.id ? updatedSurvey : survey
      ));
      
      setShowEditModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update survey');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSurvey = async () => {
    if (!selectedSurvey) return;
    
    try {
      setLoading(true);
      await SurveysService.deleteSurvey(selectedSurvey.id);
      
      // Remove the deleted survey from the surveys array
      setSurveys(surveys.filter(survey => survey.id !== selectedSurvey.id));
      
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(err.message || 'Failed to delete survey');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (slug: string) => {
    // Copy the survey link to clipboard
    const link = `${window.location.origin}/y/${slug}`;
    navigator.clipboard.writeText(link)
      .then(() => {
        setCopiedLink(slug);
        setTimeout(() => setCopiedLink(null), 3000);
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  const handleViewSurvey = (survey: any) => {
    setSelectedSurvey(survey);
    setShowViewModal(true);
  };

  const handleEditSurvey = (survey: any) => {
    setSelectedSurvey(survey);
    // Cast to the expected type for the EditSurveyModal component
    setEditedSurvey({
      title: survey.title,
      description: survey.description || '',
      categoryId: survey.category ? survey.category.id : '',
      status: survey.status
    } as any); // Use type assertion to avoid TypeScript errors
    setShowEditModal(true);
  };

  const handleDeleteSurveyModal = (survey: any) => {
    setSelectedSurvey(survey);
    setShowDeleteModal(true);
  };

  const handleDesignSurvey = (survey: any) => {
    navigate(`/engage/survey/designer/${survey.id}`);
  };

  const handleEditFromView = () => {
    if (selectedSurvey) {
      setShowViewModal(false);
      handleEditSurvey(selectedSurvey);
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
          <h1 className="h3 mb-0">Surveys</h1>
          <p className="text-muted mb-0">Design and distribute surveys to collect valuable feedback</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddSurvey}>
            <FaPlus className="me-2" />
            Create Survey
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <FaFileImport className="me-2" />
                Import Surveys
              </Dropdown.Item>
              <Dropdown.Item>
                <FaFileExport className="me-2" />
                Export Surveys
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
                  placeholder="Search surveys..."
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

      {/* Surveys Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="text-center py-5">
              <FaClipboardList size={48} className="text-muted mb-3" />
              <h4>No Surveys Found</h4>
              <p className="text-muted">Get started by creating your first survey.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddSurvey}>
                  <FaPlus className="me-2" />
                  Create Survey
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Survey Name
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
                      Responses
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map((survey) => (
                  <tr key={survey.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-clipboard-data fs-5 me-3 text-primary"></i>
                        <div>
                          <div className="fw-medium">{survey.title}</div>
                          <div className="small text-muted">{survey.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>{survey.category ? survey.category.name : 'Uncategorized'}</td>
                    <td>{formatDate(survey.createdAt)}</td>
                    <td>{formatDate(survey.updatedAt)}</td>
                    <td>
                      <Badge bg={
                        survey.status === 'Active' ? 'success' : 
                        survey.status === 'Draft' ? 'secondary' : 
                        'warning'
                      }>
                        {survey.status}
                      </Badge>
                    </td>
                    <td>{survey.responses}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Link"
                        onClick={() => handleCopyLink(survey.slug)}
                      >
                        <FaShareAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View"
                        onClick={() => handleViewSurvey(survey)}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => handleEditSurvey(survey)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-primary" 
                        title="Design Survey"
                        onClick={() => handleDesignSurvey(survey)}
                      >
                        <FaPencilAlt />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDeleteSurveyModal(survey)}
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
      <AddSurveyModal
        show={showAddModal}
        onHide={handleCloseModal}
        newSurvey={newSurvey as any} // Use type assertion to avoid TypeScript errors
        handleInputChange={handleInputChange}
        handleSaveSurvey={handleSaveSurvey}
        categories={categories}
      />

      <ViewSurveyModal
        show={showViewModal}
        onHide={handleCloseModal}
        survey={selectedSurvey}
        copiedLink={copiedLink}
        handleCopyLink={handleCopyLink}
        handleEdit={handleEditFromView}
        formatDate={formatDate}
      />

      <EditSurveyModal
        show={showEditModal}
        onHide={handleCloseModal}
        survey={selectedSurvey}
        editedSurvey={editedSurvey as any} // Use type assertion to avoid TypeScript errors
        handleInputChange={handleEditInputChange}
        handleUpdateSurvey={handleUpdateSurvey}
        categories={categories}
      />

      <DeleteSurveyModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        survey={selectedSurvey}
        handleDeleteSurvey={handleDeleteSurvey}
      />
    </div>
  );
};

export default Survey;
