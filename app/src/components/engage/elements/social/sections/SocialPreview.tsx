import React, { useState } from 'react';
import { FaMousePointer } from 'react-icons/fa';
import { SocialElementData } from '../SocialElementData';
import { renderSocialJSX } from '../utils/renderSocialJSX';

interface SocialPreviewProps {
  element: SocialElementData;
  showTitle?: boolean;
}

/**
 * Preview component for social media links element
 * Shows how the social links will appear with current settings
 */
const SocialPreview: React.FC<SocialPreviewProps> = ({ element, showTitle = true }) => {
  const [previewHover, setPreviewHover] = useState(false);
  
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
      minHeight: '60px',
      position: 'relative',
      overflow: 'hidden',
      height: 'auto',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: '5px'
      }}>
        {showTitle && (
          <div style={{
            fontSize: '10px',
            color: '#6c757d',
            textAlign: 'center'
          }}>
            Preview
          </div>
        )}
        
        {element.hoverEffect && (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '10px',
              color: '#6c757d',
              cursor: 'pointer'
            }}
            onClick={() => setPreviewHover(!previewHover)}
          >
            <FaMousePointer size={10} style={{ marginRight: '3px' }} />
            <span>{previewHover ? 'Hide Hover' : 'Show Hover'}</span>
          </div>
        )}
      </div>
      
      <div style={{ width: '100%' }}>
        {renderSocialJSX(element, previewHover)}
      </div>
    </div>
  );
};

export default SocialPreview;
