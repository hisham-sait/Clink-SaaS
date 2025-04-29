import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaCopy, FaEdit } from 'react-icons/fa';
import { LinksTypes } from '../../../../services/links';

interface ViewDigitalLinkModalProps {
  show: boolean;
  onHide: () => void;
  digitalLink: LinksTypes.DigitalLink | null;
  copiedLink: string | null;
  handleCopyLink: (gs1Key: string, gs1KeyType: string) => void;
  handleEdit: () => void;
  formatDate: (dateString: string | null) => string;
}

const ViewDigitalLinkModal: React.FC<ViewDigitalLinkModalProps> = ({
  show,
  onHide,
  digitalLink,
  copiedLink,
  handleCopyLink,
  handleEdit,
  formatDate
}) => {
  if (!digitalLink) return null;

  // Map GS1 key types to their corresponding application identifiers
  const gs1KeyTypeToAI: Record<string, string> = {
    'GTIN': '01',
    'GLN': '414',
    'SSCC': '00',
    'GRAI': '8003',
    'GIAI': '8004',
    'GSRN': '8018',
    'GDTI': '253',
    'GINC': '401',
    'GSIN': '402'
  };

  // Get the application identifier for the given key type
  const ai = gs1KeyTypeToAI[digitalLink.gs1KeyType] || digitalLink.gs1KeyType;

  // Ensure gs1Url is a string
  const gs1Url = digitalLink.gs1Url || `${ai}/${digitalLink.gs1Key}`;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Digital Link Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="mb-3">
            <h5>GS1 Digital Link URL</h5>
            <div className="d-flex align-items-center">
              <code className="me-2">{window.location.origin}/d/{gs1Url}</code>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleCopyLink(digitalLink.gs1Key, digitalLink.gs1KeyType)}
              >
                <FaCopy className="me-1" />
                {copiedLink === digitalLink.gs1Key ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <div className="mt-2">
              <small className="text-muted">
                GS1 Standard Format: <code>https://id.gs1.org/{ai}/{digitalLink.gs1Key}</code>
              </small>
            </div>
          </div>
          
          <div className="mb-3">
            <h5>Title</h5>
            <p>{digitalLink.title || 'Untitled'}</p>
          </div>
          
          <div className="mb-3">
            <h5>GS1 Key Type</h5>
            <p>{digitalLink.gs1KeyType}</p>
          </div>
          
          <div className="mb-3">
            <h5>GS1 Key</h5>
            <p>{digitalLink.gs1Key}</p>
          </div>
          
          <div className="mb-3">
            <h5>Status</h5>
            <Badge bg={
              digitalLink.status === 'Active' ? 'success' : 
              digitalLink.status === 'Inactive' ? 'warning' : 
              'secondary'
            }>
              {digitalLink.status}
            </Badge>
            {digitalLink.password && (
              <Badge bg="info" className="ms-2">Password Protected</Badge>
            )}
          </div>
          
          <div className="mb-3">
            <h5>Product</h5>
            <p>{digitalLink.productId ? 'Product ID: ' + digitalLink.productId : 'No Product'}</p>
          </div>
          
          <div className="mb-3">
            <h5>Category</h5>
            <p>{digitalLink.category ? digitalLink.category.name : 'No Category'}</p>
          </div>
          
          <div className="mb-3">
            <h5>Statistics</h5>
            <p>Clicks: <strong>{digitalLink.clicks || 0}</strong></p>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h5>Created</h5>
                <p>{formatDate(digitalLink.createdAt)}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <h5>Expires</h5>
                <p>{formatDate(digitalLink.expiresAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button 
          variant="primary" 
          onClick={handleEdit}
        >
          <FaEdit className="me-2" />
          Edit
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDigitalLinkModal;
