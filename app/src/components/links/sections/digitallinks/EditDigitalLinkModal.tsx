import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditDigitalLinkModalProps {
  show: boolean;
  onHide: () => void;
  digitalLink: {
    id: string;
    title: string;
    type: string;
    gs1KeyType: string;
    gs1Key: string;
    gs1Url?: string;
    redirectType: string;
    customUrl?: string | null;
    productId?: string | null;
    product?: {
      id: string;
      name: string;
    };
    status: string;
    expiresAt?: string | null;
    password?: string | null;
    categoryId?: string | null;
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
    type: string;
    gs1KeyType: string;
    gs1Key: string;
    redirectType: string;
    customUrl: string;
    productId: string;
    pageId: string;
    formId: string;
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

const EditDigitalLinkModal: React.FC<EditDigitalLinkModalProps> = ({
  show,
  onHide,
  digitalLink,
  editedDigitalLink,
  handleInputChange,
  handleUpdateDigitalLink,
  categories,
  products,
  pages,
  forms
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
                <Form.Label>Type</Form.Label>
                <Form.Select 
                  name="type"
                  value={editedDigitalLink.type}
                  onChange={handleInputChange}
                >
                  <option value="ProductInfo">Product Info</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Support">Support</option>
                  <option value="Warranty">Warranty</option>
                  <option value="Instructions">Instructions</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
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
            <Col md={6}>
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
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Redirect Type</Form.Label>
            <Form.Select 
              name="redirectType"
              value={editedDigitalLink.redirectType}
              onChange={handleInputChange}
              required
            >
              <option value="standard">Standard (Product Page)</option>
              <option value="custom">Custom URL</option>
              <option value="page">Page</option>
              <option value="form">Form</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Choose how this digital link should redirect
            </Form.Text>
          </Form.Group>
          
          {editedDigitalLink.redirectType === 'custom' && (
            <Form.Group className="mb-3">
              <Form.Label>Custom URL</Form.Label>
              <Form.Control 
                type="url" 
                name="customUrl"
                value={editedDigitalLink.customUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/my-custom-page"
                required
              />
              <Form.Text className="text-muted">
                Enter the full URL where this digital link should redirect
              </Form.Text>
            </Form.Group>
          )}
          
          {editedDigitalLink.redirectType === 'standard' && (
            <Form.Group className="mb-3">
              <Form.Label>Product</Form.Label>
              <Form.Select 
                name="productId"
                value={editedDigitalLink.productId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Product</option>
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
          )}
          
          {editedDigitalLink.redirectType === 'page' && (
            <Form.Group className="mb-3">
              <Form.Label>Page</Form.Label>
              <Form.Select 
                name="pageId"
                value={editedDigitalLink.pageId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Page</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Link this digital link to a page
              </Form.Text>
            </Form.Group>
          )}
          
          {editedDigitalLink.redirectType === 'form' && (
            <Form.Group className="mb-3">
              <Form.Label>Form</Form.Label>
              <Form.Select 
                name="formId"
                value={editedDigitalLink.formId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a Form</option>
                {forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.title}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Link this digital link to a form
              </Form.Text>
            </Form.Group>
          )}
          
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
          disabled={
            (editedDigitalLink.redirectType === 'custom' && !editedDigitalLink.customUrl) || 
            (editedDigitalLink.redirectType === 'standard' && !editedDigitalLink.productId) ||
            (editedDigitalLink.redirectType === 'page' && !editedDigitalLink.pageId) ||
            (editedDigitalLink.redirectType === 'form' && !editedDigitalLink.formId)
          }
        >
          <FaSave className="me-2" />
          Update Digital Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditDigitalLinkModal;
