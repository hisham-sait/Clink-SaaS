import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Badge, Row, Col, Form, InputGroup, Dropdown, Alert, Spinner } from 'react-bootstrap';
import { FaChartBar, FaFilter, FaSort, FaSearch, FaPlus, FaEdit, FaTrash, FaEye, FaExternalLinkAlt, FaSync } from 'react-icons/fa';
import { toast } from 'react-toastify';
import InsightsService, { InsightReport } from '../../../../services/insights';

// Import modal components
import AddReportModal from './AddReportModal';
import ViewReportModal from './ViewReportModal';
import EditReportModal from './EditReportModal';
import DeleteReportModal from './DeleteReportModal';

const Reports: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<InsightReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InsightReport | null>(null);
  
  // Fetch reports from the API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await InsightsService.getAllReports();
      setReports(data);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching reports:', err);
      // Don't show an error message, just set empty reports
      setReports([]);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  // New report state
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    dashboardId: '',
    status: 'Active'
  });

  // Edited report state
  const [editedReport, setEditedReport] = useState({
    title: '',
    description: '',
    dashboardId: '',
    status: 'Active'
  });

  const handleAddReport = () => {
    setNewReport({
      title: '',
      description: '',
      dashboardId: '',
      status: 'Active'
    });
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowViewModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedReport(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReport({
      ...newReport,
      [name]: value
    });
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedReport({
      ...editedReport,
      [name]: value
    });
  };

  const handleSaveReport = async () => {
    try {
      setLoading(true);
      
      const savedReport = await InsightsService.createReport({
        title: newReport.title,
        description: newReport.description,
        dashboardId: newReport.dashboardId,
        status: newReport.status
      });
      
      setReports([savedReport, ...reports]);
      setShowAddModal(false);
      toast.success('Report created successfully');
      setLoading(false);
    } catch (err: any) {
      console.error('Error creating report:', err);
      
      // Create a local report object for demo purposes
      const localReport = {
        id: `local-${Date.now()}`,
        title: newReport.title,
        description: newReport.description,
        dashboardId: newReport.dashboardId,
        status: newReport.status,
        companyId: 'local',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setReports([localReport, ...reports]);
      setShowAddModal(false);
      toast.success('Report created locally (demo mode)');
      setLoading(false);
    }
  };

  const handleUpdateReport = async () => {
    if (!selectedReport) return;
    
    try {
      setLoading(true);
      
      const updatedReport = await InsightsService.updateReport(selectedReport.id, {
        title: editedReport.title,
        description: editedReport.description,
        dashboardId: editedReport.dashboardId,
        status: editedReport.status
      });
      
      setReports(reports.map(report => 
        report.id === updatedReport.id ? updatedReport : report
      ));
      
      setShowEditModal(false);
      toast.success('Report updated successfully');
      setLoading(false);
    } catch (err: any) {
      console.error('Error updating report:', err);
      toast.error('Failed to update report');
      setLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!selectedReport) return;
    
    try {
      setLoading(true);
      
      try {
        await InsightsService.deleteReport(selectedReport.id);
      } catch (err: any) {
        console.error('Error deleting report:', err);
        
        // If it's a local report (demo mode), just remove it from the local state
        if (selectedReport.id.startsWith('local-')) {
          setReports(reports.filter(report => report.id !== selectedReport.id));
          setShowDeleteModal(false);
          toast.success('Report deleted successfully');
          setLoading(false);
          return;
        }
        
        // Otherwise, re-throw the error
        throw err;
      }
      
      setReports(reports.filter(report => report.id !== selectedReport.id));
      setShowDeleteModal(false);
      toast.success('Report deleted successfully');
      setLoading(false);
    } catch (err: any) {
      console.error('Error deleting report:', err);
      toast.error('Failed to delete report');
      setLoading(false);
    }
  };

  const handleViewReport = (report: InsightReport) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleEditReport = (report: InsightReport) => {
    setSelectedReport(report);
    setEditedReport({
      title: report.title,
      description: report.description || '',
      dashboardId: report.dashboardId || '',
      status: report.status
    });
    setShowEditModal(true);
  };

  const handleDeleteReportModal = (report: InsightReport) => {
    setSelectedReport(report);
    setShowDeleteModal(true);
  };

  const handleViewDashboard = (report: InsightReport) => {
    navigate(`/insights/reports/view/${report.id}`);
  };

  const handleRetry = () => {
    fetchData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter reports based on search term and status
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (report.description && report.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus ? report.status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Business Intelligence Reports</h1>
          <p className="text-muted mb-0">Create and manage interactive data visualizations</p>
        </div>
        <div>
          <Button variant="primary" className="me-2" onClick={handleAddReport}>
            <FaPlus className="me-2" />
            Add Report
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="warning" className="mb-4 d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-0">{error}</p>
          </div>
          <Button variant="outline-primary" size="sm" onClick={handleRetry}>
            <FaSync className="me-2" />
            Retry
          </Button>
        </Alert>
      )}

      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={6}>
              <div className="d-flex gap-3">
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

      {/* Reports Table */}
      <Card>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" className="text-primary mb-3" />
              <p className="text-muted">Loading reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-5">
              <FaChartBar size={48} className="text-muted mb-3" />
              <h4>No Reports Found</h4>
              <p className="text-muted">Get started by adding your first business intelligence report.</p>
              <div className="mt-3">
                <Button variant="primary" onClick={handleAddReport}>
                  <FaPlus className="me-2" />
                  Add Report
                </Button>
              </div>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>
                    <div className="d-flex align-items-center">
                      Report Name
                      <FaSort className="ms-2" style={{ cursor: 'pointer' }} />
                    </div>
                  </th>
                  <th>
                    <div className="d-flex align-items-center">
                      Dashboard ID
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className="bi bi-file-earmark-bar-graph fs-5 me-3 text-primary"></i>
                        <div>
                          <div className="fw-medium">{report.title}</div>
                          <div className="small text-muted">{report.description}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted small">{report.dashboardId.substring(0, 8)}...</span>
                    </td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>{formatDate(report.updatedAt)}</td>
                    <td>
                      <Badge bg={
                        report.status === 'Active' ? 'success' : 
                        report.status === 'Draft' ? 'secondary' : 
                        'warning'
                      }>
                        {report.status}
                      </Badge>
                    </td>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="View Details"
                        onClick={() => handleViewReport(report)}
                      >
                        <FaEye />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2 text-primary" 
                        title="Open Dashboard"
                        onClick={() => handleViewDashboard(report)}
                      >
                        <FaChartBar />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 me-2" 
                        title="Edit"
                        onClick={() => handleEditReport(report)}
                      >
                        <FaEdit />
                      </Button>
                      <Button 
                        variant="link" 
                        className="p-0 text-danger" 
                        title="Delete"
                        onClick={() => handleDeleteReportModal(report)}
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
      <AddReportModal
        show={showAddModal}
        onHide={handleCloseModal}
        newReport={newReport}
        handleInputChange={handleInputChange}
        handleSaveReport={handleSaveReport}
      />

      <ViewReportModal
        show={showViewModal}
        onHide={handleCloseModal}
        report={selectedReport}
        formatDate={formatDate}
        onViewDashboard={() => selectedReport && handleViewDashboard(selectedReport)}
      />

      <EditReportModal
        show={showEditModal}
        onHide={handleCloseModal}
        report={selectedReport}
        editedReport={editedReport}
        handleInputChange={handleEditInputChange}
        handleUpdateReport={handleUpdateReport}
      />

      <DeleteReportModal
        show={showDeleteModal}
        onHide={handleCloseModal}
        report={selectedReport}
        handleDeleteReport={handleDeleteReport}
      />
    </div>
  );
};

export default Reports;
