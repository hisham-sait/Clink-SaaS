import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { VideoElementData } from '../VideoElementData';
import { videoStyles as styles } from '../../shared';
import { ColorInput } from '../../shared/components';

interface EffectsProps {
  element: VideoElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Effects section for video elements
 * Handles opacity, filters, and overlay
 */
const Effects: React.FC<EffectsProps> = ({ element, onChange }) => {
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
  
  // Handle range input change
  const handleRangeChange = (name: string, value: number) => {
    const event = {
      target: {
        name,
        value,
        type: 'range'
      }
    } as any;
    onChange(event as any);
  };
  
  // Render a slider with label and value input
  const renderSlider = (label: string, name: string, value: number, min: number, max: number, step: number, helpText: string) => (
    <div style={styles.formGroup}>
      <div style={styles.inlineLabel}>{label}</div>
      <Row className="align-items-center g-1">
        <Col xs={9}>
          <Form.Range
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleRangeChange(name, parseFloat(e.target.value))}
          />
        </Col>
        <Col xs={3}>
          <Form.Control
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleRangeChange(name, parseFloat(e.target.value))}
            style={styles.formControl}
            size="sm"
          />
        </Col>
      </Row>
      <div style={styles.helpText}>{helpText}</div>
    </div>
  );
  
  return (
    <>
      <Row className="g-1">
        <Col xs={12}>
          {renderSlider(
            'Opacity',
            'opacity',
            element.opacity !== undefined ? element.opacity : 1,
            0, 1, 0.01,
            'Transparency (0-1)'
          )}
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          {renderSlider(
            'Brightness',
            'brightness',
            element.brightness !== undefined ? element.brightness : 1,
            0, 2, 0.01,
            'Brightness (0-2)'
          )}
        </Col>
        <Col xs={6}>
          {renderSlider(
            'Contrast',
            'contrast',
            element.contrast !== undefined ? element.contrast : 1,
            0, 2, 0.01,
            'Contrast (0-2)'
          )}
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          {renderSlider(
            'Saturation',
            'saturation',
            element.saturation !== undefined ? element.saturation : 1,
            0, 2, 0.01,
            'Saturation (0-2)'
          )}
        </Col>
        <Col xs={6}>
          {renderSlider(
            'Hue Rotate',
            'hueRotate',
            element.hueRotate !== undefined ? element.hueRotate : 0,
            0, 360, 1,
            'Hue rotation (0-360°)'
          )}
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Blur</div>
            <Form.Control
              type="text"
              name="blur"
              value={element.blur || '0px'}
              onChange={onChange}
              placeholder="e.g., 0px, 2px"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Blur effect (px)
            </div>
          </div>
        </Col>
        <Col xs={6}>
          {renderSlider(
            'Grayscale',
            'grayscale',
            element.grayscale !== undefined ? element.grayscale : 0,
            0, 1, 0.01,
            'Grayscale (0-1)'
          )}
        </Col>
      </Row>
      
      <Row className="g-1">
        <Col xs={12}>
          {renderSlider(
            'Sepia',
            'sepia',
            element.sepia !== undefined ? element.sepia : 0,
            0, 1, 0.01,
            'Sepia effect (0-1)'
          )}
        </Col>
      </Row>
      
      <div style={styles.divider}></div>
      
      <Row className="g-1">
        <Col xs={12}>
          <div style={styles.formGroup}>
            <Form.Check
              type="switch"
              id="video-overlay"
              label="Show Overlay"
              name="overlay"
              checked={element.overlay === true}
              onChange={(e) => handleCheckboxChange('overlay', e.target.checked)}
            />
            <div style={styles.helpText}>
              Add an overlay on top of the video
            </div>
          </div>
        </Col>
      </Row>
      
      {element.overlay && (
        <>
          <Row className="g-1">
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Overlay Color</div>
                <ColorInput
                  name="overlayColor"
                  value={element.overlayColor || 'rgba(0,0,0,0.5)'}
                  onChange={onChange}
                />
                <div style={styles.helpText}>
                  Color of overlay
                </div>
              </div>
            </Col>
            <Col xs={6}>
              {renderSlider(
                'Overlay Opacity',
                'overlayOpacity',
                element.overlayOpacity !== undefined ? element.overlayOpacity : 0.5,
                0, 1, 0.01,
                'Opacity (0-1)'
              )}
            </Col>
          </Row>
          
          <Row className="g-1">
            <Col xs={12}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Overlay Text</div>
                <Form.Control
                  as="textarea"
                  name="overlayText"
                  value={element.overlayText || ''}
                  onChange={onChange}
                  placeholder="Enter text for overlay"
                  style={{ ...styles.formControl, ...styles.textarea }}
                  rows={2}
                  size="sm"
                />
                <div style={styles.helpText}>
                  Text on overlay
                </div>
              </div>
            </Col>
          </Row>
          
          <Row className="g-1">
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Text Color</div>
                <ColorInput
                  name="overlayTextColor"
                  value={element.overlayTextColor || '#ffffff'}
                  onChange={onChange}
                />
                <div style={styles.helpText}>
                  Text color
                </div>
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Text Size</div>
                <Form.Control
                  type="text"
                  name="overlayTextSize"
                  value={element.overlayTextSize || '16px'}
                  onChange={onChange}
                  placeholder="e.g., 16px"
                  style={styles.formControl}
                  size="sm"
                />
                <div style={styles.helpText}>
                  Font size
                </div>
              </div>
            </Col>
          </Row>
          
          <Row className="g-1">
            <Col xs={12}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Text Position</div>
                <Form.Select
                  name="overlayTextPosition"
                  value={element.overlayTextPosition || 'center'}
                  onChange={onChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </Form.Select>
                <div style={styles.helpText}>
                  Vertical position
                </div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default Effects;
