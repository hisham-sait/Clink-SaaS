import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteShortLinkModalProps {
  show: boolean;
  onHide: () => void;
  shortLink: {
    id: string;
    title: string;
    shortCode: string;
  } | null;
  handleDeleteShortLink: () => Promise<void>;
}

const DeleteShortLinkModal: React.FC<DeleteShortLinkModalProps> = ({
  show,
  onHide,
  shortLink,
  handleDeleteShortLink
}) => {
  if (!shortLink) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the short link <strong>{shortLink.title || shortLink.shortCode}</strong>?
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleDeleteShortLink}
        >
          <FaTrash className="me-2" />
          Delete Short Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteShortLinkModal;
