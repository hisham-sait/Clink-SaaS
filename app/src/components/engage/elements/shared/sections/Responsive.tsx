import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { DimensionInput } from '../components';
import { getResponsiveClassNames, getMobileStyles, getDesktopStyles } from '../responsiveUtils';

interface ResponsiveProps<T> {
  element: T;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  styles: any;
}

/**
 * Shared Responsive section for all element types
 * Handles responsive properties
 */
const Responsive = <T extends Record<string, any>>({
  element,
  onChange,
  styles
}: ResponsiveProps<T>) => {
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
  
  // Determine if this is a text element
  const isText = element.type === 'text' || 'content' in element;
  
  return (
    <>
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="hideOnMobile"
            checked={element.hideOnMobile || false}
            onChange={(e) => handleCheckboxChange('hideOnMobile', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Hide on Mobile</span>
        </div>
        <div style={styles.helpText}>
          Hide this element on mobile devices (screen width &lt; 768px)
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="hideOnDesktop"
            checked={element.hideOnDesktop || false}
            onChange={(e) => handleCheckboxChange('hideOnDesktop', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Hide on Desktop</span>
        </div>
        <div style={styles.helpText}>
          Hide this element on desktop devices (screen width &gt;= 768px)
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Mobile Settings</div>
        <div style={styles.helpText}>
          These settings will only apply on mobile devices
        </div>
      </div>
      
      <Row>
        <Col xs={6}>
          <DimensionInput
            name="mobileWidth"
            value={element.mobileWidth || 'auto'}
            onChange={onChange}
            label="Mobile Width"
          />
        </Col>
        <Col xs={6}>
          <DimensionInput
            name="mobileHeight"
            value={element.mobileHeight || 'auto'}
            onChange={onChange}
            label="Mobile Height"
          />
        </Col>
      </Row>
      
      {/* Text-specific mobile settings */}
      {isText && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Mobile Text Size</div>
          <Form.Control
            type="text"
            name="mobileTextSize"
            value={element.mobileTextSize || ''}
            onChange={onChange}
            placeholder="16px"
            style={styles.formControl}
            size="sm"
          />
          <div style={styles.helpText}>
            Text size on mobile devices (leave empty to use default)
          </div>
        </div>
      )}
    </>
  );
};

export default Responsive;
