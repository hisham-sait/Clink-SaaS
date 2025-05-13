import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { ProfileElementData } from '../ProfileElementData';
import { baseStyles as styles } from '../../shared';
import { DimensionInput } from '../../shared/components';

interface TypographyProps {
  element: ProfileElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

/**
 * Typography section for the profile element
 * Controls font sizes and spacing between elements
 */
const Typography: React.FC<TypographyProps> = ({ element, onChange }) => {
  return (
    <>
      <div style={{...styles.formGroup, marginBottom: '15px'}}>
        <div style={styles.header}>Font Sizes</div>
        <div style={styles.helpText}>Customize the font size for each text element</div>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Name</div>
              <DimensionInput
                name="nameFontSize"
                value={element.nameFontSize || '1.5rem'}
                onChange={onChange}
                placeholder="1.5rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Title</div>
              <DimensionInput
                name="titleFontSize"
                value={element.titleFontSize || '1.1rem'}
                onChange={onChange}
                placeholder="1.1rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Bio</div>
              <DimensionInput
                name="bioFontSize"
                value={element.bioFontSize || '0.9rem'}
                onChange={onChange}
                placeholder="0.9rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Contact Info</div>
              <DimensionInput
                name="contactFontSize"
                value={element.contactFontSize || '0.9rem'}
                onChange={onChange}
                placeholder="0.9rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
        </Row>
        
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Social Icons</div>
          <DimensionInput
            name="socialIconSize"
            value={element.socialIconSize || '1.5rem'}
            onChange={onChange}
            placeholder="1.5rem"
            units={['px', 'rem', 'em', '%']}
          />
        </div>
      </div>
      
      <div style={{...styles.formGroup, marginBottom: '15px'}}>
        <div style={styles.header}>Element Spacing</div>
        <div style={styles.helpText}>Adjust the spacing between profile elements</div>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Avatar Spacing</div>
              <DimensionInput
                name="avatarSpacing"
                value={element.avatarSpacing || '1rem'}
                onChange={onChange}
                placeholder="1rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Name Spacing</div>
              <DimensionInput
                name="nameSpacing"
                value={element.nameSpacing || '0.5rem'}
                onChange={onChange}
                placeholder="0.5rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Title Spacing</div>
              <DimensionInput
                name="titleSpacing"
                value={element.titleSpacing || '0.5rem'}
                onChange={onChange}
                placeholder="0.5rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Bio Spacing</div>
              <DimensionInput
                name="bioSpacing"
                value={element.bioSpacing || '1rem'}
                onChange={onChange}
                placeholder="1rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Contact Spacing</div>
              <DimensionInput
                name="contactSpacing"
                value={element.contactSpacing || '0.5rem'}
                onChange={onChange}
                placeholder="0.5rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Social Spacing</div>
              <DimensionInput
                name="socialSpacing"
                value={element.socialSpacing || '1rem'}
                onChange={onChange}
                placeholder="1rem"
                units={['px', 'rem', 'em', '%']}
              />
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Typography;
