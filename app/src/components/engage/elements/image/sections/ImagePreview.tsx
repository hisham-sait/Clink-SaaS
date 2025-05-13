import React from 'react';
import { FaImage } from 'react-icons/fa';
import { ImageElementData } from '../ImageElementData';
import { imageStyles as styles } from '../../shared';
import { getFilterStyle, updateBoxShadow } from '../utils/defaultProperties';

interface ImagePreviewProps {
  element: ImageElementData;
  showTitle?: boolean;
}

/**
 * A component that previews an image with all styling and effects
 */
const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  element, 
  showTitle = false 
}) => {
  // Get the box shadow style
  const boxShadow = updateBoxShadow(element);
  
  // Get the filter style
  const filter = getFilterStyle(element);
  
  // Get background style
  const getBackgroundStyle = () => {
    if (element.backgroundGradient && element.backgroundGradient !== 'none') {
      return element.backgroundGradient;
    }
    return element.backgroundColor || 'transparent';
  };

  // Helper functions for overlay positioning
  const getOverlayAlignItems = (): 'center' | 'flex-start' | 'flex-end' => {
    if (element.overlayPosition?.includes('center') && !element.overlayPosition?.includes('-')) {
      return 'center';
    } else if (element.overlayPosition?.includes('top')) {
      return 'flex-start';
    } else if (element.overlayPosition?.includes('bottom')) {
      return 'flex-end';
    }
    return 'center';
  };

  const getOverlayJustifyContent = (): 'center' | 'flex-start' | 'flex-end' => {
    if (element.overlayPosition?.includes('center')) {
      return 'center';
    } else if (element.overlayPosition?.includes('left')) {
      return 'flex-start';
    } else if (element.overlayPosition?.includes('right')) {
      return 'flex-end';
    }
    return 'center';
  };
  
  // Render the image or a placeholder
  const renderImage = () => {
    // Check for any available image source
    // Use optional chaining to safely access properties
    const imageUrl = element?.src || element?.imageUrl || element?.thumbnailUrl;
    
    console.log('ImagePreview renderImage - imageUrl:', imageUrl);
    
    if (imageUrl) {
      return (
        <img 
          src={imageUrl}
          alt={element?.alt || element?.imageAlt || 'Image preview'}
          style={{
            maxWidth: '100%',
            maxHeight: '150px',
            objectFit: element?.objectFit || 'cover',
            width: element?.width || '100%',
            height: element?.height || 'auto',
            display: 'block',
            margin: element?.alignment === 'center' ? '0 auto' : 
                   element?.alignment === 'right' ? '0 0 0 auto' : '0',
          }}
          onError={(e) => {
            console.error('Error loading image:', e);
            (e.target as HTMLImageElement).style.display = 'none';
          }}
          onLoad={() => console.log('Image loaded successfully')}
        />
      );
    }
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6c757d',
        fontSize: '12px',
        width: '100%',
        height: '100%',
      }}>
        <FaImage size={24} className="mb-2" />
        <span>No image selected</span>
      </div>
    );
  };
  
  // Render overlay if enabled
  const renderOverlay = () => {
    if (!element.overlay) return null;
    
    return (
      <div 
        style={{
          position: 'absolute' as const,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: getOverlayAlignItems(),
          justifyContent: getOverlayJustifyContent(),
          backgroundColor: element.overlayColor || '#000000',
          opacity: element.overlayOpacity || 0.5,
          color: '#ffffff',
          textAlign: 'center' as const,
          padding: '10px',
        }}
      >
        {element.overlayText && (
          <span style={{
            color: element.overlayTextColor || '#ffffff',
            fontSize: element.overlayTextSize || '1rem',
            textAlign: 'center',
            padding: '5px',
          }}>
            {element.overlayText}
          </span>
        )}
      </div>
    );
  };
  
  return (
    <div style={{
      marginTop: '5px',
      marginBottom: '10px',
      padding: '8px',
      border: '1px dashed #ccc',
      borderRadius: '3px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '100px',
      position: 'relative' as const,
      overflow: 'hidden',
      height: 'auto',
      flexDirection: 'column' as const
    }}>
      {showTitle && (
        <div style={{
          fontSize: '10px',
          color: '#6c757d',
          marginBottom: '5px',
          textAlign: 'center'
        }}>
          Preview
        </div>
      )}
      <div style={{
        position: 'relative',
        boxShadow,
        filter,
        backgroundColor: getBackgroundStyle(),
        borderRadius: element.borderRadius || '0',
        border: element.borderStyle !== 'none' ? 
          `${element.borderWidth || '1px'} ${element.borderStyle || 'solid'} ${element.borderColor || '#dee2e6'}` : 
          'none',
        padding: element.padding || '0',
        margin: element.margin || '0',
        width: '100%',
        overflow: 'hidden',
      }}>
        {renderImage()}
        {renderOverlay()}
      </div>
      {element.caption && (
        <div style={{
          fontSize: '12px',
          color: '#6c757d',
          marginTop: '5px',
          textAlign: 'center'
        }}>
          {element.caption}
        </div>
      )}
    </div>
  );
};

export default ImagePreview;
