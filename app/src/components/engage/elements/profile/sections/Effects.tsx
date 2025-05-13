import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ProfileElementData } from '../ProfileElementData';
import { baseStyles as styles } from '../../shared';
import { DimensionInput, ColorInput } from '../../shared/components';

interface EffectsProps {
  element: ProfileElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Effects section for the profile element
 * Controls shadow, opacity, and other visual effects
 */
const Effects: React.FC<EffectsProps> = ({ element, onChange }) => {
  // Handle slider change
  const handleSliderChange = (name: string, value: number) => {
    const event = {
      target: {
        name,
        value: value.toString()
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };
  
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Background Color</div>
        <Form.Control
          type="color"
          name="backgroundColor"
          value={element.backgroundColor || 'transparent'}
          onChange={onChange}
          style={styles.colorPicker}
          size="sm"
        />
      </div>
      
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Opacity</span>
          <span>{Math.round((element.opacity || 1) * 100)}%</span>
        </div>
        <Form.Range
          name="opacity"
          min={0}
          max={1}
          step={0.01}
          value={element.opacity || 1}
          onChange={(e) => handleSliderChange('opacity', parseFloat(e.target.value))}
          style={styles.slider}
        />
      </div>
      
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Box Shadow</div>
        <Form.Select
          name="boxShadow"
          value={element.boxShadow || 'none'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="none">None</option>
          <option value="shadow">Shadow</option>
        </Form.Select>
        
        {element.boxShadow && element.boxShadow !== 'none' && (
          <>
            <Row style={{marginTop: '4px'}}>
              <Col xs={6}>
                <div style={styles.formGroup}>
                  <div style={styles.inlineLabel}>Color</div>
                  <Form.Control
                    type="color"
                    name="boxShadowColor"
                    value={element.boxShadowColor || 'rgba(0,0,0,0.2)'}
                    onChange={onChange}
                    style={styles.colorPicker}
                    size="sm"
                  />
                </div>
              </Col>
              
              <Col xs={6}>
                <div style={styles.formGroup}>
                  <div style={styles.inlineLabel}>Blur</div>
                  <DimensionInput
                    name="boxShadowBlur"
                    value={element.boxShadowBlur || '10px'}
                    onChange={onChange}
                    placeholder="10px"
                    units={['px', 'em', 'rem']}
                  />
                </div>
              </Col>
            </Row>
            
            <Row>
              <Col xs={6}>
                <div style={styles.formGroup}>
                  <div style={styles.inlineLabel}>Spread</div>
                  <DimensionInput
                    name="boxShadowSpread"
                    value={element.boxShadowSpread || '0'}
                    onChange={onChange}
                    placeholder="0"
                    units={['px', 'em', 'rem']}
                  />
                </div>
              </Col>
              
              <Col xs={6}>
                <div style={styles.formGroup}>
                  <div style={styles.inlineLabel}>Offset X</div>
                  <DimensionInput
                    name="boxShadowOffsetX"
                    value={element.boxShadowOffsetX || '0'}
                    onChange={onChange}
                    placeholder="0"
                    units={['px', 'em', 'rem']}
                  />
                </div>
              </Col>
            </Row>
            
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Offset Y</div>
              <DimensionInput
                name="boxShadowOffsetY"
                value={element.boxShadowOffsetY || '4px'}
                onChange={onChange}
                placeholder="4px"
                units={['px', 'em', 'rem']}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Effects;
