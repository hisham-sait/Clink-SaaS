import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddCategoryModalProps {
  show: boolean;
  onHide: () => void;
  newCategory: {
    name: string;
    description: string;
    color: string;
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
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              name="name"
              value={newCategory.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={newCategory.description}
              onChange={handleInputChange}
              placeholder="Optional description"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Color</Form.Label>
            <div className="d-flex align-items-center">
              <Form.Control 
                type="color" 
                name="color"
                value={newCategory.color}
                onChange={handleInputChange}
                title="Choose category color"
                className="me-2"
                style={{ width: '50px', height: '38px' }}
              />
              <Form.Control 
                type="text" 
                name="color"
                value={newCategory.color}
                onChange={handleInputChange}
                placeholder="#3498db"
              />
            </div>
          </Form.Group>
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
