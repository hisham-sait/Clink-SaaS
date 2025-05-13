import React from 'react';
import { ProfileElementData } from '../ProfileElementData';
import { imageStyles as styles } from '../../shared';
import { renderProfileJSX } from '../utils/renderProfileJSX';

interface ProfilePreviewProps {
  element: ProfileElementData;
  showTitle?: boolean;
}

/**
 * Preview component for the profile element
 * Shows a live preview of the profile with all styling effects
 */
const ProfilePreview: React.FC<ProfilePreviewProps> = ({ 
  element, 
  showTitle = true 
}) => {
  return (
    <div style={styles.previewContainer}>
      {showTitle && (
        <div style={styles.previewLabel}>
          Preview
        </div>
      )}
      
      <div style={{
        border: '1px solid #dee2e6',
        borderRadius: '3px',
        padding: '10px',
        backgroundColor: '#ffffff'
      }}>
        {renderProfileJSX(element)}
      </div>
    </div>
  );
};

export default ProfilePreview;
