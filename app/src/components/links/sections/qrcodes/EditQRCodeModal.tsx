import React from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { LinksTypes } from '../../../../services/links';

interface EditQRCodeModalProps {
  show: boolean;
  onHide: () => void;
  qrCode: LinksTypes.QRCode;
  editedQRCode: {
    title: string;
    content: string;
    contentType: string;
    config: any;
    status: LinksTypes.LinkStatus;
    expiresAt: string;
    categoryId: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleUpdateQRCode: () => void;
  categories: LinksTypes.Category[];
}

const EditQRCodeModal: React.FC<EditQRCodeModalProps> = ({
  show,
  onHide,
  qrCode,
  editedQRCode,
  handleInputChange,
  handleUpdateQRCode,
  categories
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit QR Code</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row className="mb-2">
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editedQRCode.title}
                  onChange={handleInputChange}
                  placeholder="Enter a title for your QR code"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Content Type</Form.Label>
                <Form.Select
                  name="contentType"
                  value={editedQRCode.contentType}
                  onChange={handleInputChange}
                >
                  <option value="url">URL</option>
                  <option value="text">Text</option>
                  <option value="vcard">vCard (Contact)</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="wifi">WiFi</option>
                  <option value="location">Location</option>
                  <option value="phone">Phone Number</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Content</Form.Label>
            {editedQRCode.contentType === 'url' && (
              <Form.Control
                type="url"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            )}
            {editedQRCode.contentType === 'text' && (
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="Enter text content"
              />
            )}
            {editedQRCode.contentType === 'vcard' && (
              <Form.Control
                as="textarea"
                rows={3}
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="BEGIN:VCARD
VERSION:3.0
N:Doe;John;;;
FN:John Doe
ORG:Example Corp.
TITLE:Software Engineer
TEL;TYPE=WORK,VOICE:(123) 456-7890
EMAIL:john.doe@example.com
END:VCARD"
              />
            )}
            {editedQRCode.contentType === 'email' && (
              <Form.Control
                type="email"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="mailto:example@example.com?subject=Subject&body=Body"
              />
            )}
            {editedQRCode.contentType === 'sms' && (
              <Form.Control
                type="text"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="sms:+1234567890?body=Hello"
              />
            )}
            {editedQRCode.contentType === 'wifi' && (
              <Form.Control
                type="text"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="WIFI:S:SSID;T:WPA;P:password;;"
              />
            )}
            {editedQRCode.contentType === 'location' && (
              <Form.Control
                type="text"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="geo:37.786971,-122.399677"
              />
            )}
            {editedQRCode.contentType === 'phone' && (
              <Form.Control
                type="tel"
                name="content"
                value={editedQRCode.content}
                onChange={handleInputChange}
                placeholder="tel:+1234567890"
              />
            )}
          </Form.Group>

          <Row className="mb-2">
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="categoryId"
                  value={editedQRCode.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="2">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={editedQRCode.status}
                  onChange={handleInputChange}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Expiration Date (Optional)</Form.Label>
            <Form.Control
              type="date"
              name="expiresAt"
              value={editedQRCode.expiresAt}
              onChange={handleInputChange}
            />
            <Form.Text className="text-muted">
              Leave blank if the QR code should not expire.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleUpdateQRCode}>
          Update QR Code
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditQRCodeModal;
