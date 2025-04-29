import React, { useState, useEffect } from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { FaPalette, FaSearch } from 'react-icons/fa';

interface PageAppearanceProps {
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
    width: string;
    sectionTitleColor: string;
    sectionDividerColor: string;
    elementSpacing: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

// Google Fonts list - popular fonts
const googleFonts = [
  { name: 'Roboto', value: "'Roboto', sans-serif" },
  { name: 'Open Sans', value: "'Open Sans', sans-serif" },
  { name: 'Lato', value: "'Lato', sans-serif" },
  { name: 'Montserrat', value: "'Montserrat', sans-serif" },
  { name: 'Poppins', value: "'Poppins', sans-serif" },
  { name: 'Raleway', value: "'Raleway', sans-serif" },
  { name: 'Nunito', value: "'Nunito', sans-serif" },
  { name: 'Source Sans Pro', value: "'Source Sans Pro', sans-serif" },
  { name: 'PT Sans', value: "'PT Sans', sans-serif" },
  { name: 'Oswald', value: "'Oswald', sans-serif" },
  { name: 'Merriweather', value: "'Merriweather', serif" },
  { name: 'Ubuntu', value: "'Ubuntu', sans-serif" },
  { name: 'Playfair Display', value: "'Playfair Display', serif" },
  { name: 'Quicksand', value: "'Quicksand', sans-serif" },
  { name: 'Rubik', value: "'Rubik', sans-serif" },
  { name: 'Work Sans', value: "'Work Sans', sans-serif" },
  { name: 'Noto Sans', value: "'Noto Sans', sans-serif" },
  { name: 'Nunito Sans', value: "'Nunito Sans', sans-serif" },
  { name: 'Cabin', value: "'Cabin', sans-serif" },
  { name: 'Josefin Sans', value: "'Josefin Sans', sans-serif" },
  { name: 'Comfortaa', value: "'Comfortaa', cursive" },
  { name: 'Bitter', value: "'Bitter', serif" },
  { name: 'Crimson Text', value: "'Crimson Text', serif" },
  { name: 'Libre Baskerville', value: "'Libre Baskerville', serif" },
  { name: 'Karla', value: "'Karla', sans-serif" },
  { name: 'Fira Sans', value: "'Fira Sans', sans-serif" },
  { name: 'Mulish', value: "'Mulish', sans-serif" },
  { name: 'Barlow', value: "'Barlow', sans-serif" },
  { name: 'Dancing Script', value: "'Dancing Script', cursive" },
  { name: 'Pacifico', value: "'Pacifico', cursive" },
];

// System fonts
const systemFonts = [
  { name: 'Arial', value: "Arial, sans-serif" },
  { name: 'Helvetica', value: "'Helvetica Neue', Helvetica, sans-serif" },
  { name: 'Times New Roman', value: "'Times New Roman', Times, serif" },
  { name: 'Georgia', value: "Georgia, serif" },
  { name: 'Courier New', value: "'Courier New', Courier, monospace" },
  { name: 'Verdana', value: "Verdana, Geneva, sans-serif" },
  { name: 'Segoe UI', value: "'Segoe UI', Tahoma, Geneva, sans-serif" },
];

// Custom styles for compact form elements
const styles = {
  formGroup: {
    marginBottom: '6px',
  },
  label: {
    fontSize: '11px',
    marginBottom: '2px',
    fontWeight: 500,
  },
  formControl: {
    fontSize: '12px',
    padding: '4px 8px',
    height: '28px',
  },
  select: {
    fontSize: '12px',
    padding: '4px 8px',
    height: '28px',
  },
  colorPicker: {
    width: '28px',
    height: '28px',
    padding: '2px',
    marginRight: '4px',
  },
  helpText: {
    fontSize: '10px',
    marginTop: '2px',
  },
  row: {
    marginBottom: '4px',
  },
  header: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
  },
  container: {
    padding: '8px',
  },
  fontPreview: {
    fontSize: '12px',
    padding: '4px',
    marginTop: '4px',
    border: '1px solid #dee2e6',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
  },
  sectionHeader: {
    fontSize: '12px',
    fontWeight: 600,
    marginTop: '12px',
    marginBottom: '6px',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '4px',
  }
};

const PageAppearanceSettings: React.FC<PageAppearanceProps> = ({ appearance, onChange }) => {
  const [fontSearch, setFontSearch] = useState('');
  const [showFontPreview, setShowFontPreview] = useState(true);

  // Filter fonts based on search
  const filteredFonts = [...systemFonts, ...googleFonts].filter(font => 
    font.name.toLowerCase().includes(fontSearch.toLowerCase())
  );

  // Handle font search change
  const handleFontSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFontSearch(e.target.value);
  };

  // Handle font selection
  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const event = {
      ...e,
      target: {
        ...e.target,
        name: 'fontFamily',
        value: e.target.value
      }
    };
    onChange(event);
  };

  return (
    <div className="page-appearance-settings" style={styles.container}>
      <div className="d-flex align-items-center mb-2">
        <FaPalette className="me-2" />
        <h6 className="mb-0" style={styles.header}>Page Appearance</h6>
      </div>

      <Form>
        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Page Width</Form.Label>
              <Form.Select
                name="width"
                value={appearance.width}
                onChange={onChange}
                style={styles.select}
              >
                <option value="100%">Full Width (100%)</option>
                <option value="800px">Standard (800px)</option>
                <option value="600px">Narrow (600px)</option>
                <option value="1000px">Wide (1000px)</option>
                <option value="1200px">Extra Wide (1200px)</option>
              </Form.Select>
              <Form.Text className="text-muted" style={styles.helpText}>
                Controls the maximum width of the page
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Background Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="backgroundColor"
                  value={appearance.backgroundColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="backgroundColor"
                  value={appearance.backgroundColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Background Image URL</Form.Label>
              <Form.Control
                type="text"
                name="backgroundImage"
                value={appearance.backgroundImage}
                onChange={onChange}
                placeholder="https://example.com/image.jpg"
                style={styles.formControl}
              />
              <Form.Text className="text-muted" style={styles.helpText}>
                Leave empty for solid background color
              </Form.Text>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Font Family</Form.Label>
              <InputGroup size="sm" className="mb-1">
                <InputGroup.Text>
                  <FaSearch size={10} />
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search fonts..."
                  value={fontSearch}
                  onChange={handleFontSearchChange}
                  style={styles.formControl}
                />
              </InputGroup>
              <Form.Select 
                name="fontFamily" 
                value={appearance.fontFamily} 
                onChange={handleFontChange}
                style={styles.select}
              >
                <optgroup label="System Fonts">
                  {systemFonts.map((font, index) => (
                    <option key={`system-${index}`} value={font.value}>{font.name}</option>
                  ))}
                </optgroup>
                <optgroup label="Google Fonts">
                  {googleFonts.map((font, index) => (
                    <option key={`google-${index}`} value={font.value}>{font.name}</option>
                  ))}
                </optgroup>
              </Form.Select>
              {showFontPreview && (
                <div 
                  style={{
                    ...styles.fontPreview,
                    fontFamily: appearance.fontFamily
                  }}
                >
                  The quick brown fox jumps over the lazy dog
                </div>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Text Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="textColor"
                  value={appearance.textColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="textColor"
                  value={appearance.textColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Primary Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="primaryColor"
                  value={appearance.primaryColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="primaryColor"
                  value={appearance.primaryColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
              <Form.Text className="text-muted" style={styles.helpText}>
                Used for buttons and accents
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Secondary Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="secondaryColor"
                  value={appearance.secondaryColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="secondaryColor"
                  value={appearance.secondaryColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Border Radius</Form.Label>
              <Form.Control
                type="text"
                name="borderRadius"
                value={appearance.borderRadius}
                onChange={onChange}
                placeholder="10px"
                style={styles.formControl}
              />
              <Form.Text className="text-muted" style={styles.helpText}>
                e.g., 0px, 5px, 10px, etc.
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Box Shadow</Form.Label>
              <Form.Control
                type="text"
                name="boxShadow"
                value={appearance.boxShadow}
                onChange={onChange}
                placeholder="0 0 20px rgba(0, 0, 0, 0.1)"
                style={styles.formControl}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Header Alignment</Form.Label>
              <Form.Select
                name="headerAlignment"
                value={appearance.headerAlignment}
                onChange={onChange}
                style={styles.select}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Button Style</Form.Label>
              <Form.Select
                name="buttonStyle"
                value={appearance.buttonStyle}
                onChange={onChange}
                style={styles.select}
              >
                <option value="default">Default</option>
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="outline">Outline</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {/* Section Styling */}
        <div style={styles.sectionHeader}>Section Styling</div>
        
        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Section Title Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="sectionTitleColor"
                  value={appearance.sectionTitleColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="sectionTitleColor"
                  value={appearance.sectionTitleColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Section Divider Color</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type="color"
                  name="sectionDividerColor"
                  value={appearance.sectionDividerColor}
                  onChange={onChange}
                  style={styles.colorPicker}
                />
                <Form.Control
                  type="text"
                  name="sectionDividerColor"
                  value={appearance.sectionDividerColor}
                  onChange={onChange}
                  style={styles.formControl}
                />
              </div>
            </Form.Group>
          </Col>
        </Row>

        <Row style={styles.row}>
          <Col md={6}>
            <Form.Group style={styles.formGroup}>
              <Form.Label style={styles.label}>Element Spacing</Form.Label>
              <Form.Control
                type="text"
                name="elementSpacing"
                value={appearance.elementSpacing}
                onChange={onChange}
                placeholder="15px"
                style={styles.formControl}
              />
              <Form.Text className="text-muted" style={styles.helpText}>
                Space between page elements
              </Form.Text>
            </Form.Group>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default PageAppearanceSettings;
