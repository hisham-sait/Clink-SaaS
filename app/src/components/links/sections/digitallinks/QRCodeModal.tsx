import React from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

interface QRCodeModalProps {
  show: boolean;
  onHide: () => void;
  qrCodeUrl: string;
  gs1Key: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  onHide,
  qrCodeUrl,
  gs1Key
}) => {
  const handleDownloadQRCode = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${gs1Key}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>QR Code for {gs1Key}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Image 
          src={qrCodeUrl} 
          alt={`QR Code for ${gs1Key}`} 
          fluid 
          className="mb-3"
        />
        <p className="text-muted">
          Scan this QR code to access your digital link
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={handleDownloadQRCode}
        >
          <FaDownload className="me-2" />
          Download QR Code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default QRCodeModal;
