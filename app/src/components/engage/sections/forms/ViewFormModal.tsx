import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaCopy } from 'react-icons/fa';

interface ViewFormModalProps {
  show: boolean;
  onHide: () => void;
  form: {
    id: string;
    slug: string;
    title: string;
    type: string;
    status: string;
    responses: number;
    createdAt: string;
    updatedAt: string;
    category: { id: string; name: string };
  } | null;
  copiedLink: string | null;
  handleCopyLink: (id: string) => void;
  handleEdit: () => void;
  formatDate: (dateString: string) => string;
}

const ViewFormModal: React.FC<ViewFormModalProps> = ({
  show,
  onHide,
  form,
  copiedLink,
  handleCopyLink,
  handleEdit,
  formatDate
}) => {
  if (!form) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>View Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={8}>
            <h4>{form.title}</h4>
            <p className="text-muted">
              {form.type} Form
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Badge bg={
              form.status === 'Active' ? 'success' : 
              form.status === 'Draft' ? 'secondary' : 
              'warning'
            }>
              {form.status}
            </Badge>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <p className="mb-1 text-muted">Category</p>
            <p className="fw-medium">{form.category?.name || 'Uncategorized'}</p>
          </Col>
          <Col md={6}>
            <p className="mb-1 text-muted">Responses</p>
            <p className="fw-medium">{form.responses}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <p className="mb-1 text-muted">Created</p>
            <p className="fw-medium">{formatDate(form.createdAt)}</p>
          </Col>
          <Col md={6}>
            <p className="mb-1 text-muted">Last Updated</p>
            <p className="fw-medium">{formatDate(form.updatedAt)}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <p className="mb-1 text-muted">Form Link</p>
            <div className="d-flex align-items-center">
              <code className="flex-grow-1 bg-light p-2 rounded">
                {`${window.location.origin}/f/${form.slug}`}
              </code>
              <Button 
                variant="link" 
                className="ms-2" 
                onClick={() => handleCopyLink(form.slug)}
              >
                <FaCopy className={copiedLink === form.id ? 'text-success' : ''} />
              </Button>
            </div>
            {copiedLink === form.id && (
              <small className="text-success">Link copied to clipboard!</small>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleEdit}>
          Edit Form
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewFormModal;
