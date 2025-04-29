import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddProductModalProps {
  show: boolean;
  onHide: () => void;
  newProduct: {
    name: string;
    sku: string;
    description: string;
    type: string;
    status: string;
    categoryId: string | null;
    familyId: string | null;
  };
  categories: any[];
  families: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveProduct: () => Promise<void>;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  show,
  onHide,
  newProduct,
  categories,
  families,
  handleInputChange,
  handleSaveProduct
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Add New Product</Modal.Title>
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
                  value={newProduct.name}
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
                  value={newProduct.sku}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  Will be automatically generated if left empty
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={newProduct.description}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select 
                  name="type"
                  value={newProduct.type}
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
                  value={newProduct.status}
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
                  value={newProduct.categoryId || ''}
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
                  value={newProduct.familyId || ''}
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
        <Button variant="primary" onClick={handleSaveProduct}>
          <FaSave className="me-2" />
          Save Product
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddProductModal;
