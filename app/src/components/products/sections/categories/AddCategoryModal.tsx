import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddCategoryModalProps {
  show: boolean;
  onHide: () => void;
  newCategory: {
    parentId: string | null;
    name: string;
    code: string;
    level: number;
  };
  categories: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveCategory: () => Promise<void>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  show,
  onHide,
  newCategory,
  categories,
  handleInputChange,
  handleSaveCategory
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Parent Category</Form.Label>
            <Form.Select 
              name="parentId"
              value={newCategory.parentId || ''}
              onChange={handleInputChange}
            >
              <option value="">No Parent (Root Category)</option>
              {categories
                .filter(cat => cat.level < 2) // Only allow 2 levels of nesting
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select a parent category or leave empty for a root category.
            </Form.Text>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="code"
                  value={newCategory.code}
                  onChange={handleInputChange}
                  placeholder="e.g. electronics, clothing"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the category. If left blank, it will be generated from the name.
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
          onClick={handleSaveCategory}
          disabled={!newCategory.name}
        >
          <FaSave className="me-2" />
          Save Category
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddCategoryModal;
