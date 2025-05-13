import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ImageElementData } from '../ImageElementData';
import { imageStyles as styles } from '../../shared';
import { DimensionInput } from '../../shared/components';

interface LayoutProps {
  element: ImageElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Layout section for image elements
 * Handles size, alignment, and object fit properties
 */
const Layout: React.FC<LayoutProps> = ({ element, onChange }) => {
  return (
    <>
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Width</div>
            <DimensionInput
              name="width"
              value={element.width || '100%'}
              onChange={onChange}
              placeholder="100%"
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Height</div>
            <DimensionInput
              name="height"
              value={element.height || 'auto'}
              onChange={onChange}
              placeholder="auto"
            />
          </div>
        </Col>
      </Row>

      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Object Fit</div>
        <Form.Select
          name="objectFit"
          value={element.objectFit || 'cover'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="cover">Cover (fill container, crop if needed)</option>
          <option value="contain">Contain (show entire image)</option>
          <option value="fill">Fill (stretch to fit)</option>
          <option value="scale-down">Scale Down (fit without upscaling)</option>
          <option value="none">None (no resizing)</option>
        </Form.Select>
        <div style={styles.helpText}>
          Controls how the image fits within its container
        </div>
      </div>

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

      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Margin</div>
            <Form.Control
              type="text"
              name="margin"
              value={element.margin || '0 0 1rem 0'}
              onChange={onChange}
              placeholder="0 0 1rem 0"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Format: top right bottom left
            </div>
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
