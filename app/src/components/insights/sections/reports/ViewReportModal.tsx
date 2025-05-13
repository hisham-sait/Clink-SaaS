import React from 'react';
import { Modal, Button, ListGroup } from 'react-bootstrap';
import { InsightReport } from '../../../../services/insights';
import { FaChartBar } from 'react-icons/fa';

interface ViewReportModalProps {
  show: boolean;
  onHide: () => void;
  report: InsightReport | null;
  formatDate: (dateString: string) => string;
  onViewDashboard: () => void;
}

const ViewReportModal: React.FC<ViewReportModalProps> = ({
  show,
  onHide,
  report,
  formatDate,
  onViewDashboard
}) => {
  if (!report) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Report Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup variant="flush">
          <ListGroup.Item>
            <div className="fw-bold">Title</div>
            <div>{report.title}</div>
          </ListGroup.Item>
          {report.description && (
            <ListGroup.Item>
              <div className="fw-bold">Description</div>
              <div>{report.description}</div>
            </ListGroup.Item>
          )}
          <ListGroup.Item>
            <div className="fw-bold">Dashboard ID</div>
            <div className="text-muted">{report.dashboardId}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div className="fw-bold">Status</div>
            <div>
              <span className={`badge ${
                report.status === 'Active' ? 'bg-success' : 
                report.status === 'Draft' ? 'bg-secondary' : 
                'bg-warning'
              }`}>
                {report.status}
              </span>
            </div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div className="fw-bold">Created</div>
            <div>{formatDate(report.createdAt)}</div>
          </ListGroup.Item>
          <ListGroup.Item>
            <div className="fw-bold">Last Modified</div>
            <div>{formatDate(report.updatedAt)}</div>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onViewDashboard}>
          <FaChartBar className="me-2" />
          View Dashboard
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewReportModal;
