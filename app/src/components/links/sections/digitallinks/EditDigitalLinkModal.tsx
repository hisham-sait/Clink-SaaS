import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditDigitalLinkModalProps {
  show: boolean;
  onHide: () => void;
  digitalLink: {
    id: string;
    title: string;
    gs1KeyType: string;
    gs1Key: string;
    gs1Url: string;
    productId: string | null;
    product?: {
      id: string;
      name: string;
    };
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
  editedDigitalLink: {
    title: string;
    gs1KeyType: string;
    gs1Key: string;
    productId: string;
    status: string;
    expiresAt: string;
    password: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateDigitalLink: () => Promise<void>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    sku: string;
  }>;
}

const EditDigitalLinkModal: React.FC<EditDigitalLinkModalProps> = ({
  show,
  onHide,
  digitalLink,
  editedDigitalLink,
  handleInputChange,
  handleUpdateDigitalLink,
  categories,
  products
}) => {
  if (!digitalLink) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Digital Link</Modal.Title>
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
                  value={editedDigitalLink.title}
                  onChange={handleInputChange}
                  placeholder="My Digital Link"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>GS1 Key Type</Form.Label>
                <Form.Control 
                  type="text" 
                  value={editedDigitalLink.gs1KeyType}
                  disabled
                />
                <Form.Text className="text-muted">
                  GS1 Key Type cannot be changed after creation
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>GS1 Key</Form.Label>
            <Form.Control 
              type="text" 
              value={editedDigitalLink.gs1Key}
              disabled
            />
            <Form.Text className="text-muted">
              GS1 Key cannot be changed after creation
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Product (optional)</Form.Label>
            <Form.Select 
              name="productId"
              value={editedDigitalLink.productId}
              onChange={handleInputChange}
            >
              <option value="">No Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.sku ? `(${product.sku})` : ''}
                </option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Link this digital link to a product in your catalog
            </Form.Text>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status"
                  value={editedDigitalLink.status}
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
                  value={editedDigitalLink.categoryId}
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
                  value={editedDigitalLink.expiresAt}
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
                  value={editedDigitalLink.password}
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
          onClick={handleUpdateDigitalLink}
        >
          <FaSave className="me-2" />
          Update Digital Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditDigitalLinkModal;
