import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { LinksTypes } from '../../../../services/links';

interface DeleteQRCodeModalProps {
  show: boolean;
  onHide: () => void;
  qrCode: LinksTypes.QRCode;
  handleDeleteQRCode: () => void;
}

const DeleteQRCodeModal: React.FC<DeleteQRCodeModalProps> = ({
  show,
  onHide,
  qrCode,
  handleDeleteQRCode
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Delete QR Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="danger">
          <Alert.Heading>Warning: This action cannot be undone</Alert.Heading>
          <p>
            Are you sure you want to delete the QR code "{qrCode.title || 'Untitled'}"?
          </p>
          <p>
            This will permanently remove the QR code and all associated analytics data.
            Any existing QR codes that have been printed or shared will no longer work.
          </p>
        </Alert>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleDeleteQRCode}>
          Delete QR Code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteQRCodeModal;
