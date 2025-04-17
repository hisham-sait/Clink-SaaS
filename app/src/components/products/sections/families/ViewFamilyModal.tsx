import React from 'react';
import { Modal, Button, Row, Col, Table } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';

interface ViewFamilyModalProps {
  show: boolean;
  onHide: () => void;
  selectedFamily: {
    id: string;
    name: string;
    code: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    _count?: {
      requiredAttributes?: number;
      products?: number;
    };
    requiredAttributes?: Array<{
      id: string;
      isRequired: boolean;
      attribute: {
        id: string;
        name: string;
        type: string;
      };
    }>;
  } | null;
  onEdit: () => void;
}

const ViewFamilyModal: React.FC<ViewFamilyModalProps> = ({
  show,
  onHide,
  selectedFamily,
  onEdit
}) => {
  if (!selectedFamily) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Family Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={6}>
            <p><strong>Name:</strong> {selectedFamily.name}</p>
            <p><strong>Code:</strong> {selectedFamily.code}</p>
            <p><strong>Created:</strong> {new Date(selectedFamily.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(selectedFamily.updatedAt).toLocaleDateString()}</p>
          </Col>
          <Col md={6}>
            <p><strong>Attributes:</strong> {selectedFamily._count?.requiredAttributes || 0}</p>
            <p><strong>Products:</strong> {selectedFamily._count?.products || 0}</p>
            <p><strong>Description:</strong> {selectedFamily.description || 'No description provided'}</p>
          </Col>
        </Row>

        <h6 className="mt-4">Required Attributes</h6>
        {selectedFamily.requiredAttributes && selectedFamily.requiredAttributes.length > 0 ? (
          <Table responsive>
            <thead>
              <tr>
                <th>Attribute</th>
                <th>Type</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              {selectedFamily.requiredAttributes.map((attr) => (
                <tr key={attr.id}>
                  <td>{attr.attribute.name}</td>
                  <td>{attr.attribute.type}</td>
                  <td>{attr.isRequired ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted">No attributes assigned to this family yet.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={onEdit}>
          <FaEdit className="me-2" />
          Edit Family
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewFamilyModal;
