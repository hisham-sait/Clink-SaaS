import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    name: string;
    type: string;
    formsCount?: number;
    surveysCount?: number;
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

  const itemCount = selectedCategory.type === 'form' 
    ? (selectedCategory.formsCount || 0) 
    : (selectedCategory.surveysCount || 0);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Are you sure you want to delete the category <strong>{selectedCategory.name}</strong>?</p>
        
        {itemCount > 0 ? (
          <Alert variant="warning">
            <Alert.Heading>Warning!</Alert.Heading>
            <p>
              This category contains {itemCount} {selectedCategory.type === 'form' ? 'form' : 'survey'}
              {itemCount > 1 ? 's' : ''}. You cannot delete a category that has items assigned to it.
            </p>
            <p className="mb-0">
              Please reassign or delete these items first.
            </p>
          </Alert>
        ) : (
          <Alert variant="danger">
            <p className="mb-0">
              This action cannot be undone. The category will be permanently deleted.
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
          disabled={itemCount > 0}
        >
          <FaTrash className="me-2" />
          Delete Category
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteCategoryModal;
