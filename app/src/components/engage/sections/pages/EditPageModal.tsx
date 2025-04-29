import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { EngageTypes } from '../../../../services/engage';

interface EditPageModalProps {
  show: boolean;
  onHide: () => void;
  page: EngageTypes.PageData | null;
  editedPage: {
    title: string;
    description: string;
    categoryId: string;
    status: string;
    type: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdatePage: () => void;
  categories: EngageTypes.PageCategory[];
}

const EditPageModal: React.FC<EditPageModalProps> = ({
  show,
  onHide,
  page,
  editedPage,
  handleInputChange,
  handleUpdatePage,
  categories
}) => {
  if (!page) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Page</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={editedPage.title}
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
              value={editedPage.description}
              onChange={handleInputChange}
              placeholder="Enter page description (optional)"
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="categoryId"
              value={editedPage.categoryId}
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
              value={editedPage.status}
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
          onClick={handleUpdatePage}
          disabled={!editedPage.title}
        >
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditPageModal;
