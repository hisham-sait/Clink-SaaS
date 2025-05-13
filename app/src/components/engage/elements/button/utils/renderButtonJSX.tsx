import React from 'react';
import { ButtonElementData } from '../ButtonElementData';
import { getButtonStyle } from './defaultProperties';

/**
 * Render button element as React JSX (for canvas and preview)
 * @param element The button element data
 * @param previewHover Optional flag to preview hover state
 * @returns React JSX element
 */
export const renderButtonJSX = (element: ButtonElementData, previewHover: boolean = false): JSX.Element => {
  // Get base button style
  const baseButtonStyle = getButtonStyle(element);
  
  // Add responsive classes based on visibility settings
  let className = 'button-element';
  
  if (element.hideOnMobile) {
    className += ' d-none d-md-block hide-on-mobile'; // Bootstrap classes to hide on mobile
  }
  
  if (element.hideOnDesktop) {
    className += ' d-md-none hide-on-desktop'; // Bootstrap class to hide on desktop
  }
  
  // Add animation CSS if specified
  if (element.animation && element.animation !== 'none') {
    baseButtonStyle.animation = `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}`;
  }
  
  // Add hover effect styles
  const hoverStyles: React.CSSProperties = {};
  const transitionDuration = element.hoverTransitionDuration || '0.3s';
  
  if (element.hoverEffect) {
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
    
    // Build transition property based on what's changing
    const transitionProps = [];
    if (hoverStyles.transform) transitionProps.push('transform');
    if (hoverStyles.filter) transitionProps.push('filter');
    if (hoverStyles.boxShadow) transitionProps.push('box-shadow');
    if (hoverStyles.backgroundColor || hoverStyles.backgroundImage) transitionProps.push('background-color', 'background-image');
    if (hoverStyles.color) transitionProps.push('color');
    if (hoverStyles.borderColor) transitionProps.push('border-color');
    
    // If no specific properties are changing, add a default set
    if (transitionProps.length === 0) {
      transitionProps.push('color', 'background-color', 'border-color', 'box-shadow');
    }
    
    hoverStyles.transition = transitionProps.map(prop => `${prop} ${transitionDuration} ease`).join(', ');
  }
  
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
  
  // Apply hover styles directly if previewHover is true
  const finalButtonStyle = previewHover && element.hoverEffect
    ? { ...baseButtonStyle, ...hoverStyles }
    : baseButtonStyle;
  
  // Create a style tag for hover effects (only needed when not in preview hover mode)
  const hoverStyleTag = (element.hoverEffect && !previewHover) ? (
    <style>
      {`
        .button-element-${element.id}:hover {
          ${Object.entries(hoverStyles).map(([key, value]) => `${key}: ${value};`).join('\n')}
        }
      `}
    </style>
  ) : null;
  
  // Determine the button content based on icon and text
  const buttonContent = () => {
    if (!element.icon) {
      return element.buttonText || 'Click Me';
    }
    
    // This is a simplified approach - in a real implementation, you would dynamically import the icon
    // For now, we'll just show the icon name in brackets
    if (element.iconPosition === 'left') {
      return (
        <>
          <span style={{ marginRight: '5px' }}>[{element.icon}]</span>
          {element.buttonText || 'Click Me'}
        </>
      );
    } else {
      return (
        <>
          {element.buttonText || 'Click Me'}
          <span style={{ marginLeft: '5px' }}>[{element.icon}]</span>
        </>
      );
    }
  };
  
  // Determine the appropriate element type and props
  const renderButtonElement = () => {
    // Common props for all button types
    const commonProps = {
      className: `${className} button-element-${element.id}`,
      style: finalButtonStyle,
      'aria-label': element.ariaLabel || element.buttonText || 'Button',
      role: element.role || 'button',
      tabIndex: element.tabIndex || 0
    };
    
    // Render based on button type
    switch (element.buttonType) {
      case 'submit':
        return (
          <button 
            {...commonProps}
            type="submit"
          >
            {buttonContent()}
          </button>
        );
      case 'reset':
        return (
          <button 
            {...commonProps}
            type="reset"
          >
            {buttonContent()}
          </button>
        );
      default: // 'link'
        return (
          <a 
            {...commonProps}
            href={element.url || '#'}
            target={element.target || '_self'}
            onClick={(e) => e.preventDefault()}
          >
            {buttonContent()}
          </a>
        );
    }
  };
  
  return (
    <>
      {hoverStyleTag}
      <div 
        style={{ 
          textAlign: element.alignment as any || 'left',
          width: '100%'
        }}
      >
        {renderButtonElement()}
      </div>
    </>
  );
};
