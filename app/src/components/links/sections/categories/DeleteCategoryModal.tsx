import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    name: string;
    linkCount: number;
  } | null;
  handleConfirmDelete: () => Promise<void>;
}

const DeleteCategoryModal: React.FC<DeleteCategoryModalProps> = ({
  show,
  onHide,
  selectedCategory,
  handleConfirmDelete
}) => {
  if (!selectedCategory) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the category <strong>{selectedCategory.name}</strong>?
          This action cannot be undone.
        </p>
        {selectedCategory.linkCount > 0 && (
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This category has {selectedCategory.linkCount} links associated with it.
            You cannot delete a category with links. Please reassign or delete the links first.
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleConfirmDelete}
          disabled={selectedCategory.linkCount > 0}
        >
          <FaTrash className="me-2" />
          Delete Category
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCategoryModal;
