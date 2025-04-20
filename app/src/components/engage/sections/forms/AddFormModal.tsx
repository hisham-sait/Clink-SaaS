import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface AddFormModalProps {
  show: boolean;
  onHide: () => void;
  newForm: {
    title: string;
    type: string;
    categoryId: string;
    status: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveForm: () => void;
  categories: { id: string; name: string }[];
}

const AddFormModal: React.FC<AddFormModalProps> = ({
  show,
  onHide,
  newForm,
  handleInputChange,
  handleSaveForm,
  categories
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Form</Modal.Title>
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
                  value={newForm.title}
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
                  value={newForm.type}
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
                  value={newForm.categoryId}
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
                  value={newForm.status}
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
        <Button variant="primary" onClick={handleSaveForm}>
          Create Form
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFormModal;
