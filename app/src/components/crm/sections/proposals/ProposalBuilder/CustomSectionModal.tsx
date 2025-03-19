import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';

interface CustomSectionModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (section: { title: string; content: string }) => void;
}

const CustomSectionModal: React.FC<CustomSectionModalProps> = ({
  show,
  onHide,
  onSave
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }
    
    onSave({
      title,
      content: `<h2>${title}</h2><p>${content}</p>`
    });
    
    // Reset form
    setTitle('');
    setContent('');
    setValidated(false);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Create Custom Section</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-4">
            Create a custom section for your proposal. You can add any content you want.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Section Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Project Scope, Deliverables, Terms & Conditions"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a section title.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Section Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Enter the content for this section..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide section content.
            </Form.Control.Feedback>
            <Form.Text className="text-muted">
              In the future, a rich text editor will be available for formatting.
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Add Section
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CustomSectionModal;
