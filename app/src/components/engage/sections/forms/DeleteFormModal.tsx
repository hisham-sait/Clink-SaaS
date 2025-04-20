import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteFormModalProps {
  show: boolean;
  onHide: () => void;
  form: {
    id: string;
    title: string;
  } | null;
  handleDeleteForm: () => void;
}

const DeleteFormModal: React.FC<DeleteFormModalProps> = ({
  show,
  onHide,
  form,
  handleDeleteForm
}) => {
  if (!form) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Delete Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the form <strong>"{form.title}"</strong>?</p>
        <p className="text-danger">This action cannot be undone.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteForm}>
          Delete Form
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteFormModal;
