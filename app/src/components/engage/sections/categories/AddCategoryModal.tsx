import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddCategoryModalProps {
  show: boolean;
  onHide: () => void;
  newCategory: {
    name: string;
    type: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveCategory: () => Promise<void>;
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  show,
  onHide,
  newCategory,
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
            <Form.Label>Category Type</Form.Label>
            <Form.Select 
              name="type"
              value={newCategory.type}
              onChange={handleInputChange}
              required
            >
              <option value="form">Form</option>
              <option value="survey">Survey</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Select whether this category is for forms or surveys.
            </Form.Text>
          </Form.Group>
          <Row>
            <Col>
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
