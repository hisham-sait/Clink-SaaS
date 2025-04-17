import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteAttributeModalProps {
  show: boolean;
  onHide: () => void;
  selectedAttribute: {
    id: string;
    name: string;
    usage?: {
      productCount: number;
      familyCount: number;
    };
  } | null;
  handleConfirmDelete: () => Promise<void>;
}

const DeleteAttributeModal: React.FC<DeleteAttributeModalProps> = ({
  show,
  onHide,
  selectedAttribute,
  handleConfirmDelete
}) => {
  if (!selectedAttribute) return null;

  const hasUsage = selectedAttribute.usage && 
    (selectedAttribute.usage.productCount > 0 || selectedAttribute.usage.familyCount > 0);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the attribute <strong>{selectedAttribute.name}</strong>?
          This action cannot be undone.
        </p>
        {hasUsage && (
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This attribute is currently in use:
            <ul className="mb-0 mt-2">
              {selectedAttribute.usage && selectedAttribute.usage.productCount > 0 && (
                <li>Used by {selectedAttribute.usage.productCount} products</li>
              )}
              {selectedAttribute.usage && selectedAttribute.usage.familyCount > 0 && (
                <li>Used by {selectedAttribute.usage.familyCount} families</li>
              )}
            </ul>
            <p className="mt-2 mb-0">Deleting this attribute may affect these items.</p>
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete}>
          <FaTrash className="me-2" />
          Delete Attribute
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteAttributeModal;
