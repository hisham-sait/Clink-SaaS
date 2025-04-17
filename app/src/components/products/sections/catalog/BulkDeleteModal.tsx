import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface BulkDeleteModalProps {
  show: boolean;
  onHide: () => void;
  selectedProducts: string[];
  handleBulkDelete: () => Promise<void>;
}

const BulkDeleteModal: React.FC<BulkDeleteModalProps> = ({
  show,
  onHide,
  selectedProducts,
  handleBulkDelete
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Bulk Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete <strong>{selectedProducts.length}</strong> products?
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="danger" 
          onClick={handleBulkDelete}
        >
          <FaTrash className="me-2" />
          Delete Products
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkDeleteModal;
