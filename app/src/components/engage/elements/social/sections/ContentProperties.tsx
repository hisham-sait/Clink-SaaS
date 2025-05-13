import React, { useState } from 'react';
import { Form, Row, Col, Button, InputGroup } from 'react-bootstrap';
import { 
  FaLinkedin, FaXTwitter, FaFacebook, FaInstagram, FaGithub, FaYoutube, 
  FaPinterest, FaTiktok, FaSnapchat, FaReddit, FaPlus, FaTrash 
} from 'react-icons/fa6';
import { SocialElementData, SocialLink } from '../SocialElementData';
import { imageStyles as styles } from '../../shared';
import { getSocialIconName, getSocialPlatformLabel, getDefaultUrlPattern } from '../utils/defaultProperties';

interface ContentPropertiesProps {
  element: SocialElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for social media links element
 * Handles social links, display style, and icon settings
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
    updateElement({ openInNewTab: checked });
  };
  
  // Handle direct element update
  const updateElement = (updates: Partial<SocialElementData>) => {
    // Create a deep copy of the element
    const updatedElement = JSON.parse(JSON.stringify(element)) as SocialElementData;
    
    // Apply all updates
    Object.assign(updatedElement, updates);
    
    // Create a synthetic event for the entire element update
    const event = {
      target: {
        name: 'element',
        value: updatedElement,
        type: 'object'
      }
    } as any;
    
    onChange(event as any);
  };
  
  // State for new social link form
  const [newPlatform, setNewPlatform] = useState('linkedin');
  const [newUrl, setNewUrl] = useState(getDefaultUrlPattern('linkedin'));
  
  // Handle adding a new social link
  const handleAddSocialLink = () => {
    if (!newUrl.trim()) return;
    
    const newLink: SocialLink = {
      platform: newPlatform,
      url: newUrl,
      icon: getSocialIconName(newPlatform),
      label: getSocialPlatformLabel(newPlatform)
    };
    
    const updatedLinks = [...(element.links || []), newLink];
    updateElement({ links: updatedLinks });
    
    // Reset form
    setNewUrl('');
  };
  
  // Handle removing a social link
  const handleRemoveSocialLink = (index: number) => {
    const updatedLinks = [...(element.links || [])];
    updatedLinks.splice(index, 1);
    updateElement({ links: updatedLinks });
  };
  
  // Handle updating a social link
  const handleUpdateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    const updatedLinks = [...(element.links || [])];
    
    if (field === 'platform') {
      updatedLinks[index] = {
        ...updatedLinks[index],
        platform: value,
        icon: getSocialIconName(value),
        label: getSocialPlatformLabel(value)
      };
    } else {
      (updatedLinks[index] as any)[field] = value;
    }
    
    updateElement({ links: updatedLinks });
  };
  
  // Get icon component for a social platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin />;
      case 'twitter':
        return <FaXTwitter />;
      case 'facebook':
        return <FaFacebook />;
      case 'instagram':
        return <FaInstagram />;
      case 'github':
        return <FaGithub />;
      case 'youtube':
        return <FaYoutube />;
      case 'pinterest':
        return <FaPinterest />;
      case 'tiktok':
        return <FaTiktok />;
      case 'snapchat':
        return <FaSnapchat />;
      case 'reddit':
        return <FaReddit />;
      default:
        return <FaLinkedin />;
    }
  };
  
  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Display Style</div>
        <Form.Select
          name="displayStyle"
          value={element.displayStyle || 'icons'}
          onChange={onChange}
          style={styles.select}
          size="sm"
        >
          <option value="icons">Icons Only</option>
          <option value="buttons">Button Style</option>
          <option value="text">Text Links</option>
        </Form.Select>
      </div>
      
      <Row>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Icon Size</div>
            <Form.Select
              name="iconSize"
              value={element.iconSize || 'md'}
              onChange={onChange}
              style={styles.select}
              size="sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </Form.Select>
          </div>
        </Col>
        <Col xs={6}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Icon Color</div>
            <Form.Control
              type="color"
              name="iconColor"
              value={element.iconColor || '#555555'}
              onChange={onChange}
              style={styles.colorPicker}
              size="sm"
            />
          </div>
        </Col>
      </Row>
      
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="showLabels"
            checked={element.showLabels || false}
            onChange={(e) => handleCheckboxChange('showLabels', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Show Labels</span>
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="openInNewTab"
            checked={element.openInNewTab || false}
            onChange={(e) => handleTargetChange(e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Open in new tab</span>
        </div>
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Social Links</div>
        
        {/* Current social links */}
        {(!element.links || element.links.length === 0) ? (
          <div style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>No social links added</div>
        ) : (
          <div style={{ marginBottom: '15px' }}>
            {element.links.map((link, index) => (
              <div key={index} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <InputGroup size="sm">
                  <InputGroup.Text style={{ padding: '0 8px' }}>
                    <div style={{ fontSize: '16px', color: element.iconColor || '#666' }}>
                      {getSocialIcon(link.platform)}
                    </div>
                  </InputGroup.Text>
                  <Form.Select
                    value={link.platform}
                    onChange={(e) => handleUpdateSocialLink(index, 'platform', e.target.value)}
                    style={{ maxWidth: '120px' }}
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="github">GitHub</option>
                    <option value="youtube">YouTube</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="tiktok">TikTok</option>
                    <option value="snapchat">Snapchat</option>
                    <option value="reddit">Reddit</option>
                  </Form.Select>
                  <Form.Control
                    type="text"
                    value={link.url}
                    onChange={(e) => handleUpdateSocialLink(index, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleRemoveSocialLink(index)}
                    style={{ padding: '0 8px' }}
                  >
                    <FaTrash size={12} />
                  </Button>
                </InputGroup>
              </div>
            ))}
          </div>
        )}
        
        {/* Add new social link form */}
        <div style={{ marginTop: '10px' }}>
          <InputGroup size="sm">
            <InputGroup.Text style={{ padding: '0 8px' }}>
              <div style={{ fontSize: '16px', color: element.iconColor || '#666' }}>
                {getSocialIcon(newPlatform)}
              </div>
            </InputGroup.Text>
            <Form.Select
              value={newPlatform}
              onChange={(e) => {
                setNewPlatform(e.target.value);
                setNewUrl(getDefaultUrlPattern(e.target.value));
              }}
              style={{ maxWidth: '120px' }}
            >
              <option value="linkedin">LinkedIn</option>
              <option value="twitter">Twitter</option>
              <option value="facebook">Facebook</option>
              <option value="instagram">Instagram</option>
              <option value="github">GitHub</option>
              <option value="youtube">YouTube</option>
              <option value="pinterest">Pinterest</option>
              <option value="tiktok">TikTok</option>
              <option value="snapchat">Snapchat</option>
              <option value="reddit">Reddit</option>
            </Form.Select>
            <Form.Control
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
            />
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleAddSocialLink}
              style={{ padding: '0 8px' }}
            >
              <FaPlus size={12} />
            </Button>
          </InputGroup>
          <div style={styles.helpText}>
            Select a platform, enter the URL, and click the + button to add
          </div>
        </div>
      </div>
    </>
  );
};

export default ContentProperties;
