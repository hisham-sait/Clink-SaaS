import React from 'react';
import { Form, Row, Col, Card } from 'react-bootstrap';
import { ProfileElementData } from '../ProfileElementData';
import { baseStyles as styles } from '../../shared';
import { DimensionInput } from '../../shared/components';
import { FaUserCircle, FaEnvelope, FaPhone, FaLinkedin, FaTwitter } from 'react-icons/fa';

interface LayoutProps {
  element: ProfileElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

// Layout template thumbnails
const layoutTemplates = {
  classic: {
    name: 'Classic Card',
    description: 'Traditional business card style with avatar at the top',
    thumbnail: (
      <div style={{ textAlign: 'center', padding: '5px' }}>
        <div style={{ margin: '0 auto 5px', width: '20px', height: '20px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FaUserCircle size={12} />
        </div>
        <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Name</div>
        <div style={{ fontSize: '6px' }}>Title</div>
        <div style={{ fontSize: '5px', margin: '3px 0' }}>Bio text</div>
        <div style={{ fontSize: '5px', display: 'flex', justifyContent: 'center', gap: '2px' }}>
          <FaEnvelope size={5} />
          <FaPhone size={5} />
        </div>
      </div>
    )
  },
  horizontal: {
    name: 'Horizontal Split',
    description: 'Avatar on the left, details on the right',
    thumbnail: (
      <div style={{ display: 'flex', padding: '5px' }}>
        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '5px' }}>
          <FaUserCircle size={12} />
        </div>
        <div>
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Name</div>
          <div style={{ fontSize: '6px' }}>Title</div>
          <div style={{ fontSize: '5px' }}>Bio text</div>
          <div style={{ fontSize: '5px', display: 'flex', gap: '2px' }}>
            <FaEnvelope size={5} />
            <FaPhone size={5} />
          </div>
        </div>
      </div>
    )
  },
  minimal: {
    name: 'Minimal',
    description: 'Clean, minimalist design with subtle spacing',
    thumbnail: (
      <div style={{ padding: '5px' }}>
        <div style={{ fontSize: '8px', fontWeight: 'bold', marginBottom: '3px' }}>Name</div>
        <div style={{ fontSize: '6px', marginBottom: '3px' }}>Title</div>
        <div style={{ fontSize: '5px', marginBottom: '3px' }}>Bio text</div>
        <div style={{ fontSize: '5px', display: 'flex', gap: '2px' }}>
          <FaEnvelope size={5} />
          <FaPhone size={5} />
        </div>
      </div>
    )
  },
  corporate: {
    name: 'Corporate',
    description: 'Professional layout with structured sections',
    thumbnail: (
      <div style={{ padding: '5px', border: '1px solid #eee' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
          <div style={{ width: '15px', height: '15px', borderRadius: '0', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: '3px' }}>
            <FaUserCircle size={10} />
          </div>
          <div>
            <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Name</div>
            <div style={{ fontSize: '6px' }}>Title</div>
          </div>
        </div>
        <div style={{ fontSize: '5px', borderTop: '1px solid #eee', paddingTop: '2px', marginBottom: '2px' }}>Bio text</div>
        <div style={{ fontSize: '5px', borderTop: '1px solid #eee', paddingTop: '2px', display: 'flex', justifyContent: 'space-between' }}>
          <div><FaEnvelope size={5} /></div>
          <div><FaPhone size={5} /></div>
          <div><FaLinkedin size={5} /></div>
        </div>
      </div>
    )
  },
  creative: {
    name: 'Creative',
    description: 'Artistic layout with unique positioning',
    thumbnail: (
      <div style={{ padding: '5px', background: '#f5f5f5', position: 'relative', height: '40px' }}>
        <div style={{ position: 'absolute', top: '3px', right: '3px', width: '15px', height: '15px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FaUserCircle size={10} />
        </div>
        <div style={{ position: 'absolute', bottom: '3px', left: '3px' }}>
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>Name</div>
          <div style={{ fontSize: '6px' }}>Title</div>
        </div>
        <div style={{ position: 'absolute', top: '10px', left: '5px', fontSize: '5px', maxWidth: '60%' }}>Bio text</div>
        <div style={{ position: 'absolute', bottom: '3px', right: '3px', fontSize: '5px', display: 'flex', gap: '2px' }}>
          <FaEnvelope size={5} />
          <FaPhone size={5} />
        </div>
      </div>
    )
  },
  social: {
    name: 'Social Focus',
    description: 'Emphasizes social media links with larger icons',
    thumbnail: (
      <div style={{ textAlign: 'center', padding: '5px' }}>
        <div style={{ margin: '0 auto 3px', width: '15px', height: '15px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FaUserCircle size={10} />
        </div>
        <div style={{ fontSize: '7px', fontWeight: 'bold' }}>Name</div>
        <div style={{ fontSize: '5px', margin: '2px 0' }}>Bio text</div>
        <div style={{ fontSize: '5px', display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '3px' }}>
          <FaLinkedin size={8} />
          <FaTwitter size={8} />
          <FaEnvelope size={8} />
          <FaPhone size={8} />
        </div>
      </div>
    )
  },
  // New social media inspired layouts
  linkCollection: {
    name: 'Link Collection',
    description: 'Centered design with button-like social links',
    thumbnail: (
      <div style={{ textAlign: 'center', padding: '5px' }}>
        <div style={{ margin: '0 auto 3px', width: '15px', height: '15px', borderRadius: '50%', background: '#ccc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FaUserCircle size={10} />
        </div>
        <div style={{ fontSize: '7px', fontWeight: 'bold' }}>Name</div>
        <div style={{ fontSize: '5px', margin: '2px 0' }}>Bio text</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '3px' }}>
          <div style={{ fontSize: '5px', background: '#eee', padding: '2px', borderRadius: '2px', textAlign: 'center' }}>Link 1</div>
          <div style={{ fontSize: '5px', background: '#eee', padding: '2px', borderRadius: '2px', textAlign: 'center' }}>Link 2</div>
        </div>
      </div>
    )
  },
  photoGrid: {
    name: 'Photo Grid',
    description: 'Cover photo with overlapping avatar',
    thumbnail: (
      <div style={{ padding: '5px', position: 'relative' }}>
        <div style={{ height: '15px', background: '#eee', marginBottom: '8px' }}></div>
        <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', width: '12px', height: '12px', borderRadius: '50%', background: '#ccc', border: '1px solid white' }}>
          <FaUserCircle size={10} />
        </div>
        <div style={{ marginTop: '10px', textAlign: 'center' }}>
          <div style={{ fontSize: '7px', fontWeight: 'bold' }}>Name</div>
          <div style={{ fontSize: '5px' }}>Title</div>
          <div style={{ fontSize: '5px', margin: '2px 0' }}>Bio text</div>
        </div>
      </div>
    )
  },
  professionalNetwork: {
    name: 'Professional Network',
    description: 'Banner with sidebar layout',
    thumbnail: (
      <div style={{ padding: '2px', position: 'relative' }}>
        <div style={{ height: '10px', background: '#eee', marginBottom: '5px' }}></div>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '12px', marginRight: '3px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '0', background: '#ccc', marginTop: '-5px', border: '1px solid white' }}>
              <FaUserCircle size={8} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '6px', fontWeight: 'bold' }}>Name</div>
            <div style={{ fontSize: '5px' }}>Title</div>
            <div style={{ fontSize: '4px', margin: '1px 0' }}>Bio text</div>
          </div>
        </div>
      </div>
    )
  },
  socialFeed: {
    name: 'Social Feed',
    description: 'Post-like layout with engagement metrics',
    thumbnail: (
      <div style={{ padding: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ccc', marginRight: '3px' }}>
            <FaUserCircle size={8} />
          </div>
          <div>
            <div style={{ fontSize: '6px', fontWeight: 'bold' }}>Name</div>
            <div style={{ fontSize: '4px' }}>@handle</div>
          </div>
        </div>
        <div style={{ fontSize: '5px', padding: '2px', border: '1px solid #eee', borderRadius: '2px', margin: '2px 0' }}>
          Bio text as a post
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '4px' }}>
          <span>Followers</span>
          <span>Following</span>
        </div>
      </div>
    )
  },
  businessCard: {
    name: 'Business Card',
    description: 'Two-column professional design',
    thumbnail: (
      <div style={{ padding: '3px', border: '1px solid #eee', display: 'flex' }}>
        <div style={{ width: '15px', borderRight: '1px solid #eee', padding: '2px' }}>
          <div style={{ width: '10px', height: '10px', background: '#ccc', margin: '0 auto' }}>
            <FaUserCircle size={10} />
          </div>
        </div>
        <div style={{ padding: '2px' }}>
          <div style={{ fontSize: '6px', fontWeight: 'bold' }}>Name</div>
          <div style={{ fontSize: '4px' }}>Title</div>
          <div style={{ fontSize: '4px', marginTop: '2px' }}>
            <div><FaEnvelope size={4} /> Email</div>
            <div><FaPhone size={4} /> Phone</div>
          </div>
        </div>
      </div>
    )
  }
};

/**
 * Layout section for the profile element
 * Controls width, height, alignment, border, and spacing
 */
const Layout: React.FC<LayoutProps> = ({ element, onChange }) => {
  // Handle layout template selection
  const handleLayoutTemplateSelect = (template: string) => {
    const event = {
      target: {
        name: 'layoutTemplate',
        value: template
      }
    } as React.ChangeEvent<HTMLSelectElement>;
    
    onChange(event);
  };
  return (
    <>
      <div style={{...styles.formGroup, marginBottom: '15px'}}>
        <div style={styles.header}>Layout Template</div>
        <div style={styles.helpText}>Select a pre-built layout for your profile element</div>
        
        <Row className="g-2 mt-1">
          {Object.entries(layoutTemplates).map(([key, template]) => (
            <Col xs={6} key={key}>
              <Card 
                style={{
                  cursor: 'pointer',
                  border: element.layoutTemplate === key ? '2px solid #007bff' : '1px solid #dee2e6',
                  background: element.layoutTemplate === key ? '#f0f7ff' : '#fff'
                }}
                onClick={() => handleLayoutTemplateSelect(key)}
                className="h-100"
              >
                <Card.Body style={{ padding: '8px' }}>
                  <div style={{ height: '50px', marginBottom: '5px', border: '1px solid #eee', borderRadius: '3px' }}>
                    {template.thumbnail}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{template.name}</div>
                  <div style={{ fontSize: '9px', color: '#666' }}>{template.description}</div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Width</div>
            <DimensionInput
              name="width"
              value={element.width || '100%'}
              onChange={onChange}
              placeholder="100%"
              units={['px', '%', 'em', 'rem', 'auto']}
            />
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Height</div>
            <DimensionInput
              name="height"
              value={element.height || 'auto'}
              onChange={onChange}
              placeholder="auto"
              units={['px', '%', 'em', 'rem', 'auto']}
            />
          </div>
        </Col>
      </Row>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Alignment</div>
        <Form.Select
          name="alignment"
          value={element.alignment || 'center'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Form.Select>
      </div>
      
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Border</div>
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Style</div>
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
          </Col>
          
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Width</div>
              <DimensionInput
                name="borderWidth"
                value={element.borderWidth || '0px'}
                onChange={onChange}
                placeholder="0px"
                units={['px', '%', 'em', 'rem']}
              />
            </div>
          </Col>
        </Row>
        
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Color</div>
              <Form.Control
                type="color"
                name="borderColor"
                value={element.borderColor || '#000000'}
                onChange={onChange}
                style={styles.colorPicker}
                size="sm"
              />
            </div>
          </Col>
          
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Radius</div>
              <DimensionInput
                name="borderRadius"
                value={element.borderRadius || '0px'}
                onChange={onChange}
                placeholder="0px"
                units={['px', '%', 'em', 'rem']}
              />
            </div>
          </Col>
        </Row>
      </div>
      
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Margin</div>
            <Form.Control
              type="text"
              name="margin"
              value={element.margin || '0 0 1rem 0'}
              onChange={onChange}
              placeholder="0 0 1rem 0"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Format: top right bottom left
            </div>
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Padding</div>
            <Form.Control
              type="text"
              name="padding"
              value={element.padding || '0'}
              onChange={onChange}
              placeholder="0"
              style={styles.formControl}
              size="sm"
            />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Layout;
