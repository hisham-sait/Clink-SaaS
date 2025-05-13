import React, { useState } from 'react';
import { Form, Row, Col, Button } from 'react-bootstrap';
import { ProfileElementData } from '../ProfileElementData';
import { imageStyles as styles } from '../../shared';
import { FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaGithub, FaPlus, FaTrash, FaUpload, FaUserCircle, FaImage } from 'react-icons/fa';
import FileManagerModal from '../../../../common/FileManagerModal';
import { MediaItem } from '../../../../../services/media';
import { getCurrentCompanyId } from '../../../../../services/engage';

interface ContentPropertiesProps {
  element: ProfileElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for the profile element
 * Allows editing of name, title, bio, avatar, and contact information
 */
const ContentProperties: React.FC<ContentPropertiesProps> = ({
  element,
  onChange,
  companyId
}) => {
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);
  const [mediaField, setMediaField] = useState<'avatarUrl' | 'coverPhotoUrl'>('avatarUrl');

  // Log company ID and other relevant information when the file browser is opened
  const handleOpenMediaBrowser = (field: 'avatarUrl' | 'coverPhotoUrl') => {
    // Get the company ID using the getCurrentCompanyId function
    const companyId = getCurrentCompanyId();
    console.log('Opening media browser with company ID:', companyId);
    console.log('Section:', 'pages');
    console.log('Field:', field);
    setMediaField(field);
    setShowMediaBrowser(true);
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    // Ensure we're working with a single media item
    const singleMedia = Array.isArray(media) ? media[0] : media;
    
    console.log('Selected media:', singleMedia);
    console.log('Current element state:', element);
    console.log('Media field:', mediaField);
    
    // Create a deep copy of the element to ensure all properties are properly updated
    const updatedElement = JSON.parse(JSON.stringify(element)) as ProfileElementData;
    
    // Update the appropriate URL based on the mediaField
    if (mediaField === 'avatarUrl') {
      updatedElement.avatarUrl = singleMedia.url;
      // Update the media ID if needed
      updatedElement.mediaId = singleMedia.id;
    } else if (mediaField === 'coverPhotoUrl') {
      updatedElement.coverPhotoUrl = singleMedia.url;
    }
    
    console.log('Updated element:', updatedElement);
    
    // Update the element with all changes at once
    onChange({
      target: {
        name: 'element',
        value: updatedElement
      }
    } as any);
    
    // Force a re-render of the component
    setTimeout(() => {
      console.log('State update should be complete now');
    }, 0);
  };
  // Handle social link changes
  const handleSocialLinkChange = (index: number, field: 'platform' | 'url' | 'icon', value: string) => {
    // Create a copy of the social links array
    const updatedSocialLinks = [...(element.socialLinks || [])];
    
    // Update the specified field of the social link at the given index
    if (!updatedSocialLinks[index]) {
      updatedSocialLinks[index] = { platform: '', url: '', icon: '' };
    }
    
    updatedSocialLinks[index][field] = value;
    
    // Update the element directly with the new social links
    updateElement({
      socialLinks: updatedSocialLinks
    });
  };
  
  // Add a new social link
  const handleAddSocialLink = () => {
    const updatedSocialLinks = [...(element.socialLinks || []), { platform: 'linkedin', url: '', icon: 'linkedin' }];
    
    // Update the element directly with the new social links
    updateElement({
      socialLinks: updatedSocialLinks
    });
  };
  
  // Remove a social link
  const handleRemoveSocialLink = (index: number) => {
    const updatedSocialLinks = [...(element.socialLinks || [])];
    updatedSocialLinks.splice(index, 1);
    
    // Update the element directly with the new social links
    updateElement({
      socialLinks: updatedSocialLinks
    });
  };
  
  // Handle direct element update
  const updateElement = (updates: Partial<ProfileElementData>) => {
    // Create a deep copy of the element
    const updatedElement = JSON.parse(JSON.stringify(element)) as ProfileElementData;
    
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
  
  // Handle checkbox change
  const handleCheckboxChange = (name: string, checked: boolean) => {
    // Update the element directly with the checkbox change
    updateElement({
      [name]: checked
    });
  };
  
  // Get icon component for a social platform
  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return <FaLinkedin />;
      case 'twitter':
        return <FaTwitter />;
      case 'facebook':
        return <FaFacebook />;
      case 'instagram':
        return <FaInstagram />;
      case 'github':
        return <FaGithub />;
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Basic Information */}
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Name</div>
        <Form.Control
          type="text"
          name="name"
          value={element.name || ''}
          onChange={(e) => updateElement({ name: e.target.value })}
          placeholder="Enter name"
          style={styles.formControl}
          size="sm"
        />
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Title</div>
        <Form.Control
          type="text"
          name="title"
          value={element.title || ''}
          onChange={(e) => updateElement({ title: e.target.value })}
          placeholder="Enter job title"
          style={styles.formControl}
          size="sm"
        />
      </div>
      
      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Bio</div>
        <Form.Control
          as="textarea"
          rows={3}
          name="bio"
          value={element.bio || ''}
          onChange={(e) => updateElement({ bio: e.target.value })}
          placeholder="Enter short biography"
          style={styles.textarea}
        />
      </div>
      
      {/* Avatar Settings */}
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Avatar</div>
        <div style={styles.mediaSelector}>
          <div style={styles.inlineLabel}>Avatar Image</div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            style={styles.miniButton}
            onClick={() => handleOpenMediaBrowser('avatarUrl')}
          >
            <FaUpload size={10} className="me-1" /> Select Image
          </Button>
        </div>
        
        {/* Show thumbnail or actual image */}
        {element.avatarUrl ? (
          <div className="d-flex align-items-center mb-2">
            <img 
              src={element.avatarUrl} 
              alt="Avatar" 
              style={{
                width: '40px',
                height: '40px',
                objectFit: 'cover' as const,
                borderRadius: '50%',
                border: '1px solid #dee2e6'
              }}
              className="me-2"
            />
            <div className="small text-truncate" style={{ fontSize: '11px' }}>
              {element.avatarUrl.split('/').pop()}
            </div>
          </div>
        ) : (
          <div className="text-center p-3 border rounded mb-2" style={{ backgroundColor: '#f8f9fa' }}>
            <FaUserCircle className="mb-1" />
            <div style={{ fontSize: '11px' }}>No avatar selected</div>
          </div>
        )}
        
        <Form.Control
          type="text"
          name="avatarUrl"
          value={element.avatarUrl || ''}
          onChange={(e) => updateElement({ avatarUrl: e.target.value })}
          placeholder="Enter avatar image URL or select from media browser"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Enter a URL or select an image from the media browser
        </div>
        
        <div className="d-flex align-items-center mb-1" style={{marginTop: '8px'}}>
          <Form.Check
            type="switch"
            id="showAvatar"
            checked={element.showAvatar || false}
            onChange={(e) => handleCheckboxChange('showAvatar', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Show Avatar</span>
        </div>
      </div>
      
      {element.showAvatar && (
        <Row>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Size</div>
              <Form.Select
                name="avatarSize"
                value={element.avatarSize || 'md'}
                onChange={(e) => updateElement({ avatarSize: e.target.value as 'sm' | 'md' | 'lg' })}
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
              <div style={styles.inlineLabel}>Shape</div>
              <Form.Select
                name="avatarShape"
                value={element.avatarShape || 'circle'}
                onChange={(e) => updateElement({ avatarShape: e.target.value as 'circle' | 'square' | 'rounded' })}
                style={styles.select}
                size="sm"
              >
                <option value="circle">Circle</option>
                <option value="square">Square</option>
                <option value="rounded">Rounded</option>
              </Form.Select>
            </div>
          </Col>
        </Row>
      )}
      
      {/* Cover Photo Settings */}
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Cover Photo</div>
        <div style={styles.mediaSelector}>
          <div style={styles.inlineLabel}>Cover Photo</div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            style={styles.miniButton}
            onClick={() => handleOpenMediaBrowser('coverPhotoUrl')}
          >
            <FaUpload size={10} className="me-1" /> Select Image
          </Button>
        </div>
        
        {/* Show thumbnail or actual image */}
        {element.coverPhotoUrl ? (
          <div className="d-flex align-items-center mb-2">
            <img 
              src={element.coverPhotoUrl} 
              alt="Cover Photo" 
              style={{
                width: '100%',
                height: '40px',
                objectFit: 'cover' as const,
                borderRadius: '3px',
                border: '1px solid #dee2e6'
              }}
              className="mb-2"
            />
            <div className="small text-truncate" style={{ fontSize: '11px' }}>
              {element.coverPhotoUrl.split('/').pop()}
            </div>
          </div>
        ) : (
          <div className="text-center p-3 border rounded mb-2" style={{ backgroundColor: '#f8f9fa' }}>
            <FaImage className="mb-1" />
            <div style={{ fontSize: '11px' }}>No cover photo selected</div>
          </div>
        )}
        
        <Form.Control
          type="text"
          name="coverPhotoUrl"
          value={element.coverPhotoUrl || ''}
          onChange={(e) => updateElement({ coverPhotoUrl: e.target.value })}
          placeholder="Enter cover photo URL or select from media browser"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Enter a URL or select an image from the media browser
        </div>
        
        <Row className="mt-2">
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Height</div>
              <Form.Control
                type="text"
                name="coverPhotoHeight"
                value={element.coverPhotoHeight || '200px'}
                onChange={(e) => updateElement({ coverPhotoHeight: e.target.value })}
                placeholder="200px"
                style={styles.formControl}
                size="sm"
              />
            </div>
          </Col>
          <Col xs={6}>
            <div style={styles.formGroup}>
              <div style={styles.inlineLabel}>Position</div>
              <Form.Select
                name="coverPhotoPosition"
                value={element.coverPhotoPosition || 'center'}
                onChange={(e) => updateElement({ coverPhotoPosition: e.target.value as 'top' | 'center' | 'bottom' })}
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
        
        <div className="d-flex align-items-center mb-1" style={{marginTop: '8px'}}>
          <Form.Check
            type="switch"
            id="coverPhotoOverlay"
            checked={element.coverPhotoOverlay || false}
            onChange={(e) => handleCheckboxChange('coverPhotoOverlay', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Add color overlay</span>
        </div>
        
        {element.coverPhotoOverlay && (
          <Row>
            <Col xs={6}>
              <div style={styles.formGroup}>
                <div style={styles.inlineLabel}>Overlay Color</div>
                <Form.Control
                  type="color"
                  name="coverPhotoOverlayColor"
                  value={element.coverPhotoOverlayColor || 'rgba(0,0,0,0.5)'}
                  onChange={(e) => updateElement({ coverPhotoOverlayColor: e.target.value })}
                  style={styles.colorPicker}
                  size="sm"
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
                  onChange={(e) => updateElement({ coverPhotoOverlayOpacity: parseFloat(e.target.value) })}
                />
                <div style={{ textAlign: 'center', fontSize: '0.8rem' }}>
                  {Math.round((element.coverPhotoOverlayOpacity || 0.5) * 100)}%
                </div>
              </div>
            </Col>
          </Row>
        )}
      </div>
      
      {/* Contact Information */}
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Contact Information</div>
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Email</div>
          <Form.Control
            type="email"
            name="email"
            value={element.email || ''}
            onChange={(e) => updateElement({ email: e.target.value })}
            placeholder="Enter email address"
            style={styles.formControl}
            size="sm"
          />
        </div>
        
        <div style={styles.formGroup}>
          <div style={styles.inlineLabel}>Phone</div>
          <Form.Control
            type="text"
            name="phone"
            value={element.phone || ''}
            onChange={(e) => updateElement({ phone: e.target.value })}
            placeholder="Enter phone number"
            style={styles.formControl}
            size="sm"
          />
        </div>
      </div>
      
      {/* Social Links */}
      <div style={{...styles.formGroup, marginTop: '8px'}}>
        <div style={styles.header}>Social Links</div>
        <div className="d-flex align-items-center mb-1">
          <Form.Check
            type="switch"
            id="showSocial"
            checked={element.showSocial || false}
            onChange={(e) => handleCheckboxChange('showSocial', e.target.checked)}
            style={{ marginBottom: 0 }}
          />
          <span style={styles.switchLabel}>Show Social Links</span>
        </div>
      </div>
      
      {element.showSocial && (
        <div style={{marginTop: '4px'}}>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              style={styles.miniButton}
              onClick={handleAddSocialLink}
            >
              <FaPlus size={10} className="me-1" /> Add Link
            </Button>
          </div>
          
          {(element.socialLinks || []).map((link, i) => (
            <div key={i} style={{
              marginBottom: '8px',
              padding: '4px',
              border: '1px solid #dee2e6',
              borderRadius: '3px',
              backgroundColor: '#f8f9fa'
            }}>
              <Row className="mb-1">
                <Col xs={9}>
                  <Form.Select
                    value={link.platform}
                    onChange={(e) => handleSocialLinkChange(i, 'platform', e.target.value)}
                    style={styles.select}
                    size="sm"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="github">GitHub</option>
                  </Form.Select>
                </Col>
                <Col xs={3} className="d-flex justify-content-end">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    style={styles.miniButton}
                    onClick={() => handleRemoveSocialLink(i)}
                  >
                    <FaTrash size={10} />
                  </Button>
                </Col>
              </Row>
              
              <Form.Control
                type="text"
                value={link.url || ''}
                onChange={(e) => handleSocialLinkChange(i, 'url', e.target.value)}
                placeholder="Enter URL"
                style={styles.formControl}
                size="sm"
                className="mb-1"
              />
              
              <div className="d-flex align-items-center" style={{fontSize: '10px'}}>
                <span className="me-1">Preview:</span>
                <span>{getSocialIcon(link.platform)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* File Manager Modal */}
      <FileManagerModal
        show={showMediaBrowser}
        onHide={() => setShowMediaBrowser(false)}
        onSelect={handleMediaSelect}
        companyId={getCurrentCompanyId()}
        section="pages"
        allowedTypes={['IMAGE']}
        title={mediaField === 'avatarUrl' ? 'Select Avatar Image' : 'Select Cover Photo'}
      />
    </>
  );
};

export default ContentProperties;
