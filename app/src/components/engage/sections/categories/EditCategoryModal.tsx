import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    name: string;
    type: string;
  } | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateCategory: () => Promise<void>;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  show,
  onHide,
  selectedCategory,
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
            <Form.Label>Category Type</Form.Label>
            <Form.Control 
              type="text" 
              value={selectedCategory.type === 'form' ? 'Form' : 'Survey'}
              disabled
            />
            <Form.Text className="text-muted">
              Category type cannot be changed after creation.
            </Form.Text>
          </Form.Group>
          <Row>
            <Col>
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
          </Row>
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
