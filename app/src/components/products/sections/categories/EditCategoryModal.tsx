import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    parentId: string | null;
    name: string;
    code: string;
    level: number;
    description?: string;
    status?: string;
  } | null;
  categories: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateCategory: () => Promise<void>;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  show,
  onHide,
  selectedCategory,
  categories,
  handleInputChange,
  handleUpdateCategory
}) => {
  if (!selectedCategory) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Parent Category</Form.Label>
            <Form.Select 
              name="parentId"
              value={selectedCategory.parentId || ''}
              onChange={handleInputChange}
              disabled={selectedCategory.level === 0} // Root categories can't have parents
            >
              <option value="">No Parent (Root Category)</option>
              {categories
                .filter(cat => cat.id !== selectedCategory.id && cat.level < 2) // Prevent self-reference and only allow 2 levels of nesting
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </Form.Select>
            <Form.Text className="text-muted">
              {selectedCategory.level === 0 
                ? "Root categories cannot have a parent category." 
                : "Select a parent category or leave empty for a root category."}
            </Form.Text>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={selectedCategory.name}
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
                  value={selectedCategory.code}
                  onChange={handleInputChange}
                  placeholder="e.g. electronics, clothing"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the category. If left blank, it will be generated from the name.
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
              value={selectedCategory.description || ''}
              onChange={handleInputChange}
              placeholder="Optional description"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              name="status"
              value={selectedCategory.status || 'ACTIVE'}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleUpdateCategory}
          disabled={!selectedCategory.name}
        >
          <FaSave className="me-2" />
          Update Category
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditCategoryModal;
