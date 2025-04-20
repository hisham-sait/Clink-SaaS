import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface EditFormModalProps {
  show: boolean;
  onHide: () => void;
  form: {
    id: string;
    title: string;
    type: string;
    status: string;
    categoryId: string;
  } | null;
  editedForm: {
    title: string;
    type: string;
    status: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateForm: () => void;
  categories: { id: string; name: string }[];
}

const EditFormModal: React.FC<EditFormModalProps> = ({
  show,
  onHide,
  form,
  editedForm,
  handleInputChange,
  handleUpdateForm,
  categories
}) => {
  if (!form) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Form</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Form Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editedForm.title}
                  onChange={handleInputChange}
                  placeholder="Enter form title"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Form Type</Form.Label>
                <Form.Select
                  name="type"
                  value={editedForm.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select type</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Registration">Registration</option>
                  <option value="Contact">Contact</option>
                  <option value="Survey">Survey</option>
                  <option value="Satisfaction">Satisfaction</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={editedForm.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={editedForm.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              onChange={handleInputChange}
              placeholder="Enter form description"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateForm}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditFormModal;
