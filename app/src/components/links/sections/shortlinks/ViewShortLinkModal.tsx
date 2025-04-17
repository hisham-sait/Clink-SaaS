import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaCopy, FaEdit } from 'react-icons/fa';

interface ViewShortLinkModalProps {
  show: boolean;
  onHide: () => void;
  shortLink: {
    id: string;
    title: string;
    shortCode: string;
    originalUrl: string;
    status: string;
    expiresAt: string | null;
    password: string | null;
    categoryId: string | null;
    category?: {
      id: string;
      name: string;
    };
    clicks: number;
    createdAt: string;
    updatedAt: string;
  } | null;
  copiedLink: string | null;
  handleCopyLink: (shortCode: string) => void;
  handleEdit: () => void;
  formatDate: (dateString: string | null) => string;
}

const ViewShortLinkModal: React.FC<ViewShortLinkModalProps> = ({
  show,
  onHide,
  shortLink,
  copiedLink,
  handleCopyLink,
  handleEdit,
  formatDate
}) => {
  if (!shortLink) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Short Link Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <div className="mb-3">
            <h5>Short URL</h5>
            <div className="d-flex align-items-center">
              <code className="me-2">{window.location.origin}/s/{shortLink.shortCode}</code>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleCopyLink(shortLink.shortCode)}
              >
                <FaCopy className="me-1" />
                {copiedLink === shortLink.shortCode ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>
          
          <div className="mb-3">
            <h5>Title</h5>
            <p>{shortLink.title || 'Untitled'}</p>
          </div>
          
          <div className="mb-3">
            <h5>Original URL</h5>
            <p className="text-break">{shortLink.originalUrl}</p>
          </div>
          
          <div className="mb-3">
            <h5>Status</h5>
            <Badge bg={
              shortLink.status === 'Active' ? 'success' : 
              shortLink.status === 'Inactive' ? 'warning' : 
              'secondary'
            }>
              {shortLink.status}
            </Badge>
            {shortLink.password && (
              <Badge bg="info" className="ms-2">Password Protected</Badge>
            )}
          </div>
          
          <div className="mb-3">
            <h5>Category</h5>
            <p>{shortLink.category ? shortLink.category.name : 'No Category'}</p>
          </div>
          
          <div className="mb-3">
            <h5>Statistics</h5>
            <p>Clicks: <strong>{shortLink.clicks || 0}</strong></p>
          </div>
          
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <h5>Created</h5>
                <p>{formatDate(shortLink.createdAt)}</p>
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <h5>Expires</h5>
                <p>{formatDate(shortLink.expiresAt)}</p>
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

export default ViewShortLinkModal;
