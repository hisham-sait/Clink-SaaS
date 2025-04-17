import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';

interface DeleteProductModalProps {
  show: boolean;
  onHide: () => void;
  selectedProduct: any;
  handleConfirmDelete: () => Promise<void>;
}

const DeleteProductModal: React.FC<DeleteProductModalProps> = ({
  show,
  onHide,
  selectedProduct,
  handleConfirmDelete
}) => {
  if (!selectedProduct) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Confirm Delete</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Are you sure you want to delete the product <strong>{selectedProduct.name}</strong>?
          This action cannot be undone.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirmDelete}>
          <FaTrash className="me-2" />
          Delete Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteProductModal;
