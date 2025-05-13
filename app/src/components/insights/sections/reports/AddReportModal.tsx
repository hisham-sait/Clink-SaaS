import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import InsightsService, { SupersetDashboard } from '../../../../services/insights';

interface AddReportModalProps {
  show: boolean;
  onHide: () => void;
  newReport: {
    title: string;
    description: string;
    dashboardId: string;
    status: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveReport: () => void;
}

const AddReportModal: React.FC<AddReportModalProps> = ({
  show,
  onHide,
  newReport,
  handleInputChange,
  handleSaveReport
}) => {
  const [dashboards, setDashboards] = useState<SupersetDashboard[]>([]);
  const [loadingDashboards, setLoadingDashboards] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  // Fetch available dashboards when the modal opens
  useEffect(() => {
    if (show) {
      fetchDashboards();
    }
  }, [show]);

  const fetchDashboards = async () => {
    setLoadingDashboards(true);
    setDashboardError(null);
    
    try {
      const availableDashboards = await InsightsService.getAvailableDashboards();
      setDashboards(availableDashboards);
      
      // If no dashboard is selected and we have dashboards, select the first one
      if (!newReport.dashboardId && availableDashboards.length > 0) {
        const syntheticEvent = {
          target: {
            name: 'dashboardId',
            value: availableDashboards[0].id
          }
        } as React.ChangeEvent<HTMLSelectElement>;
        
        handleInputChange(syntheticEvent);
      }
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      setDashboardError('Unable to load available dashboards. Please try again later.');
    } finally {
      setLoadingDashboards(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={newReport.title}
              onChange={handleInputChange}
              placeholder="Enter report title"
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={newReport.description}
              onChange={handleInputChange}
              placeholder="Enter report description (optional)"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Dashboard</Form.Label>
            {loadingDashboards ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading available dashboards...
              </div>
            ) : dashboardError ? (
              <div className="text-danger mb-2">{dashboardError}</div>
            ) : (
              <>
                <Form.Select
                  name="dashboardId"
                  value={newReport.dashboardId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a dashboard</option>
                  {dashboards.map(dashboard => (
                    <option key={dashboard.id} value={dashboard.id}>
                      {dashboard.title}
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select the dashboard to embed in this report
                </Form.Text>
              </>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={newReport.status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveReport}
          disabled={!newReport.title || !newReport.dashboardId || loadingDashboards}
        >
          Create Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddReportModal;
