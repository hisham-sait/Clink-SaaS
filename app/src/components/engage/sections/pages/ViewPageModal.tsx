import React from 'react';
import { Modal, Button, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FaShareAlt, FaEdit, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { EngageTypes, buildPageEmbedUrl } from '../../../../services/engage';

interface ViewPageModalProps {
  show: boolean;
  onHide: () => void;
  page: EngageTypes.PageData | null;
  copiedLink: string | null;
  handleCopyLink: (slug: string) => void;
  handleEdit: () => void;
  formatDate: (date: string) => string;
}

const ViewPageModal: React.FC<ViewPageModalProps> = ({
  show,
  onHide,
  page,
  copiedLink,
  handleCopyLink,
  handleEdit,
  formatDate
}) => {
  if (!page) return null;

  const pageUrl = buildPageEmbedUrl(page.slug || '');

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Page Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h4 className="mb-3">{page.title}</h4>
        
        {page.description && (
          <p className="text-muted mb-4">{page.description}</p>
        )}
        
        <Row className="mb-4">
          <Col md={6}>
            <div className="mb-3">
              <strong>Status:</strong>{' '}
              <Badge bg={
                page.status === 'Active' ? 'success' : 
                page.status === 'Draft' ? 'secondary' : 
                'warning'
              }>
                {page.status}
              </Badge>
            </div>
            
            <div className="mb-3">
              <strong>Category:</strong>{' '}
              {page.categoryId ? 'Categorized' : 'Uncategorized'}
            </div>
            
            <div className="mb-3">
              <strong>Created:</strong>{' '}
              {formatDate(page.createdAt || '')}
            </div>
            
            <div className="mb-3">
              <strong>Last Modified:</strong>{' '}
              {formatDate(page.updatedAt || '')}
            </div>
          </Col>
          
          <Col md={6}>
            <div className="mb-3">
              <strong>Views:</strong>{' '}
              {page.views || 0}
            </div>
            
            <div className="mb-3">
              <strong>Page URL:</strong>{' '}
              <div className="d-flex align-items-center mt-1">
                <code className="me-2 flex-grow-1 text-truncate">
                  {pageUrl}
                </code>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => handleCopyLink(page.slug || '')}
                >
                  <FaShareAlt />
                </Button>
              </div>
              {copiedLink === page.slug && (
                <Alert variant="success" className="mt-2 py-1 px-2">
                  <small>Link copied to clipboard!</small>
                </Alert>
              )}
            </div>
          </Col>
        </Row>
        
        <div className="d-flex justify-content-center mb-3">
          <Button 
            variant="outline-primary" 
            href={pageUrl} 
            target="_blank" 
            className="me-2"
          >
            <FaExternalLinkAlt className="me-2" />
            Open Page
          </Button>
        </div>
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

export default ViewPageModal;
