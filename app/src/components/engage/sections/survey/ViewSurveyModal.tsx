import React from 'react';
import { Modal, Button, Row, Col, Badge } from 'react-bootstrap';
import { FaShareAlt } from 'react-icons/fa';

interface ViewSurveyModalProps {
  show: boolean;
  onHide: () => void;
  survey: {
    id: string;
    slug: string;
    title: string;
    description: string;
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

const ViewSurveyModal: React.FC<ViewSurveyModalProps> = ({
  show,
  onHide,
  survey,
  copiedLink,
  handleCopyLink,
  handleEdit,
  formatDate
}) => {
  if (!survey) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>View Survey</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="mb-4">
          <Col md={8}>
            <h4>{survey.title}</h4>
            <p className="text-muted">
              {survey.description}
            </p>
          </Col>
          <Col md={4} className="text-end">
            <Badge bg={
              survey.status === 'Active' ? 'success' : 
              survey.status === 'Draft' ? 'secondary' : 
              'warning'
            }>
              {survey.status}
            </Badge>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <p className="mb-1 text-muted">Category</p>
            <p className="fw-medium">{survey.category?.name || 'Uncategorized'}</p>
          </Col>
          <Col md={6}>
            <p className="mb-1 text-muted">Responses</p>
            <p className="fw-medium">{survey.responses}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <p className="mb-1 text-muted">Created</p>
            <p className="fw-medium">{formatDate(survey.createdAt)}</p>
          </Col>
          <Col md={6}>
            <p className="mb-1 text-muted">Last Modified</p>
            <p className="fw-medium">{formatDate(survey.updatedAt)}</p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <p className="mb-1 text-muted">Survey Link</p>
            <div className="d-flex align-items-center">
              <code className="flex-grow-1 bg-light p-2 rounded">
                {`${window.location.origin}/y/${survey.slug}`}
              </code>
              <Button 
                variant="link" 
                className="ms-2" 
                onClick={() => handleCopyLink(survey.slug)}
              >
                <FaShareAlt className={copiedLink === survey.id ? 'text-success' : ''} />
              </Button>
            </div>
            {copiedLink === survey.id && (
              <small className="text-success">Link copied to clipboard!</small>
            )}
          </Col>
        </Row>

        <Row className="mb-3">
          <Col>
            <p className="mb-1 text-muted">Survey Settings</p>
            <div className="border rounded p-3">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Anonymous responses allowed
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  All questions required by default
                </li>
                <li className="mb-2">
                  <i className="bi bi-check-circle-fill text-success me-2"></i>
                  Progress bar shown
                </li>
                <li>
                  <i className="bi bi-x-circle-fill text-danger me-2"></i>
                  Multiple responses from same user not allowed
                </li>
              </ul>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleEdit}>
          Edit Survey
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewSurveyModal;
