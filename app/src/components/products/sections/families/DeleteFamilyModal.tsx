import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteFamilyModalProps {
  show: boolean;
  onHide: () => void;
  selectedFamily: {
    id: string;
    name: string;
    attributeCount?: number;
    productCount?: number;
  } | null;
  handleConfirmDelete: () => Promise<void>;
}

const DeleteFamilyModal: React.FC<DeleteFamilyModalProps> = ({
  show,
  onHide,
  selectedFamily,
  handleConfirmDelete
}) => {
  if (!selectedFamily) return null;

  const hasAttributes = selectedFamily.attributeCount && selectedFamily.attributeCount > 0;
  const hasProducts = selectedFamily.productCount && selectedFamily.productCount > 0;
  const canDelete = !hasAttributes && !hasProducts;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the family <strong>{selectedFamily.name}</strong>?
          This action cannot be undone.
        </p>
        
        {(hasAttributes || hasProducts) && (
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This family cannot be deleted because:
            <ul className="mb-0 mt-2">
              {hasAttributes && (
                <li>It has {selectedFamily.attributeCount} attributes associated with it.</li>
              )}
              {hasProducts && (
                <li>It has {selectedFamily.productCount} products associated with it.</li>
              )}
            </ul>
            <p className="mt-2 mb-0">
              Please reassign or delete all attributes and products first.
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
          Delete Family
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteFamilyModal;
