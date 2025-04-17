import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteDigitalLinkModalProps {
  show: boolean;
  onHide: () => void;
  digitalLink: {
    id: string;
    title: string;
    gs1KeyType: string;
    gs1Key: string;
  } | null;
  handleDeleteDigitalLink: () => Promise<void>;
}

const DeleteDigitalLinkModal: React.FC<DeleteDigitalLinkModalProps> = ({
  show,
  onHide,
  digitalLink,
  handleDeleteDigitalLink
}) => {
  if (!digitalLink) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the digital link <strong>{digitalLink.title || `${digitalLink.gs1KeyType}:${digitalLink.gs1Key}`}</strong>?
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDeleteDigitalLink}
        >
          <FaTrash className="me-2" />
          Delete Digital Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteDigitalLinkModal;
