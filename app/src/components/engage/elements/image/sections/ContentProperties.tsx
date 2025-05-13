import React, { useState } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { FaImage, FaUpload } from 'react-icons/fa';
import { ImageElementData } from '../ImageElementData';
import { imageStyles as styles } from '../../shared';
import FileManagerModal from '../../../../common/FileManagerModal';
import { MediaItem } from '../../../../../services/media';
import { getCurrentCompanyId } from '../../../../../services/engage';

interface ContentPropertiesProps {
  element: ImageElementData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  companyId?: string;
}

/**
 * Content properties section for image elements
 * Handles image source, alt text, and caption
 */
const ContentProperties: React.FC<ContentPropertiesProps> = ({ 
  element, 
  onChange,
  companyId
}) => {
  const [showMediaBrowser, setShowMediaBrowser] = useState(false);

  // Log company ID and other relevant information when the file browser is opened
  const handleOpenMediaBrowser = () => {
    // Get the company ID using the getCurrentCompanyId function
    const companyId = getCurrentCompanyId();
    console.log('Opening media browser with company ID:', companyId);
    console.log('Section:', 'pages');
    setShowMediaBrowser(true);
  };

  // Handle media selection
  const handleMediaSelect = (media: MediaItem | MediaItem[]) => {
    // Ensure we're working with a single media item
    const singleMedia = Array.isArray(media) ? media[0] : media;
    
    console.log('Selected media:', singleMedia);
    console.log('Current element state:', element);
    
    // Create a deep copy of the element to ensure all properties are properly updated
    const updatedElement = JSON.parse(JSON.stringify(element)) as ImageElementData;
    
    // Update the image source (both src and imageUrl for compatibility)
    updatedElement.src = singleMedia.url;
    updatedElement.imageUrl = singleMedia.url;
    
    // Update the media ID
    updatedElement.mediaId = singleMedia.id;
    
    // Update the thumbnail URL if available
    if (singleMedia.thumbnailUrl) {
      updatedElement.thumbnailUrl = singleMedia.thumbnailUrl;
    }
    
    // If no alt text is set, use the media title or original name
    if (!element.alt && (singleMedia.alt || singleMedia.title || singleMedia.originalName)) {
      const altText = singleMedia.alt || singleMedia.title || singleMedia.originalName;
      updatedElement.alt = altText;
      updatedElement.imageAlt = altText;
    }
    
    console.log('Updated element:', updatedElement);
    
    // Update the element with all changes at once - ONLY DO THIS ONE UPDATE
    // This ensures all properties are updated simultaneously
    onChange({
      target: {
        name: 'element',
        value: updatedElement
      }
    } as any);
    
    // Force a re-render of the component
    setTimeout(() => {
      // This empty timeout forces React to flush the state update
      // and ensure the UI is updated
      console.log('State update should be complete now');
    }, 0);
  };

  return (
    <>
      <div style={styles.formGroup}>
        <div style={styles.mediaSelector}>
          <div style={styles.inlineLabel}>Image Source</div>
          <Button 
            variant="outline-primary" 
            size="sm" 
            style={styles.miniButton}
            onClick={handleOpenMediaBrowser}
          >
            <FaUpload size={10} className="me-1" /> Select Image
          </Button>
        </div>
        
        {/* Use any available image source (src, imageUrl, or thumbnailUrl) for display */}
        {(element.src || element.imageUrl) ? (
          <div className="d-flex align-items-center mb-2">
            {/* Show thumbnail or actual image */}
            {(element.thumbnailUrl || element.src || element.imageUrl) && (
              <img 
                src={element.thumbnailUrl || element.src || element.imageUrl} 
                alt={element.alt || element.imageAlt || 'Selected image'} 
                style={{
                  width: '40px',
                  height: '40px',
                  objectFit: 'cover' as const,
                  borderRadius: '3px',
                  border: '1px solid #dee2e6'
                }}
                className="me-2"
                onLoad={() => console.log('Thumbnail loaded in ContentProperties')}
                onError={(e) => console.error('Error loading thumbnail:', e)}
              />
            )}
            <div className="small text-truncate" style={{ fontSize: '11px' }}>
              {(element.src || element.imageUrl || '').split('/').pop()}
            </div>
          </div>
        ) : (
          <div className="text-center p-3 border rounded mb-2" style={{ backgroundColor: '#f8f9fa' }}>
            <FaImage className="mb-1" />
            <div style={{ fontSize: '11px' }}>No image selected</div>
          </div>
        )}
        
        <Form.Control
          type="text"
          name="src"
          value={element.src || element.imageUrl || ''}
          onChange={onChange}
          placeholder="Enter image URL or select from media browser"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Enter a URL or select an image from the media browser
        </div>
      </div>

      <Row>
        <Col xs={12}>
          <div style={styles.formGroup}>
            <div style={styles.inlineLabel}>Alt Text</div>
            <Form.Control
              type="text"
              name="alt"
              value={element.alt || element.imageAlt || ''}
              onChange={onChange}
              placeholder="Describe the image for accessibility"
              style={styles.formControl}
              size="sm"
            />
            <div style={styles.helpText}>
              Describe the image for screen readers and SEO
            </div>
          </div>
        </Col>
      </Row>

      <div style={styles.formGroup}>
        <div style={styles.inlineLabel}>Caption</div>
        <Form.Control
          type="text"
          name="caption"
          value={element.caption || ''}
          onChange={onChange}
          placeholder="Optional caption text"
          style={styles.formControl}
          size="sm"
        />
        <div style={styles.helpText}>
          Caption will be displayed below the image
        </div>
      </div>

      {/* File Manager Modal */}
      <FileManagerModal
        show={showMediaBrowser}
        onHide={() => setShowMediaBrowser(false)}
        onSelect={handleMediaSelect}
        companyId={getCurrentCompanyId()}
        section="pages"
        allowedTypes={['IMAGE']}
        title="Select Image"
      />
    </>
  );
};

export default ContentProperties;
