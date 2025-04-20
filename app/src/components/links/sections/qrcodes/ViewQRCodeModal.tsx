import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { FaCopy, FaDownload, FaEdit } from 'react-icons/fa';
import { LinksTypes } from '../../../../services/links';

// Use the global QRCodeStyling object
declare global {
  interface Window {
    QRCodeStyling: any;
  }
}

interface ViewQRCodeModalProps {
  show: boolean;
  onHide: () => void;
  qrCode: LinksTypes.QRCode;
  copiedQRCode: string | null;
  handleCopyQRCode: (id: string) => void;
  handleEdit: () => void;
  formatDate: (date: string | null) => string;
}

const ViewQRCodeModal: React.FC<ViewQRCodeModalProps> = ({
  show,
  onHide,
  qrCode,
  copiedQRCode,
  handleCopyQRCode,
  handleEdit,
  formatDate
}) => {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [qrCodeInstance, setQRCodeInstance] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    if (show && qrCodeRef.current) {
      // Clear previous QR code
      qrCodeRef.current.innerHTML = '';
      
      // Create QR code options
      // Check if content is empty and provide a default value
      const content = qrCode.content || 'https://example.com';
      console.log('QR Code Content in ViewQRCodeModal:', content);
      
      const qrCodeOptions: any = {
        width: qrCode.config.size || 200,
        height: qrCode.config.size || 200,
        type: 'svg',
        data: content,
        margin: qrCode.config.margin || 1,
        qrOptions: {
          errorCorrectionLevel: qrCode.config.errorCorrectionLevel || 'M'
        },
        imageOptions: {
          hideBackgroundDots: true,
          imageSize: qrCode.config.logo ? (qrCode.config.logoSize || 0.2) : 0,
          margin: 0
        },
        dotsOptions: {
          type: qrCode.config.body || 'square',
          color: qrCode.config.foreground || '#000000'
        },
        backgroundOptions: {
          color: qrCode.config.background || '#FFFFFF',
        },
        cornersSquareOptions: {
          type: qrCode.config.eye || 'square',
          color: qrCode.config.cornerSquareColor || qrCode.config.foreground || '#000000'
        },
        cornersDotOptions: {
          type: qrCode.config.eyeBall || 'square',
          color: qrCode.config.cornerDotColor || qrCode.config.foreground || '#000000'
        }
      };
      
      // Add gradient if enabled
      if (qrCode.config.gradient && qrCode.config.gradientColors && qrCode.config.gradientColors.length >= 2) {
        qrCodeOptions.dotsOptions.gradient = {
          type: qrCode.config.gradientType || 'linear',
          rotation: qrCode.config.gradientType === 'linear' ? 0 : 0,
          colorStops: [
            { offset: 0, color: qrCode.config.gradientColors[0] || '#000000' },
            { offset: 1, color: qrCode.config.gradientColors[1] || '#000000' }
          ]
        };
      }
      
      // Add logo if provided
      if (qrCode.config.logo) {
        qrCodeOptions.image = qrCode.config.logo;
      }
      
      // Create QR code
      const instance = new window.QRCodeStyling(qrCodeOptions);
      setQRCodeInstance(instance);
      
      // Append to container
      instance.append(qrCodeRef.current);
      
      // Get data URL for download
      instance.getRawData('png').then((blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
      });
    }
  }, [show, qrCode]);

  const handleDownloadQRCode = () => {
    if (qrCodeInstance) {
      qrCodeInstance.download({
        name: `qrcode-${qrCode.id}`,
        extension: 'png'
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{qrCode.title || 'QR Code Details'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6} className="text-center mb-4">
            <Card className="p-3">
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
                <div ref={qrCodeRef} className="qr-code-container"></div>
              </div>
              <div className="mt-3">
                <Button 
                  variant="outline-primary" 
                  className="me-2" 
                  onClick={handleDownloadQRCode}
                >
                  <FaDownload className="me-2" />
                  Download
                </Button>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleCopyQRCode(qrCode.id)}
                >
                  <FaCopy className={`me-2 ${copiedQRCode === qrCode.id ? 'text-success' : ''}`} />
                  {copiedQRCode === qrCode.id ? 'Copied!' : 'Copy Content'}
                </Button>
              </div>
            </Card>
          </Col>
          <Col md={6}>
            <h5>QR Code Information</h5>
            <dl className="row">
              <dt className="col-sm-4">Title</dt>
              <dd className="col-sm-8">{qrCode.title || 'Untitled'}</dd>

              <dt className="col-sm-4">Content Type</dt>
              <dd className="col-sm-8">{qrCode.contentType}</dd>

              <dt className="col-sm-4">Content</dt>
              <dd className="col-sm-8">
                <div className="text-break">{qrCode.content}</div>
              </dd>

              <dt className="col-sm-4">Status</dt>
              <dd className="col-sm-8">
                <Badge bg={
                  qrCode.status === 'Active' ? 'success' : 
                  qrCode.status === 'Inactive' ? 'warning' : 
                  'secondary'
                }>
                  {qrCode.status}
                </Badge>
              </dd>

              <dt className="col-sm-4">Category</dt>
              <dd className="col-sm-8">{qrCode.category ? qrCode.category.name : '-'}</dd>

              <dt className="col-sm-4">Created</dt>
              <dd className="col-sm-8">{formatDate(qrCode.createdAt)}</dd>

              <dt className="col-sm-4">Expires</dt>
              <dd className="col-sm-8">{formatDate(qrCode.expiresAt)}</dd>

              <dt className="col-sm-4">Total Scans</dt>
              <dd className="col-sm-8">{qrCode.clicks || 0}</dd>
            </dl>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleEdit}>
          <FaEdit className="me-2" />
          Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewQRCodeModal;
