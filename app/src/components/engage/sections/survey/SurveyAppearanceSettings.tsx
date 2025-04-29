import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaPalette } from 'react-icons/fa';

interface SurveyAppearanceProps {
  appearance: {
    backgroundColor: string;
    backgroundImage: string;
    fontFamily: string;
    primaryColor: string;
    secondaryColor: string;
    textColor: string;
    borderRadius: string;
    boxShadow: string;
    headerAlignment: string;
    buttonStyle: string;
    sectionTitleColor: string;
    sectionDividerColor: string;
    questionSpacing: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const SurveyAppearanceSettings: React.FC<SurveyAppearanceProps> = ({ appearance, onChange }) => {
  return (
    <div className="survey-appearance-settings">
      <div className="d-flex align-items-center mb-3">
        <FaPalette className="me-2" />
        <h5 className="mb-0">Survey Appearance</h5>
      </div>

      <Form>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Background Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="backgroundColor"
                  value={appearance.backgroundColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="backgroundColor"
                  value={appearance.backgroundColor}
                  onChange={onChange}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Background Image URL</Form.Label>
              <Form.Control
                type="text"
                name="backgroundImage"
                value={appearance.backgroundImage}
                onChange={onChange}
                placeholder="https://example.com/image.jpg"
              />
              <Form.Text className="text-muted">
                Leave empty for solid background color
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Font Family</Form.Label>
              <Form.Select name="fontFamily" value={appearance.fontFamily} onChange={onChange}>
                <option value="Arial, sans-serif">Arial</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="'Times New Roman', Times, serif">Times New Roman</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Courier New', Courier, monospace">Courier New</option>
                <option value="Verdana, Geneva, sans-serif">Verdana</option>
                <option value="'Segoe UI', Tahoma, Geneva, sans-serif">Segoe UI</option>
                <option value="'Roboto', sans-serif">Roboto</option>
                <option value="'Open Sans', sans-serif">Open Sans</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Text Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="textColor"
                  value={appearance.textColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="textColor"
                  value={appearance.textColor}
                  onChange={onChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Primary Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="primaryColor"
                  value={appearance.primaryColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="primaryColor"
                  value={appearance.primaryColor}
                  onChange={onChange}
                />
              </div>
              <Form.Text className="text-muted">
                Used for buttons and accents
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Secondary Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="secondaryColor"
                  value={appearance.secondaryColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="secondaryColor"
                  value={appearance.secondaryColor}
                  onChange={onChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Section Title Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="sectionTitleColor"
                  value={appearance.sectionTitleColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="sectionTitleColor"
                  value={appearance.sectionTitleColor}
                  onChange={onChange}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Section Divider Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="sectionDividerColor"
                  value={appearance.sectionDividerColor}
                  onChange={onChange}
                  className="me-2"
                  style={{ width: '50px' }}
                />
                <Form.Control
                  type="text"
                  name="sectionDividerColor"
                  value={appearance.sectionDividerColor}
                  onChange={onChange}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Border Radius</Form.Label>
              <Form.Control
                type="text"
                name="borderRadius"
                value={appearance.borderRadius}
                onChange={onChange}
                placeholder="10px"
              />
              <Form.Text className="text-muted">
                e.g., 0px, 5px, 10px, etc.
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Box Shadow</Form.Label>
              <Form.Control
                type="text"
                name="boxShadow"
                value={appearance.boxShadow}
                onChange={onChange}
                placeholder="0 0 20px rgba(0, 0, 0, 0.1)"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Header Alignment</Form.Label>
              <Form.Select
                name="headerAlignment"
                value={appearance.headerAlignment}
                onChange={onChange}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Button Style</Form.Label>
              <Form.Select
                name="buttonStyle"
                value={appearance.buttonStyle}
                onChange={onChange}
              >
                <option value="default">Default</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="outline">Outline</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Question Spacing</Form.Label>
              <Form.Control
                type="text"
                name="questionSpacing"
                value={appearance.questionSpacing}
                onChange={onChange}
                placeholder="20px"
              />
              <Form.Text className="text-muted">
                Space between questions (e.g., 15px, 20px, 30px)
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default SurveyAppearanceSettings;
