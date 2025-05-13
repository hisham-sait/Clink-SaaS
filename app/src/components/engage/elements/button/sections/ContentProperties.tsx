import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { FaLink, FaExternalLinkAlt } from 'react-icons/fa';
import { ButtonElementData } from '../ButtonElementData';
import { buttonStyles as styles } from '../../shared';

interface ContentPropertiesProps {
  element: ButtonElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for button elements
 * Handles button text, URL, target, and icon
 */
const ContentProperties: React.FC<ContentPropertiesProps> = ({ element, onChange, companyId }) => {
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
  
  // Handle target change
  const handleTargetChange = (checked: boolean) => {
    const event = {
      target: {
        name: 'target',
        value: checked ? '_blank' : '_self',
        type: 'select'
      }
    } as any;
    onChange(event as any);
  };
  
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Button Text</div>
        <Form.Control
          type="text"
          name="buttonText"
          value={element.buttonText || ''}
          onChange={onChange}
          placeholder="Enter button text"
          style={styles.formControl}
          size="sm"
        />
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Button Type</div>
        <Form.Select
          name="buttonType"
          value={element.buttonType || 'link'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="link">Link</option>
          <option value="submit">Submit</option>
          <option value="reset">Reset</option>
        </Form.Select>
      </div>
      
      {element.buttonType === 'link' && (
        <>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>URL</div>
            <Form.Control
              type="text"
              name="url"
              value={element.url || '#'}
              onChange={onChange}
              placeholder="Enter URL"
              style={styles.formControl}
              size="sm"
            />
          </div>
          
          <div style={styles.formGroup}>
            <div className="d-flex align-items-center mb-1">
              <Form.Check
                type="switch"
                id="openInNewTab"
                checked={element.target === '_blank'}
                onChange={(e) => handleTargetChange(e.target.checked)}
                style={{ marginBottom: 0 }}
              />
              <span style={styles.switchLabel}>Open in new tab</span>
            </div>
          </div>
        </>
      )}
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Icon (optional)</div>
        <Form.Control
          type="text"
          name="icon"
          value={element.icon || ''}
          onChange={onChange}
          placeholder="Enter icon name (e.g., FaLink)"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Enter a Font Awesome icon name (e.g., FaLink, FaUser)
        </div>
      </div>
      
      {element.icon && (
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Icon Position</div>
          <Form.Select
            name="iconPosition"
            value={element.iconPosition || 'left'}
            onChange={onChange}
            style={styles.select}
            size="sm"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </Form.Select>
        </div>
      )}
    </>
  );
};

export default ContentProperties;
