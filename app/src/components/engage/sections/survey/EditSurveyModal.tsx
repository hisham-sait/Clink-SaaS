import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

interface EditSurveyModalProps {
  show: boolean;
  onHide: () => void;
  survey: {
    id: string;
    title: string;
    description?: string;
    status: string;
    categoryId: string;
  } | null;
  editedSurvey: {
    title: string;
    description?: string;
    status: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateSurvey: () => void;
  categories: { id: string; name: string }[];
}

const EditSurveyModal: React.FC<EditSurveyModalProps> = ({
  show,
  onHide,
  survey,
  editedSurvey,
  handleInputChange,
  handleUpdateSurvey,
  categories
}) => {
  if (!survey) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Survey</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Survey Title</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={editedSurvey.title}
              onChange={handleInputChange}
              placeholder="Enter survey title"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={editedSurvey.description}
              onChange={handleInputChange}
              placeholder="Enter survey description"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={editedSurvey.categoryId}
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
                  value={editedSurvey.status}
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
            <Form.Label>Survey Settings</Form.Label>
            <div className="border rounded p-3">
              <Form.Check 
                type="checkbox"
                id="allowAnonymousResponses"
                label="Allow anonymous responses"
                defaultChecked
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="requireAllQuestions"
                label="Require all questions by default"
                defaultChecked
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="showProgressBar"
                label="Show progress bar"
                defaultChecked
                className="mb-2"
              />
              <Form.Check 
                type="checkbox"
                id="allowMultipleResponses"
                label="Allow multiple responses from same user"
                className="mb-2"
              />
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateSurvey}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditSurveyModal;
