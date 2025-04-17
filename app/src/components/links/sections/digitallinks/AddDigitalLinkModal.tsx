import React, { useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddDigitalLinkModalProps {
  show: boolean;
  onHide: () => void;
  newDigitalLink: {
    title: string;
    type: string;
    gs1Key: string;
    gs1KeyType: string;
    redirectType: string;
    customUrl: string;
    productId: string;
    status: string;
    expiresAt: string;
    password: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveDigitalLink: () => Promise<void>;
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

const AddDigitalLinkModal: React.FC<AddDigitalLinkModalProps> = ({
  show,
  onHide,
  newDigitalLink,
  handleInputChange,
  handleSaveDigitalLink,
  categories,
  products
}) => {
  // Update customUrl field visibility based on redirectType
  useEffect(() => {
    const customUrlField = document.getElementById('customUrl');
    const productIdField = document.getElementById('productId');
    
    if (customUrlField && productIdField) {
      if (newDigitalLink.redirectType === 'custom') {
        customUrlField.classList.remove('d-none');
        productIdField.classList.add('d-none');
      } else {
        customUrlField.classList.add('d-none');
        productIdField.classList.remove('d-none');
      }
    }
  }, [newDigitalLink.redirectType]);

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Digital Link</Modal.Title>
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
                  value={newDigitalLink.title}
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
                  value={newDigitalLink.type}
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
                <Form.Select 
                  name="gs1KeyType"
                  value={newDigitalLink.gs1KeyType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="GTIN">GTIN</option>
                  <option value="GLN">GLN</option>
                  <option value="SSCC">SSCC</option>
                  <option value="GRAI">GRAI</option>
                  <option value="GIAI">GIAI</option>
                  <option value="GSRN">GSRN</option>
                  <option value="GDTI">GDTI</option>
                  <option value="GINC">GINC</option>
                  <option value="GSIN">GSIN</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>GS1 Key</Form.Label>
                <Form.Control 
                  type="text" 
                  name="gs1Key"
                  value={newDigitalLink.gs1Key}
                  onChange={handleInputChange}
                  placeholder="Enter GS1 Key (e.g., 12345678901234)"
                  required
                />
                <Form.Text className="text-muted">
                  Enter the GS1 Key value without application identifiers
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>Redirect Type</Form.Label>
            <Form.Select 
              name="redirectType"
              value={newDigitalLink.redirectType}
              onChange={handleInputChange}
              required
            >
              <option value="standard">Standard (Product Page)</option>
              <option value="custom">Custom URL</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Choose how this digital link should redirect
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3" id="customUrl">
            <Form.Label>Custom URL</Form.Label>
            <Form.Control 
              type="url" 
              name="customUrl"
              value={newDigitalLink.customUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/my-custom-page"
              required={newDigitalLink.redirectType === 'custom'}
            />
            <Form.Text className="text-muted">
              Enter the full URL where this digital link should redirect
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3" id="productId">
            <Form.Label>Product</Form.Label>
            <Form.Select 
              name="productId"
              value={newDigitalLink.productId}
              onChange={handleInputChange}
              required={newDigitalLink.redirectType === 'standard'}
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
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status"
                  value={newDigitalLink.status}
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
                  value={newDigitalLink.categoryId}
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
                  value={newDigitalLink.expiresAt}
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
                  value={newDigitalLink.password}
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
          onClick={handleSaveDigitalLink}
          disabled={!newDigitalLink.gs1Key || 
                   (newDigitalLink.redirectType === 'custom' && !newDigitalLink.customUrl) || 
                   (newDigitalLink.redirectType === 'standard' && !newDigitalLink.productId)}
        >
          <FaSave className="me-2" />
          Create Digital Link
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddDigitalLinkModal;
