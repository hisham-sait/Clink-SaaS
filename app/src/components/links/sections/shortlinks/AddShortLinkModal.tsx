import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddShortLinkModalProps {
  show: boolean;
  onHide: () => void;
  newShortLink: {
    title: string;
    shortCode: string;
    originalUrl: string;
    linkType: string;
    pageId: string;
    formId: string;
    status: string;
    expiresAt: string;
    password: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveShortLink: () => Promise<void>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  pages: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
  forms: Array<{
    id: string;
    title: string;
    slug: string;
  }>;
}

const AddShortLinkModal: React.FC<AddShortLinkModalProps> = ({
  show,
  onHide,
  newShortLink,
  handleInputChange,
  handleSaveShortLink,
  categories,
  pages,
  forms
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Short Link</Modal.Title>
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
                  value={newShortLink.title}
                  onChange={handleInputChange}
                  placeholder="My Short Link"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Short Code (optional)</Form.Label>
                <Form.Control 
                  type="text" 
                  name="shortCode"
                  value={newShortLink.shortCode}
                  onChange={handleInputChange}
                  placeholder="Leave blank for auto-generated code"
                />
                <Form.Text className="text-muted">
                  Custom short code or leave blank to auto-generate
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Link Type</Form.Label>
            <Form.Select 
              name="linkType"
              value={newShortLink.linkType}
              onChange={handleInputChange}
              required
            >
              <option value="url">URL</option>
              <option value="page">Page</option>
              <option value="form">Form</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Select the type of content this short link should redirect to
            </Form.Text>
          </Form.Group>
          
          {newShortLink.linkType === 'url' && (
            <Form.Group className="mb-3">
              <Form.Label>Original URL</Form.Label>
              <Form.Control 
                type="url" 
                name="originalUrl"
                value={newShortLink.originalUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/very/long/url/to/shorten"
                required
              />
            </Form.Group>
          )}
          
          {newShortLink.linkType === 'page' && (
            <Form.Group className="mb-3">
              <Form.Label>Select Page</Form.Label>
              <Form.Select 
                name="pageId"
                value={newShortLink.pageId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Page</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>{page.title}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the page this short link should redirect to
              </Form.Text>
            </Form.Group>
          )}
          
          {newShortLink.linkType === 'form' && (
            <Form.Group className="mb-3">
              <Form.Label>Select Form</Form.Label>
              <Form.Select 
                name="formId"
                value={newShortLink.formId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Form</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>{form.title}</option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Select the form this short link should redirect to
              </Form.Text>
            </Form.Group>
          )}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status"
                  value={newShortLink.status}
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
                  value={newShortLink.categoryId}
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
                  value={newShortLink.expiresAt}
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
                  value={newShortLink.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank for no password"
                />
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
          onClick={handleSaveShortLink}
          disabled={
            (newShortLink.linkType === 'url' && !newShortLink.originalUrl) || 
            (newShortLink.linkType === 'page' && !newShortLink.pageId) || 
            (newShortLink.linkType === 'form' && !newShortLink.formId)
          }
        >
          <FaSave className="me-2" />
          Create Short Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddShortLinkModal;
