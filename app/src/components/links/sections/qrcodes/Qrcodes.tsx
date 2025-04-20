import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FaQrcode, FaFilter, FaSort, FaSearch, FaPlus, FaFileImport, FaFileExport, FaEdit, FaTrash, FaEye, FaCopy } from 'react-icons/fa';
import { LinksTypes } from '../../../../services/links';

// Import modal components
import AddQRCodeModal from './AddQRCodeModal';
import ViewQRCodeModal from './ViewQRCodeModal';
import EditQRCodeModal from './EditQRCodeModal';
import DeleteQRCodeModal from './DeleteQRCodeModal';
import QRCodeCustomizerModal from './QRCodeCustomizerModal';

// Import QR code service
import * as qrCodesService from '../../../../services/links/qrcodes';
import * as categoriesService from '../../../../services/links/categories';

const Qrcodes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCustomizerModal, setShowCustomizerModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState<LinksTypes.QRCode | null>(null);
  const [qrCodes, setQRCodes] = useState<LinksTypes.QRCode[]>([]);
  const [categories, setCategories] = useState<LinksTypes.Category[]>([]);
  const [newQRCode, setNewQRCode] = useState({
    title: '',
    content: 'https://example.com',
    contentType: 'url',
      config: {
        foreground: '#000000',
        background: '#FFFFFF',
        margin: 1,
        size: 200,
        errorCorrectionLevel: 'M',
        logo: null,
        logoSize: 0.2,
        body: 'square',
        eye: 'square',
        eyeBall: 'square',
        cornerSquareColor: '#000000',
        cornerDotColor: '#000000',
        gradient: false,
        gradientColors: ['#000000', '#000000'],
        gradientType: 'linear'
      },
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    categoryId: ''
  });
  const [editedQRCode, setEditedQRCode] = useState({
    title: '',
    content: '',
    contentType: '',
    config: {},
    status: 'Active' as LinksTypes.LinkStatus,
    expiresAt: '',
    categoryId: ''
  });
  const [copiedQRCode, setCopiedQRCode] = useState<string | null>(null);
  const qrCodeRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  // Fetch QR codes and categories on component mount
  useEffect(() => {
    fetchQRCodes();
    fetchCategories();
  }, []);

  // Render QR codes after the component updates with QR code data
  useEffect(() => {
    if (qrCodes.length > 0) {
      renderQRCodes();
    }
  }, [qrCodes]);

  // Function to render QR codes in the table
  const renderQRCodes = () => {
    qrCodes.forEach(qrCode => {
      const ref = qrCodeRefs.current[qrCode.id];
      if (ref) {
        // Clear previous QR code
        ref.innerHTML = '';
        
        try {
          // Create QR code options
          const content = qrCode.content || 'https://example.com';
          const config = qrCode.config || {};
          
          const qrCodeOptions: any = {
            width: 50,
            height: 50,
            type: 'svg',
            data: content,
            margin: config.margin || 1,
            qrOptions: {
              errorCorrectionLevel: config.errorCorrectionLevel || 'M'
            },
            dotsOptions: {
              type: config.body || 'square',
              color: config.foreground || '#000000'
            },
            backgroundOptions: {
              color: config.background || '#FFFFFF',
            },
            cornersSquareOptions: {
              type: config.eye || 'square',
              color: config.cornerSquareColor || config.foreground || '#000000'
            },
            cornersDotOptions: {
              type: config.eyeBall || 'square',
              color: config.cornerDotColor || config.foreground || '#000000'
            }
          };
          
          // Add gradient if enabled
          if (config.gradient && config.gradientColors && config.gradientColors.length >= 2) {
            qrCodeOptions.dotsOptions.gradient = {
              type: config.gradientType || 'linear',
              rotation: config.gradientType === 'linear' ? 0 : 0,
              colorStops: [
                { offset: 0, color: config.gradientColors[0] || '#000000' },
                { offset: 1, color: config.gradientColors[1] || '#000000' }
              ]
            };
          }
          
          // Add logo if provided
          if (config.logo) {
            qrCodeOptions.image = config.logo;
            qrCodeOptions.imageOptions = {
              hideBackgroundDots: true,
              imageSize: config.logo ? (config.logoSize || 0.2) : 0,
              margin: 0
            };
          }
          
          // Add border options if border width is greater than 0
          if (config.borderWidth && config.borderWidth > 0) {
            qrCodeOptions.borderOptions = {
              width: config.borderWidth,
              style: config.borderStyle || 'solid',
              color: config.borderColor || '#000000',
              radius: config.borderRadius || 0,
              margin: config.borderMargin || 10
            };
            
            // Add border gradient if enabled
            if (config.borderGradient && config.borderGradientColors && config.borderGradientColors.length >= 2) {
              qrCodeOptions.borderOptions.gradient = {
                type: config.borderGradientType || 'linear',
                rotation: config.borderGradientType === 'linear' ? 0 : 0,
                colorStops: [
                  { offset: 0, color: config.borderGradientColors[0] || '#000000' },
                  { offset: 1, color: config.borderGradientColors[1] || '#000000' }
                ]
              };
            }
          }
          
          // Create QR code
          const qrCodeInstance = new window.QRCodeStyling(qrCodeOptions);
          
          // Use border plugin if available
          if (window.QRBorderPlugin) {
            const borderPlugin = new window.QRBorderPlugin();
            qrCodeInstance.use(borderPlugin);
          }
          
          // Append to container
          qrCodeInstance.append(ref);
        } catch (error) {
          console.error('Error rendering QR code:', error);
        }
      }
    });
  };

  // Refetch QR codes when filters change
  useEffect(() => {
    fetchQRCodes();
  }, [searchTerm, selectedCategory, selectedStatus]);

  // Function to fetch QR codes using the service layer
  const fetchQRCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params: LinksTypes.LinkQueryParams = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus) params.status = selectedStatus as LinksTypes.LinkStatus;
      
      const response = await qrCodesService.getQRCodes(params);
      setQRCodes(response.qrCodes || []);
    } catch (err: any) {
      console.error('Error fetching QR codes:', err);
      setError(err.message || 'Failed to fetch QR codes');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch categories using the service layer
  const fetchCategories = async () => {
    try {
      const response = await categoriesService.getCategories();
      setCategories(response.categories || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };

  const handleAddQRCode = () => {
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowCustomizerModal(false);
    setSelectedQRCode(null);
    setEditedQRCode({
      title: '',
      content: '',
      contentType: '',
      config: {},
      status: 'Active',
      expiresAt: '',
      categoryId: ''
    });
    setCopiedQRCode(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewQRCode({
      ...newQRCode,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedQRCode({
      ...editedQRCode,
      [name]: value
    });
  };

  // Set up edited QR code when selectedQRCode changes
  useEffect(() => {
    if (selectedQRCode && showEditModal) {
      setEditedQRCode({
        title: selectedQRCode.title || '',
        content: selectedQRCode.content || '',
        contentType: selectedQRCode.contentType || '',
        config: selectedQRCode.config || {},
        status: selectedQRCode.status || 'Active',
        expiresAt: selectedQRCode.expiresAt ? new Date(selectedQRCode.expiresAt).toISOString().split('T')[0] : '',
        categoryId: selectedQRCode.categoryId || ''
      });
    }
  }, [selectedQRCode, showEditModal]);

  const handleSaveQRCode = async () => {
    try {
      setLoading(true);
      
      // Use the service layer to create the QR code
      await qrCodesService.createQRCode(newQRCode);
      
      // Refresh the QR codes list
      await fetchQRCodes();
      
      // Close the modal
      setShowAddModal(false);
      
      // Reset the form
      setNewQRCode({
        title: '',
        content: 'https://example.com',
        contentType: 'url',
        config: {
          foreground: '#000000',
          background: '#FFFFFF',
          margin: 1,
          size: 200,
          errorCorrectionLevel: 'M',
          logo: null,
          logoSize: 0.2,
          body: 'square',
          eye: 'square',
          eyeBall: 'square',
          cornerSquareColor: '#000000',
          cornerDotColor: '#000000',
          gradient: false,
          gradientColors: ['#000000', '#000000'],
          gradientType: 'linear'
        },
        status: 'Active',
        expiresAt: '',
        categoryId: ''
      });
    } catch (err: any) {
      console.error('Error saving QR code:', err);
      setError(err.message || 'Failed to save QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQRCode = async () => {
    try {
      setLoading(true);
      
      if (!selectedQRCode) {
        throw new Error('No QR code selected');
      }
      
      // Use the service layer to update the QR code
      await qrCodesService.updateQRCode(selectedQRCode.id, editedQRCode);
      
      // Refresh the QR codes list
      await fetchQRCodes();
      
      // Close the modal
      setShowEditModal(false);
    } catch (err: any) {
      console.error('Error updating QR code:', err);
      setError(err.message || 'Failed to update QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQRCode = async () => {
    try {
      setLoading(true);
      
      if (!selectedQRCode) {
        throw new Error('Missing required data');
      }
      
      // Use the service layer to delete the QR code
      await qrCodesService.deleteQRCode(selectedQRCode.id);
      
      // Refresh the QR codes list
      await fetchQRCodes();
      
      // Close the modal
      setShowDeleteModal(false);
    } catch (err: any) {
      console.error('Error deleting QR code:', err);
      setError(err.message || 'Failed to delete QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQRCode = (id: string) => {
    const qrCode = qrCodes.find(qr => qr.id === id);
    if (!qrCode) return;
    
    navigator.clipboard.writeText(qrCode.content)
      .then(() => {
        setCopiedQRCode(id);
        setTimeout(() => setCopiedQRCode(null), 2000);
      })
      .catch(err => {
        console.error('Failed to copy QR code content:', err);
      });
  };

  const handleShowCustomizer = (qrCode: LinksTypes.QRCode) => {
    setSelectedQRCode(qrCode);
    setShowCustomizerModal(true);
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
          <h1 className="h3 mb-0">QR Codes</h1>
          <p className="text-muted mb-0">Create and manage custom QR codes</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddQRCode}>
            <FaPlus className="me-2" />
            Create QR Code
          </Button>
          <Dropdown className="d-inline-block">
            <Dropdown.Toggle variant="outline-secondary" id="dropdown-actions">
              Actions
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => {}}>
                <FaFileImport className="me-2" />
                Import QR Codes
              </Dropdown.Item>
              <Dropdown.Item onClick={() => {}}>
                <FaFileExport className="me-2" />
                Export QR Codes
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
                  placeholder="Search QR codes..."
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

      {/* QR Codes Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary" />
              <p className="mt-3">Loading QR codes...</p>
            </div>
          ) : qrCodes.length === 0 ? (
            <div className="text-center py-5">
              <FaQrcode size={48} className="text-muted mb-3" />
              <h4>No QR Codes Found</h4>
              <p className="text-muted">Get started by creating your first QR code.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddQRCode}>
                  <FaPlus className="me-2" />
                  Create QR Code
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      QR Code
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
                      Type
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Content
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
                {qrCodes.map((qrCode) => (
                  <tr key={qrCode.id}>
                    <td>
                      <div 
                        ref={el => qrCodeRefs.current[qrCode.id] = el}
                        className="qr-code-preview" 
                        style={{ width: '50px', height: '50px' }}
                      ></div>
                    </td>
                    <td>{qrCode.title || 'Untitled'}</td>
                    <td>{qrCode.contentType}</td>
                    <td>
                      <span className="text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                        {qrCode.content}
                      </span>
                    </td>
                    <td>{qrCode.category ? qrCode.category.name : '-'}</td>
                    <td>{formatDate(qrCode.createdAt)}</td>
                    <td>
                      <Badge bg={
                        qrCode.status === 'Active' ? 'success' : 
                        qrCode.status === 'Inactive' ? 'warning' : 
                        'secondary'
                      }>
                        {qrCode.status}
                      </Badge>
                    </td>
                    <td>{qrCode.clicks || 0}</td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Copy Content" 
                        onClick={() => handleCopyQRCode(qrCode.id)}
                      >
                        <FaCopy className={copiedQRCode === qrCode.id ? 'text-success' : ''} />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Customize" 
                        onClick={() => handleShowCustomizer(qrCode)}
                      >
                        <FaQrcode />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View" 
                        onClick={() => {
                          setSelectedQRCode(qrCode);
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
                          setSelectedQRCode(qrCode);
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
                          setSelectedQRCode(qrCode);
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
      {showAddModal && (
        <AddQRCodeModal
          show={showAddModal}
          onHide={handleCloseModal}
          newQRCode={newQRCode}
          handleInputChange={handleInputChange}
          handleSaveQRCode={handleSaveQRCode}
          categories={categories}
        />
      )}

      {showViewModal && selectedQRCode && (
        <ViewQRCodeModal
          show={showViewModal}
          onHide={handleCloseModal}
          qrCode={selectedQRCode}
          copiedQRCode={copiedQRCode}
          handleCopyQRCode={handleCopyQRCode}
          handleEdit={handleEditFromView}
          formatDate={formatDate}
        />
      )}

      {showEditModal && selectedQRCode && (
        <EditQRCodeModal
          show={showEditModal}
          onHide={handleCloseModal}
          qrCode={selectedQRCode}
          editedQRCode={editedQRCode}
          handleInputChange={handleEditInputChange}
          handleUpdateQRCode={handleUpdateQRCode}
          categories={categories}
        />
      )}

      {showDeleteModal && selectedQRCode && (
        <DeleteQRCodeModal
          show={showDeleteModal}
          onHide={handleCloseModal}
          qrCode={selectedQRCode}
          handleDeleteQRCode={handleDeleteQRCode}
        />
      )}

      {showCustomizerModal && selectedQRCode && (
        <QRCodeCustomizerModal
          show={showCustomizerModal}
          onHide={handleCloseModal}
          qrCode={selectedQRCode}
          onSave={() => fetchQRCodes()} // Just refresh the QR codes list instead of using handleUpdateQRCode
        />
      )}
    </div>
  );
};

export default Qrcodes;
