import React from 'react';
import { Modal, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';

interface EditAttributeModalProps {
  show: boolean;
  onHide: () => void;
  selectedAttribute: {
    id: string;
    name: string;
    code: string;
    type: string;
    isRequired: boolean;
    isUnique: boolean;
    isLocalizable: boolean;
    isScopable: boolean;
    options: string;
    tableConfig?: {
      columns: Array<{ name: string; key: string }>;
    };
    sectionId: string;
    usage?: {
      productCount: number;
      familyCount: number;
    };
  } | null;
  attributeTypes: Array<{ value: string; label: string; color: string }>;
  sections: any[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateAttribute: () => Promise<void>;
}

const EditAttributeModal: React.FC<EditAttributeModalProps> = ({
  show,
  onHide,
  selectedAttribute,
  attributeTypes,
  sections,
  handleInputChange,
  handleUpdateAttribute
}) => {
  if (!selectedAttribute) return null;

  // Render TABLE configuration UI
  const renderTableConfig = () => {
    if (selectedAttribute?.type !== 'TABLE') return null;
    
    return (
      <Form.Group className="mb-3">
        <Form.Label>Table Configuration</Form.Label>
        <div className="border rounded p-3 mb-2">
          <p className="text-muted mb-2">
            This attribute will store data in a table format, perfect for nutritional information.
          </p>
          <div className="mb-2">
            <strong>Default Columns:</strong>
          </div>
          <ul className="list-unstyled">
            <li><Badge bg="secondary" className="me-2">Name</Badge> e.g., Calories, Fat, Protein</li>
            <li><Badge bg="secondary" className="me-2">Value</Badge> e.g., 120, 5, 10</li>
            <li><Badge bg="secondary" className="me-2">Unit</Badge> e.g., kcal, g, g</li>
          </ul>
        </div>
        <Form.Text className="text-muted">
          The table structure is pre-configured for nutritional information. Products using this attribute will be able to add multiple rows of data.
        </Form.Text>
      </Form.Group>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size={selectedAttribute.type === 'TABLE' ? 'lg' : undefined}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Attribute</Modal.Title>
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
                  value={selectedAttribute.name}
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
                  value={selectedAttribute.code}
                  onChange={handleInputChange}
                  placeholder="e.g. color, size"
                />
                <Form.Text className="text-muted">
                  A unique identifier for the attribute. If left blank, it will be generated from the name.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Type</Form.Label>
                <Form.Select 
                  name="type"
                  value={selectedAttribute.type}
                  onChange={handleInputChange}
                >
                  {attributeTypes.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Section</Form.Label>
                <Form.Select 
                  name="sectionId"
                  value={selectedAttribute.sectionId || ''}
                  onChange={handleInputChange}
                >
                  <option value="">No Section</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>{section.name}</option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  Select a section to display this attribute in.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          {(selectedAttribute.type === 'SELECT' || selectedAttribute.type === 'MULTISELECT') && (
            <Form.Group className="mb-3">
              <Form.Label>Options</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3}
                name="options"
                value={selectedAttribute.options}
                onChange={handleInputChange}
                placeholder="Enter options, one per line"
              />
              <Form.Text className="text-muted">
                Enter one option per line. These will be the available choices for this attribute.
              </Form.Text>
            </Form.Group>
          )}
          
          {/* TABLE configuration */}
          {renderTableConfig()}
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="editIsRequired"
                  name="isRequired"
                  label="Required"
                  checked={selectedAttribute.isRequired}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  If checked, this attribute must have a value.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="editIsUnique"
                  name="isUnique"
                  label="Unique"
                  checked={selectedAttribute.isUnique}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  If checked, this attribute's value must be unique across products.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="editIsLocalizable"
                  name="isLocalizable"
                  label="Localizable"
                  checked={selectedAttribute.isLocalizable}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  If checked, this attribute can have different values per locale.
                </Form.Text>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Check 
                  type="checkbox"
                  id="editIsScopable"
                  name="isScopable"
                  label="Scopable"
                  checked={selectedAttribute.isScopable}
                  onChange={handleInputChange}
                />
                <Form.Text className="text-muted">
                  If checked, this attribute can have different values per channel.
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateAttribute}>
          <FaSave className="me-2" />
          Update Attribute
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditAttributeModal;
