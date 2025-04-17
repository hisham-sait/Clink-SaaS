import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditCategoryModalProps {
  show: boolean;
  onHide: () => void;
  selectedCategory: {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    linkCount: number;
    createdAt: string;
    updatedAt: string;
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
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              name="name"
              value={selectedCategory.name}
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
              value={selectedCategory.description || ''}
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
                value={selectedCategory.color || '#3498db'}
                onChange={handleInputChange}
                title="Choose category color"
                className="me-2"
                style={{ width: '50px', height: '38px' }}
              />
              <Form.Control 
                type="text" 
                name="color"
                value={selectedCategory.color || '#3498db'}
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
