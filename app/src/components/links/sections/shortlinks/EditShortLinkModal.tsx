import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditShortLinkModalProps {
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
  editedShortLink: {
    title: string;
    shortCode: string;
    originalUrl: string;
    status: string;
    expiresAt: string;
    password: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateShortLink: () => Promise<void>;
  categories: Array<{
    id: string;
    name: string;
  }>;
}

const EditShortLinkModal: React.FC<EditShortLinkModalProps> = ({
  show,
  onHide,
  shortLink,
  editedShortLink,
  handleInputChange,
  handleUpdateShortLink,
  categories
}) => {
  if (!shortLink) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Short Link</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                  type="text" 
                  name="title"
                  value={editedShortLink.title}
                  onChange={handleInputChange}
                  placeholder="My Short Link"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Short Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="shortCode"
                  value={editedShortLink.shortCode}
                  onChange={handleInputChange}
                  disabled
                />
                <Form.Text className="text-muted">
                  Short code cannot be changed after creation
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Original URL</Form.Label>
            <Form.Control 
              type="url" 
              name="originalUrl"
              value={editedShortLink.originalUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/very/long/url/to/shorten"
              required
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status"
                  value={editedShortLink.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  name="categoryId"
                  value={editedShortLink.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Expiration Date (optional)</Form.Label>
                <Form.Control 
                  type="date" 
                  name="expiresAt"
                  value={editedShortLink.expiresAt}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Password Protection (optional)</Form.Label>
                <Form.Control 
                  type="password" 
                  name="password"
                  value={editedShortLink.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank for no password"
                />
                <Form.Text className="text-muted">
                  Leave blank to keep current password, or enter a new one
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpdateShortLink}
          disabled={!editedShortLink.originalUrl}
        >
          <FaSave className="me-2" />
          Update Short Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditShortLinkModal;
