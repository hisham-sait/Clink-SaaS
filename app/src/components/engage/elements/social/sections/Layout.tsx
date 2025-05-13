import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { SocialElementData } from '../SocialElementData';
import { imageStyles as styles } from '../../shared';

interface LayoutProps {
  element: SocialElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Layout section for social media links element
 * Handles alignment, spacing, and size properties
 */
const Layout: React.FC<LayoutProps> = ({ element, onChange }) => {
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Alignment</div>
        <Form.Select
          name="alignment"
          value={element.alignment || 'center'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Form.Select>
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Spacing Between Icons</div>
        <Form.Control
          type="text"
          name="spacing"
          value={element.spacing || '1rem'}
          onChange={onChange}
          placeholder="1rem"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Enter spacing value (e.g., 1rem, 10px, 1em)
        </div>
      </div>
      
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Width</div>
            <Form.Control
              type="text"
              name="width"
              value={element.width || '100%'}
              onChange={onChange}
              placeholder="100%"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Height</div>
            <Form.Control
              type="text"
              name="height"
              value={element.height || 'auto'}
              onChange={onChange}
              placeholder="auto"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Margin</div>
            <Form.Control
              type="text"
              name="margin"
              value={element.margin || '1rem 0'}
              onChange={onChange}
              placeholder="1rem 0"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Padding</div>
            <Form.Control
              type="text"
              name="padding"
              value={element.padding || '0'}
              onChange={onChange}
              placeholder="0"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Layout;
