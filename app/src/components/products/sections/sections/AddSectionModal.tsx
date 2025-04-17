import React from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddSectionModalProps {
  show: boolean;
  onHide: () => void;
  newSection: {
    name: string;
    code: string;
    description: string;
    displayIn: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveSection: () => Promise<void>;
}

const AddSectionModal: React.FC<AddSectionModalProps> = ({
  show,
  onHide,
  newSection,
  handleInputChange,
  handleSaveSection
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Section</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control 
              type="text" 
              name="name"
              value={newSection.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Code</Form.Label>
            <Form.Control 
              type="text" 
              name="code"
              value={newSection.code}
              onChange={handleInputChange}
              placeholder="e.g. technical-specs, dimensions"
            />
            <Form.Text className="text-muted">
              A unique identifier for the section. If left blank, it will be generated from the name.
            </Form.Text>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={newSection.description}
              onChange={handleInputChange}
              placeholder="Describe the purpose of this section"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Display In</Form.Label>
            <Form.Select
              name="displayIn"
              value={newSection.displayIn}
              onChange={handleInputChange}
            >
              <option value="both">Both Panels</option>
              <option value="left">Left Panel Only</option>
              <option value="right">Right Panel Only</option>
            </Form.Select>
            <Form.Text className="text-muted">
              Choose where this section should be displayed in the product view.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSaveSection}
          disabled={!newSection.name}
        >
          <FaSave className="me-2" />
          Save Section
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddSectionModal;
