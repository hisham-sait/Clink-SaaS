import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteSectionModalProps {
  show: boolean;
  onHide: () => void;
  selectedSection: {
    id: string;
    name: string;
    attributeCount?: number;
  } | null;
  handleConfirmDelete: () => Promise<void>;
}

const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  show,
  onHide,
  selectedSection,
  handleConfirmDelete
}) => {
  if (!selectedSection) return null;

  const hasAttributes = selectedSection.attributeCount && selectedSection.attributeCount > 0;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the section <strong>{selectedSection.name}</strong>?
          This action cannot be undone.
        </p>
        
        {hasAttributes && (
          <Alert variant="warning" className="mt-3">
            <strong>Warning:</strong> This section has {selectedSection.attributeCount} attributes associated with it.
            Deleting this section may affect these attributes and the products using them.
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
        >
          <FaTrash className="me-2" />
          Delete Section
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteSectionModal;
