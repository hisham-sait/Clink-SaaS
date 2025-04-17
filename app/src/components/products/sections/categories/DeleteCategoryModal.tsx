import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    name: string;
    productCount?: number;
    childrenCount?: number;
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

  const hasProducts = selectedCategory.productCount && selectedCategory.productCount > 0;
  const hasChildren = selectedCategory.childrenCount && selectedCategory.childrenCount > 0;
  const canDelete = !hasProducts && !hasChildren;

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
        
        {(hasProducts || hasChildren) && (
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This category cannot be deleted because:
            <ul className="mb-0 mt-2">
              {hasProducts && (
                <li>It has {selectedCategory.productCount} products associated with it.</li>
              )}
              {hasChildren && (
                <li>It has {selectedCategory.childrenCount} subcategories.</li>
              )}
            </ul>
            <p className="mt-2 mb-0">
              Please reassign or delete all products and subcategories first.
            </p>
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
          disabled={!canDelete}
        >
          <FaTrash className="me-2" />
          Delete Category
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCategoryModal;
