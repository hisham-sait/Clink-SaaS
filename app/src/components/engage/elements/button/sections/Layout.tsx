import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ButtonElementData } from '../ButtonElementData';
import { buttonStyles as styles } from '../../shared';
import { DimensionInput, ColorInput } from '../../shared/components';

interface LayoutProps {
  element: ButtonElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Layout section for button elements
 * Handles border, spacing, and dimensions
 */
const Layout: React.FC<LayoutProps> = ({ element, onChange }) => {
  return (
    <>
      <Row>
        <Col xs={6}>
          <DimensionInput
            name="width"
            value={element.width || 'auto'}
            onChange={onChange}
            label="Width"
          />
        </Col>
        <Col xs={6}>
          <DimensionInput
            name="height"
            value={element.height || 'auto'}
            onChange={onChange}
            label="Height"
          />
        </Col>
      </Row>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Border Style</div>
        <Form.Select
          name="borderStyle"
          value={element.borderStyle || 'solid'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
        </Form.Select>
      </div>
      
      {element.borderStyle !== 'none' && (
        <>
          <Row>
            <Col xs={6}>
              <DimensionInput
                name="borderWidth"
                value={element.borderWidth || '1px'}
                onChange={onChange}
                label="Border Width"
                units={['px', 'em', 'rem']}
              />
            </Col>
            <Col xs={6}>
              <DimensionInput
                name="borderRadius"
                value={element.borderRadius || '4px'}
                onChange={onChange}
                label="Border Radius"
                units={['px', 'em', 'rem', '%']}
              />
            </Col>
          </Row>
          
          <ColorInput
            name="borderColor"
            value={element.borderColor || '#007bff'}
            onChange={onChange}
            label="Border Color"
          />
        </>
      )}
      
      <Row>
        <Col xs={6}>
          <DimensionInput
            name="margin"
            value={element.margin || '0 0 1rem 0'}
            onChange={onChange}
            label="Margin"
          />
        </Col>
        <Col xs={6}>
          <DimensionInput
            name="padding"
            value={element.padding || '6px 12px'}
            onChange={onChange}
            label="Padding"
          />
        </Col>
      </Row>
      
      <div style={styles.helpText}>
        For margin and padding, you can use shorthand notation:<br />
        "10px" (all sides), "10px 20px" (vertical horizontal),<br />
        "10px 20px 30px 40px" (top right bottom left)
      </div>
    </>
  );
};

export default Layout;
