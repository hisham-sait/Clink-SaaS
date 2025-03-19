import React, { useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { Proposal } from '../../../crm/types';

interface SaveTemplateModalProps {
  show: boolean;
  onHide: () => void;
  proposal: Proposal;
  onSave: (templateName: string, templateDescription: string) => void;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  show,
  onHide,
  proposal,
  onSave
}) => {
  const [templateName, setTemplateName] = useState(proposal.name + ' Template');
  const [templateDescription, setTemplateDescription] = useState('');
  const [validated, setValidated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    onSave(templateName, templateDescription);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Save as Template</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-muted mb-4">
            Save this proposal as a template that can be reused for future proposals.
          </p>
          
          <Form.Group className="mb-3">
            <Form.Label>Template Name</Form.Label>
            <Form.Control
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a template name.
            </Form.Control.Feedback>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Describe what this template is for..."
              value={templateDescription}
              onChange={(e) => setTemplateDescription(e.target.value)}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox" 
              label="Include section content" 
              defaultChecked
            />
            <Form.Text className="text-muted">
              If checked, the content of each section will be included in the template.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Check 
              type="checkbox" 
              label="Make template available to all team members" 
              defaultChecked
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Template
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SaveTemplateModal;
