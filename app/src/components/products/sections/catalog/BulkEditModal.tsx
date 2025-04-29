import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface BulkEditModalProps {
  show: boolean;
  onHide: () => void;
  selectedProducts: string[];
  editedProduct: {
    status: string;
    categoryId: string | null;
    familyId: string | null;
    [key: string]: string | null;
  };
  categories: any[];
  families: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleBulkUpdate: () => Promise<void>;
}

const BulkEditModal: React.FC<BulkEditModalProps> = ({
  show,
  onHide,
  selectedProducts,
  editedProduct,
  categories,
  families,
  handleInputChange,
  handleBulkUpdate
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Bulk Edit Products</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You are editing {selectedProducts.length} products.</p>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              name="status"
              value={editedProduct.status}
              onChange={handleInputChange}
            >
              <option value="">No Change</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Draft">Draft</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Leave as "No Change" to keep the current status for each product.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select 
              name="categoryId"
              value={editedProduct.categoryId || ''}
              onChange={handleInputChange}
            >
              <option value="">No Change</option>
              {categories.map((category: any) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Leave as "No Change" to keep the current category for each product.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Family</Form.Label>
            <Form.Select 
              name="familyId"
              value={editedProduct.familyId || ''}
              onChange={handleInputChange}
            >
              <option value="">No Change</option>
              {families.map((family: any) => (
                <option key={family.id} value={family.id}>{family.name}</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Leave as "No Change" to keep the current family for each product.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleBulkUpdate}
        >
          <FaSave className="me-2" />
          Update Products
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BulkEditModal;
