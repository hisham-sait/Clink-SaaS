import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ColorInput, DimensionInput } from '../components';
import { getBorderStyles, getBoxShadowStyles, getBackgroundStyles } from '../styleUtils';

interface StylingProps<T> {
  element: T;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  styles: any;
}

/**
 * Shared Styling section for all element types
 * Handles border, background, and shadow properties
 */
const Styling = <T extends Record<string, any>>({
  element,
  onChange,
  styles
}: StylingProps<T>) => {
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

  // Handle background gradient changes
  const updateBackgroundGradient = () => {
    const startColor = element.backgroundGradientStartColor || '#ffffff';
    const endColor = element.backgroundGradientEndColor || '#f0f0f0';
    const angle = element.backgroundGradientAngle || 135;
    
    const gradient = element.backgroundGradient === 'none' ? 
      'none' : `linear-gradient(${angle}deg, ${startColor} 0%, ${endColor} 100%)`;
    
    const event = {
      target: {
        name: 'backgroundGradient',
        value: gradient
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
  };

  // Handle box shadow changes
  const handleBoxShadowUpdate = () => {
    if (element.boxShadow === 'none') {
      return;
    }
    
    const color = element.boxShadowColor || 'rgba(0,0,0,0.2)';
    const blur = element.boxShadowBlur || '10px';
    const spread = element.boxShadowSpread || '0';
    const offsetX = element.boxShadowOffsetX || '0';
    const offsetY = element.boxShadowOffsetY || '4px';
    
    const boxShadow = `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
    
    const event = {
      target: {
        name: 'boxShadow',
        value: boxShadow
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
  };

  // Determine if this is a button element
  const isButton = element.type === 'button' || 'buttonText' in element;
  // Determine if this is an image element
  const isImage = element.type === 'image' || 'alt' in element;
  // Determine if this is a text element
  const isText = element.type === 'text' || 'content' in element;
  // Determine if this is a video element
  const isVideo = element.type === 'video' || 'videoUrl' in element;
  // Determine if this is a social element
  const isSocial = element.type === 'social' || 'links' in element;
  
  return (
    <>
      {/* Button-specific styling */}
      {isButton && (
        <>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Button Style</div>
            <Form.Select
              name="buttonStyle"
              value={element.buttonStyle || 'filled'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="filled">Filled</option>
              <option value="outline">Outline</option>
              <option value="text">Text</option>
              <option value="gradient">Gradient</option>
            </Form.Select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Button Variant</div>
            <Form.Select
              name="buttonVariant"
              value={element.buttonVariant || 'primary'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </Form.Select>
          </div>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Button Size</div>
            <Form.Select
              name="buttonSize"
              value={element.buttonSize || 'md'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </Form.Select>
          </div>
          
          <Row>
            <Col xs={6}>
              <ColorInput
                name="buttonColor"
                value={element.buttonColor || '#007bff'}
                onChange={onChange}
                label="Button Color"
              />
            </Col>
            <Col xs={6}>
              <ColorInput
                name="textColor"
                value={element.textColor || '#ffffff'}
                onChange={onChange}
                label="Text Color"
              />
            </Col>
          </Row>
        </>
      )}

      {/* Text-specific styling */}
      {isText && (
        <>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Text Color</div>
            <ColorInput
              name="textColor"
              value={element.textColor || '#000000'}
              onChange={onChange}
            />
          </div>
        </>
      )}

      {/* Common styling fields */}
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Border Radius</div>
        <DimensionInput
          name="borderRadius"
          value={element.borderRadius || '0'}
          onChange={onChange}
          placeholder="0"
        />
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Border Style</div>
        <Form.Select
          name="borderStyle"
          value={element.borderStyle || 'none'}
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
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Border Color</div>
              <ColorInput
                name="borderColor"
                value={element.borderColor || '#dee2e6'}
                onChange={onChange}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Border Width</div>
              <DimensionInput
                name="borderWidth"
                value={element.borderWidth || '1px'}
                onChange={onChange}
                placeholder="1px"
              />
            </div>
          </Col>
        </Row>
      )}
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Background</div>
        <ColorInput
          name="backgroundColor"
          value={element.backgroundColor === 'transparent' ? '#ffffff' : element.backgroundColor || '#ffffff'}
          onChange={onChange}
          disabled={element.backgroundColor === 'transparent'}
        />
        <div className="form-check mt-1" style={{ fontSize: '10px' }}>
          <input
            className="form-check-input"
            type="checkbox"
            id="transparentBg"
            checked={element.backgroundColor === 'transparent'}
            onChange={(e) => {
              const syntheticEvent = {
                target: {
                  name: 'backgroundColor',
                  value: e.target.checked ? 'transparent' : '#ffffff'
                }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
            }}
          />
          <label className="form-check-label" htmlFor="transparentBg">
            Transparent
          </label>
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Background Gradient</div>
        <Form.Select
          name="backgroundGradient"
          value={element.backgroundGradient === 'none' ? 'none' : 'custom'}
          onChange={(e) => {
            // First set the background gradient property to 'none' or 'custom'
            const event = {
              ...e,
              target: {
                ...e.target,
                name: 'backgroundGradient',
                value: e.target.value === 'none' ? 'none' : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)'
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
      
      {element.backgroundGradient !== 'none' && (
        <>
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Start Color</div>
                <ColorInput
                  name="backgroundGradientStartColor"
                  value={element.backgroundGradientStartColor || '#ffffff'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => updateBackgroundGradient(), 10);
                  }}
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>End Color</div>
                <ColorInput
                  name="backgroundGradientEndColor"
                  value={element.backgroundGradientEndColor || '#f0f0f0'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => updateBackgroundGradient(), 10);
                  }}
                />
              </div>
            </Col>
          </Row>
          
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Angle (degrees)</div>
            <Form.Control
              type="number"
              name="backgroundGradientAngle"
              value={element.backgroundGradientAngle || 135}
              onChange={(e) => {
                onChange(e);
                setTimeout(() => updateBackgroundGradient(), 10);
              }}
              min={0}
              max={360}
              style={styles.formControl}
              size="sm"
            />
          </div>
        </>
      )}
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Box Shadow</div>
        <Form.Select
          name="boxShadow"
          value={element.boxShadow === 'none' ? 'none' : 'custom'}
          onChange={(e) => {
            // First set the box shadow property to 'none' or 'custom'
            const event = {
              ...e,
              target: {
                ...e.target,
                name: 'boxShadow',
                value: e.target.value === 'none' ? 'none' : '0 4px 10px 0 rgba(0,0,0,0.2)'
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
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Shadow Color</div>
            <ColorInput
              name="boxShadowColor"
              value={element.boxShadowColor || 'rgba(0,0,0,0.2)'}
              onChange={(e) => {
                onChange(e);
                setTimeout(() => handleBoxShadowUpdate(), 10);
              }}
            />
          </div>
          
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Blur</div>
                <DimensionInput
                  name="boxShadowBlur"
                  value={element.boxShadowBlur || '10px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleBoxShadowUpdate(), 10);
                  }}
                  placeholder="10px"
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Spread</div>
                <DimensionInput
                  name="boxShadowSpread"
                  value={element.boxShadowSpread || '0'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleBoxShadowUpdate(), 10);
                  }}
                  placeholder="0"
                />
              </div>
            </Col>
          </Row>
          
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset X</div>
                <DimensionInput
                  name="boxShadowOffsetX"
                  value={element.boxShadowOffsetX || '0'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleBoxShadowUpdate(), 10);
                  }}
                  placeholder="0"
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Offset Y</div>
                <DimensionInput
                  name="boxShadowOffsetY"
                  value={element.boxShadowOffsetY || '4px'}
                  onChange={(e) => {
                    onChange(e);
                    setTimeout(() => handleBoxShadowUpdate(), 10);
                  }}
                  placeholder="4px"
                />
              </div>
            </Col>
          </Row>
        </>
      )}

      {/* Button and Social hover styling */}
      {(isButton || isSocial) && (
        <>
          <div style={{...styles.sectionHeader, marginTop: '15px', marginBottom: '10px'}}>
            <span>Hover Styling</span>
          </div>
          
          <div style={styles.formGroup}>
            <div className="d-flex align-items-center mb-1">
              <Form.Check
                type="switch"
                id="hoverEffect"
                checked={element.hoverEffect || false}
                onChange={(e) => handleCheckboxChange('hoverEffect', e.target.checked)}
                style={{ marginBottom: 0 }}
              />
              <span style={styles.switchLabel}>Enable Hover Effect</span>
            </div>
          </div>
          
          {element.hoverEffect && (
            <>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Effect Type</div>
                <Form.Select
                  name="hoverEffectType"
                  value={element.hoverEffectType || 'brighten'}
                  onChange={onChange}
                  style={styles.select}
                  size="sm"
                >
                  <option value="brighten">Brighten</option>
                  <option value="darken">Darken</option>
                  <option value="zoom">Zoom</option>
                  <option value="shadow">Shadow</option>
                  <option value="elevate">Elevate</option>
                  <option value="color-shift">Color Shift</option>
                </Form.Select>
              </div>
              
              {isButton && (
                <>
                  <Row>
                    <Col xs={6}>
                      <ColorInput
                        name="hoverButtonColor"
                        value={element.hoverButtonColor || (element.buttonColor || '#0069d9')}
                        onChange={onChange}
                        label="Hover Button Color"
                      />
                    </Col>
                    <Col xs={6}>
                      <ColorInput
                        name="hoverTextColor"
                        value={element.hoverTextColor || (element.textColor || '#ffffff')}
                        onChange={onChange}
                        label="Hover Text Color"
                      />
                    </Col>
                  </Row>
                </>
              )}
              
              {isSocial && (
                <>
                  <div style={styles.formGroup}>
                    <ColorInput
                      name="hoverIconColor"
                      value={element.hoverIconColor || (element.iconColor || '#0069d9')}
                      onChange={onChange}
                      label="Hover Icon Color"
                    />
                  </div>
                  
                  {element.displayStyle === 'buttons' && (
                    <div style={styles.formGroup}>
                      <ColorInput
                        name="hoverBackgroundColor"
                        value={element.hoverBackgroundColor || '#e6e6e6'}
                        onChange={onChange}
                        label="Hover Background Color"
                      />
                    </div>
                  )}
                </>
              )}
              
              <div style={styles.formGroup}>
                <ColorInput
                  name="hoverBorderColor"
                  value={element.hoverBorderColor || (element.borderColor || '#0062cc')}
                  onChange={onChange}
                  label="Hover Border Color"
                />
              </div>
              
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Transition Duration</div>
                <Form.Control
                  type="text"
                  name="hoverTransitionDuration"
                  value={element.hoverTransitionDuration || '0.3s'}
                  onChange={onChange}
                  placeholder="0.3s"
                  style={styles.formControl}
                  size="sm"
                />
              </div>
            </>
          )}
        </>
      )}

      {/* Common alignment options */}
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Alignment</div>
        <Form.Select
          name="alignment"
          value={element.alignment || 'left'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Form.Select>
      </div>
      
      {/* Full width option */}
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="fullWidth"
            checked={element.fullWidth || false}
            onChange={(e) => handleCheckboxChange('fullWidth', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Full Width</span>
        </div>
      </div>
    </>
  );
};

export default Styling;
