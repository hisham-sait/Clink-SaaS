import React from 'react';
import { Modal, Button, Image } from 'react-bootstrap';
import { FaDownload } from 'react-icons/fa';

interface QRCodeModalProps {
  show: boolean;
  onHide: () => void;
  qrCodeUrl: string;
  shortCode: string;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({
  show,
  onHide,
  qrCodeUrl,
  shortCode
}) => {
  const handleDownloadQRCode = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qrcode-${shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>QR Code for {shortCode}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <Image 
          src={qrCodeUrl} 
          alt={`QR Code for ${shortCode}`} 
          fluid 
          className="mb-3"
        />
        <p className="text-muted">
          Scan this QR code to access your short link
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
