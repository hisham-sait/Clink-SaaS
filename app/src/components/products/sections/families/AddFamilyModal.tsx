import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface AddFamilyModalProps {
  show: boolean;
  onHide: () => void;
  newFamily: {
    name: string;
    code: string;
    description: string;
    status?: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSaveFamily: () => Promise<void>;
}

const AddFamilyModal: React.FC<AddFamilyModalProps> = ({
  show,
  onHide,
  newFamily,
  handleInputChange,
  handleSaveFamily
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Family</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                  type="text" 
                  name="name"
                  value={newFamily.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Code</Form.Label>
                <Form.Control 
                  type="text" 
                  name="code"
                  value={newFamily.code}
                  onChange={handleInputChange}
                  placeholder="e.g. electronics, clothing"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the family. If left blank, it will be generated from the name.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3}
              name="description"
              value={newFamily.description}
              onChange={handleInputChange}
              placeholder="Optional description"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              name="status"
              value={newFamily.status || 'ACTIVE'}
              onChange={handleInputChange}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="DRAFT">Draft</option>
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
          onClick={handleSaveFamily}
          disabled={!newFamily.name}
        >
          <FaSave className="me-2" />
          Save Family
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFamilyModal;
