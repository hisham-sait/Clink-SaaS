import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { VideoElementData } from '../VideoElementData';
import { videoStyles as styles } from '../../shared';
import { DimensionInput } from '../../shared/components';

interface LayoutProps {
  element: VideoElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Layout section for video elements
 * Handles width, height, aspect ratio, and alignment
 */
const Layout: React.FC<LayoutProps> = ({ element, onChange }) => {
  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    const event = {
      target: {
        name,
        value: checked,
        type: 'checkbox',
        checked
      }
    } as any;
    onChange(event as any);
  };
  
  return (
    <>
      <Row>
        <Col xs={12}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Aspect Ratio</div>
            <Form.Select
              name="aspectRatio"
              value={element.aspectRatio || '16:9'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="custom">Custom</option>
            </Form.Select>
            <div style={styles.helpText}>
              Select the aspect ratio for the video
            </div>
          </div>
        </Col>
      </Row>
      
      {element.aspectRatio === 'custom' && (
        <Row>
          <Col xs={12}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Custom Aspect Ratio</div>
              <Form.Control
                type="text"
                name="customAspectRatio"
                value={element.customAspectRatio || '16:9'}
                onChange={onChange}
                placeholder="e.g., 16:9, 4:3, 2.35:1"
                style={styles.formControl}
                size="sm"
              />
              <div style={styles.helpText}>
                Enter a custom aspect ratio (width:height)
              </div>
            </div>
          </Col>
        </Row>
      )}
      
      <Row className="g-1">
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Width</div>
            <DimensionInput
              name="width"
              value={element.width || '100%'}
              onChange={onChange}
              placeholder="e.g., 100%, 500px"
            />
            <div style={styles.helpText}>
              Width of the video
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Height</div>
            <DimensionInput
              name="height"
              value={element.height || 'auto'}
              onChange={onChange}
              placeholder="e.g., auto, 300px"
            />
            <div style={styles.helpText}>
              Height of the video
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Object Fit</div>
            <Form.Select
              name="objectFit"
              value={element.objectFit || 'contain'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="contain">Contain</option>
              <option value="cover">Cover</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
            </Form.Select>
            <div style={styles.helpText}>
              How video fits container
            </div>
          </div>
        </Col>
        <Col xs={6}>
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
            <div style={styles.helpText}>
              Horizontal alignment
            </div>
          </div>
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Margin</div>
            <Form.Control
              type="text"
              name="margin"
              value={element.margin || '0 0 1rem 0'}
              onChange={onChange}
              placeholder="e.g., 0 0 1rem 0"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Margin around video
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
              placeholder="e.g., 0, 1rem"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Padding inside container
            </div>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Layout;
