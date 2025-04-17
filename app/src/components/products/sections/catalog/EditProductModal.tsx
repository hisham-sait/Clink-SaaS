import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditProductModalProps {
  show: boolean;
  onHide: () => void;
  selectedProduct: any;
  editedProduct: {
    name: string;
    sku: string;
    description: string;
    type: string;
    status: string;
    categoryId: string;
    familyId: string;
  };
  categories: any[];
  families: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateProduct: () => Promise<void>;
}

const EditProductModal: React.FC<EditProductModalProps> = ({
  show,
  onHide,
  selectedProduct,
  editedProduct,
  categories,
  families,
  handleInputChange,
  handleUpdateProduct
}) => {
  if (!selectedProduct) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Product</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={editedProduct.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>SKU</Form.Label>
                <Form.Control 
                  type="text" 
                  name="sku"
                  value={editedProduct.sku}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={editedProduct.description}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select 
                  name="type"
                  value={editedProduct.type}
                  onChange={handleInputChange}
                >
                  <option value="PHYSICAL">Physical</option>
                  <option value="DIGITAL">Digital</option>
                  <option value="SERVICE">Service</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select 
                  name="status"
                  value={editedProduct.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Draft">Draft</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select 
                  name="categoryId"
                  value={editedProduct.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category: any) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Family</Form.Label>
                <Form.Select 
                  name="familyId"
                  value={editedProduct.familyId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Family</option>
                  {families.map((family: any) => (
                    <option key={family.id} value={family.id}>{family.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateProduct}>
          <FaSave className="me-2" />
          Update Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProductModal;
