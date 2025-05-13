import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ImageElementData } from '../ImageElementData';
import { imageStyles as styles } from '../../shared';
import { getFilterStyle } from '../utils/defaultProperties';
import { ColorInput } from '../../shared/components';

interface EffectsProps {
  element: ImageElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Effects section for image elements
 * Handles filters and overlay properties
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
  
  // Handle overlay toggle
  const handleOverlayToggle = (checked: boolean) => {
    const event = {
      target: {
        name: 'overlay',
        value: checked,
        type: 'checkbox',
        checked
      }
    } as any;
    onChange(event as any);
  };
  
  return (
    <>
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Brightness</span>
          <span>{element.brightness || 100}%</span>
        </div>
        <Form.Range
          name="brightness"
          min={0}
          max={200}
          step={1}
          value={element.brightness || 100}
          onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
          style={styles.slider}
        />
      </div>
      
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Contrast</span>
          <span>{element.contrast || 100}%</span>
        </div>
        <Form.Range
          name="contrast"
          min={0}
          max={200}
          step={1}
          value={element.contrast || 100}
          onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
          style={styles.slider}
        />
      </div>
      
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Saturation</span>
          <span>{element.saturation || 100}%</span>
        </div>
        <Form.Range
          name="saturation"
          min={0}
          max={200}
          step={1}
          value={element.saturation || 100}
          onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
          style={styles.slider}
        />
      </div>
      
      <Row>
        <Col xs={6}>
          <div style={styles.sliderContainer}>
            <div style={styles.sliderLabel}>
              <span>Grayscale</span>
              <span>{element.grayscale || 0}%</span>
            </div>
            <Form.Range
              name="grayscale"
              min={0}
              max={100}
              step={1}
              value={element.grayscale || 0}
              onChange={(e) => handleSliderChange('grayscale', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.sliderContainer}>
            <div style={styles.sliderLabel}>
              <span>Sepia</span>
              <span>{element.sepia || 0}%</span>
            </div>
            <Form.Range
              name="sepia"
              min={0}
              max={100}
              step={1}
              value={element.sepia || 0}
              onChange={(e) => handleSliderChange('sepia', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </Col>
      </Row>
      
      <Row>
        <Col xs={6}>
          <div style={styles.sliderContainer}>
            <div style={styles.sliderLabel}>
              <span>Hue Rotate</span>
              <span>{element.hueRotate || 0}°</span>
            </div>
            <Form.Range
              name="hueRotate"
              min={0}
              max={360}
              step={1}
              value={element.hueRotate || 0}
              onChange={(e) => handleSliderChange('hueRotate', parseInt(e.target.value))}
              style={styles.slider}
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Blur</div>
            <Form.Control
              type="text"
              name="blur"
              value={element.blur || '0px'}
              onChange={onChange}
              placeholder="0px"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
      </Row>
      
      <div style={styles.sliderContainer}>
        <div style={styles.sliderLabel}>
          <span>Opacity</span>
          <span>{element.opacity || 1}</span>
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
      
      <hr style={{ margin: '10px 0' }} />
      
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="overlay"
            checked={element.overlay || false}
            onChange={(e) => handleOverlayToggle(e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Enable Overlay</span>
        </div>
      </div>
      
      {element.overlay && (
        <>
          <ColorInput
            name="overlayColor"
            value={element.overlayColor || 'rgba(0,0,0,0.5)'}
            onChange={onChange}
            label="Overlay Color"
          />
          
          <div style={styles.sliderContainer}>
            <div style={styles.sliderLabel}>
              <span>Overlay Opacity</span>
              <span>{element.overlayOpacity || 0.5}</span>
            </div>
            <Form.Range
              name="overlayOpacity"
              min={0}
              max={1}
              step={0.01}
              value={element.overlayOpacity || 0.5}
              onChange={(e) => handleSliderChange('overlayOpacity', parseFloat(e.target.value))}
              style={styles.slider}
            />
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Overlay Text</div>
            <Form.Control
              type="text"
              name="overlayText"
              value={element.overlayText || ''}
              onChange={onChange}
              placeholder="Optional text to display over image"
              style={styles.formControl}
              size="sm"
            />
          </div>
          
          {element.overlayText && (
            <>
              <Row>
                <Col xs={6}>
                  <ColorInput
                    name="overlayTextColor"
                    value={element.overlayTextColor || '#ffffff'}
                    onChange={onChange}
                    label="Text Color"
                  />
                </Col>
                <Col xs={6}>
                  <div style={styles.formGroup}>
                    <div style={styles.inlineLabel}>Text Size</div>
                    <Form.Control
                      type="text"
                      name="overlayTextSize"
                      value={element.overlayTextSize || '1rem'}
                      onChange={onChange}
                      placeholder="1rem"
                      style={styles.formControl}
                      size="sm"
                    />
                  </div>
                </Col>
              </Row>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Position</div>
                <Form.Select
                  name="overlayPosition"
                  value={element.overlayPosition || 'center'}
                  onChange={onChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="top-left">Top Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-right">Bottom Right</option>
                </Form.Select>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
};

export default Effects;
