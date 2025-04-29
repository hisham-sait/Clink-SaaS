import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { EngageTypes } from '../../../../services/engage';

interface AddPageModalProps {
  show: boolean;
  onHide: () => void;
  newPage: {
    title: string;
    description: string;
    categoryId: string;
    status: string;
    type: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSavePage: () => void;
  categories: EngageTypes.PageCategory[];
}

const AddPageModal: React.FC<AddPageModalProps> = ({
  show,
  onHide,
  newPage,
  handleInputChange,
  handleSavePage,
  categories
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Page</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={newPage.title}
              onChange={handleInputChange}
              placeholder="Enter page title"
              required
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={newPage.description}
              onChange={handleInputChange}
              placeholder="Enter page description (optional)"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="categoryId"
              value={newPage.categoryId}
              onChange={handleInputChange}
            >
              <option value="">Select a category (optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={newPage.status}
              onChange={handleInputChange}
            >
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
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
          onClick={handleSavePage}
          disabled={!newPage.title}
        >
          Create & Design
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddPageModal;
