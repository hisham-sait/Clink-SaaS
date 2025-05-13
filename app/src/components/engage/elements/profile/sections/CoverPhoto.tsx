import React from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ProfileElementData } from '../ProfileElementData';
import { baseStyles as styles } from '../../shared';
import { DimensionInput, ColorInput } from '../../shared/components';
import { FaImage } from 'react-icons/fa';

interface CoverPhotoProps {
  element: ProfileElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onMediaSelect?: (field: string) => void;
}

/**
 * CoverPhoto section for the profile element
 * Controls cover photo settings
 */
const CoverPhoto: React.FC<CoverPhotoProps> = ({ element, onChange, onMediaSelect }) => {
  // Handle media selection
  const handleMediaSelect = () => {
    if (onMediaSelect) {
      onMediaSelect('coverPhotoUrl');
    }
  };

  // Handle direct property changes
  const handleDirectChange = (name: string, value: any) => {
    // Create a synthetic event
    const syntheticEvent = {
      target: {
        name,
        value
      }
    };
    
    // Pass the event to the onChange handler
    onChange(syntheticEvent as any);
  };

  return (
    <>
      <div style={{...styles.formGroup, marginBottom: '15px'}}>
        <div style={styles.header}>Cover Photo</div>
        <div style={styles.helpText}>Add a cover photo to your profile</div>
        
        <div style={{...styles.formGroup, marginBottom: '10px'}}>
          {element.coverPhotoUrl ? (
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <img 
                src={element.coverPhotoUrl} 
                alt="Cover" 
                style={{ 
                  width: '100%', 
                  height: '100px', 
                  objectFit: 'cover', 
                  objectPosition: element.coverPhotoPosition || 'center',
                  borderRadius: '4px'
                }} 
              />
              <Button 
                variant="light" 
                size="sm" 
                style={{ 
                  position: 'absolute', 
                  top: '5px', 
                  right: '5px',
                  background: 'rgba(255,255,255,0.7)'
                }}
                onClick={handleMediaSelect}
              >
                Change
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline-secondary" 
              className="w-100" 
              style={{ height: '100px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}
              onClick={handleMediaSelect}
            >
              <FaImage size={24} style={{ marginBottom: '8px' }} />
              <div>Select Cover Photo</div>
            </Button>
          )}
        </div>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Height</div>
              <DimensionInput
                name="coverPhotoHeight"
                value={element.coverPhotoHeight || '200px'}
                onChange={onChange}
                placeholder="200px"
                units={['px', 'rem', 'em', 'vh', '%']}
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Position</div>
              <Form.Select
                name="coverPhotoPosition"
                value={element.coverPhotoPosition || 'center'}
                onChange={onChange}
                style={styles.select}
                size="sm"
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
        
        <div style={styles.formGroup}>
          <Form.Check 
            type="switch"
            id="coverPhotoOverlay"
            label="Add color overlay"
            checked={element.coverPhotoOverlay || false}
            onChange={(e) => handleDirectChange('coverPhotoOverlay', e.target.checked)}
          />
        </div>
        
        {element.coverPhotoOverlay && (
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Overlay Color</div>
                <ColorInput
                  name="coverPhotoOverlayColor"
                  value={element.coverPhotoOverlayColor || 'rgba(0,0,0,0.5)'}
                  onChange={onChange}
                />
              </div>
            </Col>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Opacity</div>
                <Form.Range
                  min={0}
                  max={1}
                  step={0.1}
                  value={element.coverPhotoOverlayOpacity || 0.5}
                  onChange={(e) => handleDirectChange('coverPhotoOverlayOpacity', parseFloat(e.target.value))}
                />
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  {Math.round((element.coverPhotoOverlayOpacity || 0.5) * 100)}%
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default CoverPhoto;
