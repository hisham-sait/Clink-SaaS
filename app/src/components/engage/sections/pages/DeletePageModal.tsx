import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { EngageTypes } from '../../../../services/engage';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeletePageModalProps {
  show: boolean;
  onHide: () => void;
  page: EngageTypes.PageData | null;
  handleDeletePage: () => void;
}

const DeletePageModal: React.FC<DeletePageModalProps> = ({
  show,
  onHide,
  page,
  handleDeletePage
}) => {
  if (!page) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title className="text-danger">Delete Page</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center mb-4">
          <FaExclamationTriangle size={48} className="text-warning mb-3" />
          <h5>Are you sure you want to delete this page?</h5>
          <p className="text-muted">
            This action cannot be undone. The page will be permanently deleted.
          </p>
        </div>
        
        <div className="border rounded p-3 mb-3">
          <h6>{page.title}</h6>
          {page.description && (
            <p className="text-muted small mb-0">{page.description}</p>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeletePage}>
          Delete Page
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeletePageModal;
