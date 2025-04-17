import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditFamilyModalProps {
  show: boolean;
  onHide: () => void;
  selectedFamily: {
    id: string;
    name: string;
    code: string;
    description: string;
    status: string;
    attributeCount?: number;
    productCount?: number;
  } | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateFamily: () => Promise<void>;
}

const EditFamilyModal: React.FC<EditFamilyModalProps> = ({
  show,
  onHide,
  selectedFamily,
  handleInputChange,
  handleUpdateFamily
}) => {
  if (!selectedFamily) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Family</Modal.Title>
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
                  value={selectedFamily.name}
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
                  value={selectedFamily.code}
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
              value={selectedFamily.description}
              onChange={handleInputChange}
              placeholder="Optional description"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select 
              name="status"
              value={selectedFamily.status}
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
          onClick={handleUpdateFamily}
          disabled={!selectedFamily.name}
        >
          <FaSave className="me-2" />
          Update Family
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditFamilyModal;
