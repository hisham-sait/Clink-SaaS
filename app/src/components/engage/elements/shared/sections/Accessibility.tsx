import React from 'react';
import { Form } from 'react-bootstrap';
import { getAccessibilityAttributes, validateAccessibility } from '../accessibilityUtils';

interface AccessibilityProps<T> {
  element: T;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  styles: any;
}

/**
 * Shared Accessibility section for all element types
 * Handles accessibility properties
 */
const Accessibility = <T extends Record<string, any>>({
  element,
  onChange,
  styles
}: AccessibilityProps<T>) => {
  // Determine element type
  const isButton = element.type === 'button' || 'buttonText' in element;
  const isImage = element.type === 'image' || 'alt' in element;
  const isText = element.type === 'text' || 'content' in element;
  const isVideo = element.type === 'video' || 'videoUrl' in element;
  
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>ARIA Label</div>
        <Form.Control
          type="text"
          name="ariaLabel"
          value={element.ariaLabel || ''}
          onChange={onChange}
          placeholder="Enter ARIA label"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Provides a label that describes the element for screen readers
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Role</div>
        <Form.Select
          name="role"
          value={element.role || (isButton ? 'button' : isImage ? 'img' : '')}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          {isButton && (
            <>
              <option value="button">button</option>
              <option value="link">link</option>
              <option value="menuitem">menuitem</option>
              <option value="tab">tab</option>
            </>
          )}
          {isImage && (
            <>
              <option value="img">img</option>
              <option value="presentation">presentation</option>
              <option value="figure">figure</option>
            </>
          )}
          {isText && (
            <>
              <option value="">none</option>
              <option value="heading">heading</option>
              <option value="paragraph">paragraph</option>
              <option value="note">note</option>
            </>
          )}
          {isVideo && (
            <>
              <option value="">none</option>
              <option value="application">application</option>
            </>
          )}
          {!isButton && !isImage && !isText && !isVideo && (
            <>
              <option value="">none</option>
              <option value="button">button</option>
              <option value="link">link</option>
              <option value="img">img</option>
              <option value="heading">heading</option>
            </>
          )}
        </Form.Select>
        <div style={styles.helpText}>
          Defines the element's role for assistive technologies
        </div>
      </div>
      
      {/* Heading level for text elements with heading role */}
      {isText && element.role === 'heading' && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Heading Level</div>
          <Form.Select
            name="headingLevel"
            value={element.headingLevel || '2'}
            onChange={onChange}
            style={styles.select}
            size="sm"
          >
            <option value="1">h1</option>
            <option value="2">h2</option>
            <option value="3">h3</option>
            <option value="4">h4</option>
            <option value="5">h5</option>
            <option value="6">h6</option>
          </Form.Select>
        </div>
      )}
      
      {/* Alt text for images */}
      {isImage && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Alt Text</div>
          <Form.Control
            type="text"
            name="alt"
            value={element.alt || ''}
            onChange={onChange}
            placeholder="Describe the image"
            style={styles.formControl}
            size="sm"
          />
          <div style={styles.helpText}>
            Alternative text for screen readers
          </div>
          
          <div className="d-flex align-items-center mt-2 mb-1">
            <Form.Check
              type="switch"
              id="decorative"
              checked={element.decorative || false}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'decorative',
                    value: e.target.checked,
                    type: 'checkbox',
                    checked: e.target.checked
                  }
                } as any;
                onChange(event as any);
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={styles.switchLabel}>Decorative Image</span>
          </div>
          <div style={styles.helpText}>
            Mark as decorative if the image is purely for visual purposes
          </div>
        </div>
      )}
      
      {/* Captions for videos */}
      {isVideo && (
        <div style={styles.formGroup}>
          <div className="d-flex align-items-center mb-1">
            <Form.Check
              type="switch"
              id="enableCaptions"
              checked={element.enableCaptions || false}
              onChange={(e) => {
                const event = {
                  target: {
                    name: 'enableCaptions',
                    value: e.target.checked,
                    type: 'checkbox',
                    checked: e.target.checked
                  }
                } as any;
                onChange(event as any);
              }}
              style={{ marginBottom: 0 }}
            />
            <span style={styles.switchLabel}>Enable Captions</span>
          </div>
          <div style={styles.helpText}>
            Enable captions for video content
          </div>
          
          {element.enableCaptions && (
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Captions URL</div>
              <Form.Control
                type="text"
                name="captionsUrl"
                value={element.captionsUrl || ''}
                onChange={onChange}
                placeholder="URL to captions file (.vtt)"
                style={styles.formControl}
                size="sm"
              />
            </div>
          )}
        </div>
      )}
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Tab Index</div>
        <Form.Control
          type="number"
          name="tabIndex"
          value={element.tabIndex?.toString() || '0'}
          onChange={onChange}
          placeholder="0"
          style={styles.formControl}
          size="sm"
          min="-1"
        />
        <div style={styles.helpText}>
          Controls the order of keyboard navigation (0 = default, -1 = not focusable)
        </div>
      </div>
    </>
  );
};

export default Accessibility;
