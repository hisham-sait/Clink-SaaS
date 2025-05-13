import React, { useState } from 'react';
import { FaLink, FaMousePointer } from 'react-icons/fa';
import { ButtonElementData } from '../ButtonElementData';
import { buttonStyles as styles } from '../../shared';
import { getButtonStyle, updateBoxShadow } from '../utils/defaultProperties';

interface ButtonPreviewProps {
  element: ButtonElementData;
  showTitle?: boolean;
}

/**
 * A component that previews a button with all styling and effects
 */
const ButtonPreview: React.FC<ButtonPreviewProps> = ({ 
  element, 
  showTitle = false 
}) => {
  // State to toggle hover effect preview
  const [showHoverState, setShowHoverState] = useState(false);
  
  // Get the button style
  const buttonStyle = getButtonStyle(element);
  
  // Generate hover styles
  const getHoverStyles = () => {
    if (!element.hoverEffect) return {};
    
    const hoverStyles: React.CSSProperties = {};
    const transitionDuration = element.hoverTransitionDuration || '0.3s';
    
    // Apply effect type specific styles
    switch (element.hoverEffectType) {
      case 'zoom':
        hoverStyles.transform = 'scale(1.1)';
        break;
      case 'brighten':
        hoverStyles.filter = 'brightness(1.2)';
        break;
      case 'darken':
        hoverStyles.filter = 'brightness(0.8)';
        break;
      case 'shadow':
        hoverStyles.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        break;
      case 'elevate':
        hoverStyles.transform = 'translateY(-3px)';
        hoverStyles.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        break;
      case 'color-shift':
        // Use custom hover colors if provided, otherwise use defaults
        break;
    }
    
    // Apply custom hover colors if provided
    if (element.hoverButtonColor) {
      if (element.buttonStyle === 'gradient') {
        hoverStyles.backgroundImage = `linear-gradient(45deg, ${element.hoverButtonColor}, ${adjustColor(element.hoverButtonColor, 40)})`;
      } else if (element.buttonStyle !== 'text') {
        hoverStyles.backgroundColor = element.hoverButtonColor;
      }
      
      if (element.buttonStyle === 'outline' || element.buttonStyle === 'text') {
        hoverStyles.color = element.hoverButtonColor;
      }
    }
    
    if (element.hoverTextColor) {
      hoverStyles.color = element.hoverTextColor;
    }
    
    if (element.hoverBorderColor && element.buttonStyle !== 'text') {
      hoverStyles.borderColor = element.hoverBorderColor;
    }
    
    return hoverStyles;
  };
  
  // Helper function to adjust color brightness
  function adjustColor(color: string, amount: number): string {
    // Convert hex to RGB
    let hex = color;
    if (hex.startsWith('#')) {
      hex = hex.slice(1);
    }
    
    // Parse the hex values
    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);
    
    // Adjust the values
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // Render the button or a placeholder
  const renderButton = () => {
    // Combine normal and hover styles if showing hover state
    const combinedStyle = showHoverState && element.hoverEffect
      ? { ...buttonStyle, ...getHoverStyles() }
      : buttonStyle;
    
    return (
      <div 
        style={{
          textAlign: element.alignment as any || 'left',
          width: '100%',
        }}
      >
        <a 
          href="#"
          style={combinedStyle}
          onClick={(e) => e.preventDefault()}
        >
          {element.buttonText || 'Click Me'}
        </a>
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
            onClick={() => setShowHoverState(!showHoverState)}
          >
            <FaMousePointer size={10} style={{ marginRight: '3px' }} />
            <span>{showHoverState ? 'Hide Hover' : 'Show Hover'}</span>
          </div>
        )}
      </div>
      
      {renderButton()}
    </div>
  );
};

export default ButtonPreview;
