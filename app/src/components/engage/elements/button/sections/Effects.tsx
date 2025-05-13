import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ButtonElementData } from '../ButtonElementData';
import { buttonStyles as styles } from '../../shared';
import { ColorInput, DimensionInput } from '../../shared/components';
import { updateBoxShadow } from '../utils/defaultProperties';

interface EffectsProps {
  element: ButtonElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Effects section for button elements
 * Handles shadow properties
 */
const Effects: React.FC<EffectsProps> = ({ element, onChange }) => {
  // Update box shadow when individual properties change
  const handleShadowChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the individual property
    const updatedElement = {
      ...element,
      [name]: value
    };
    
    // Update the boxShadow property
    const boxShadow = updateBoxShadow(updatedElement);
    
    // Create a synthetic event for the individual property
    const individualEvent = {
      ...e,
      target: {
        ...e.target,
        name,
        value
      }
    };
    
    // Create a synthetic event for the boxShadow property
    const boxShadowEvent = {
      ...e,
      target: {
        ...e.target,
        name: 'boxShadow',
        value: boxShadow
      }
    };
    
    // Dispatch both events
    onChange(individualEvent);
    onChange(boxShadowEvent as any);
  };
  
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Box Shadow</div>
        <Form.Select
          name="boxShadow"
          value={element.boxShadow === 'none' ? 'none' : 'custom'}
          onChange={(e) => {
            const value = e.target.value;
            const event = {
              ...e,
              target: {
                ...e.target,
                name: 'boxShadow',
                value: value === 'none' ? 'none' : updateBoxShadow(element)
              }
            };
            onChange(event);
          }}
          style={styles.select}
          size="sm"
        >
          <option value="none">None</option>
          <option value="custom">Custom</option>
        </Form.Select>
      </div>
      
      {element.boxShadow !== 'none' && (
        <>
          <ColorInput
            name="boxShadowColor"
            value={element.boxShadowColor || 'rgba(0,0,0,0.2)'}
            onChange={handleShadowChange}
            label="Shadow Color"
          />
          
          <Row>
            <Col xs={6}>
              <DimensionInput
                name="boxShadowOffsetX"
                value={element.boxShadowOffsetX || '0'}
                onChange={handleShadowChange}
                label="Offset X"
                units={['px', 'em', 'rem']}
              />
            </Col>
            <Col xs={6}>
              <DimensionInput
                name="boxShadowOffsetY"
                value={element.boxShadowOffsetY || '4px'}
                onChange={handleShadowChange}
                label="Offset Y"
                units={['px', 'em', 'rem']}
              />
            </Col>
          </Row>
          
          <Row>
            <Col xs={6}>
              <DimensionInput
                name="boxShadowBlur"
                value={element.boxShadowBlur || '10px'}
                onChange={handleShadowChange}
                label="Blur"
                units={['px', 'em', 'rem']}
              />
            </Col>
            <Col xs={6}>
              <DimensionInput
                name="boxShadowSpread"
                value={element.boxShadowSpread || '0'}
                onChange={handleShadowChange}
                label="Spread"
                units={['px', 'em', 'rem']}
              />
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Effects;
