import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { InsightReport } from '../../../../services/insights';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteReportModalProps {
  show: boolean;
  onHide: () => void;
  report: InsightReport | null;
  handleDeleteReport: () => void;
}

const DeleteReportModal: React.FC<DeleteReportModalProps> = ({
  show,
  onHide,
  report,
  handleDeleteReport
}) => {
  if (!report) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Delete Report</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <FaExclamationTriangle size={48} className="text-warning mb-3" />
          <h5>Are you sure you want to delete this report?</h5>
          <p className="text-muted">
            This action cannot be undone. The report "{report.title}" will be permanently deleted.
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteReport}>
          Delete Report
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteReportModal;
