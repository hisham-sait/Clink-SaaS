import React from 'react';
import { SocialElementData } from '../SocialElementData';
import { 
  FaLinkedin, FaXTwitter, FaFacebook, FaInstagram, FaGithub, FaYoutube, 
  FaPinterest, FaTiktok, FaSnapchat, FaReddit, FaLink 
} from 'react-icons/fa6';
import { getSocialIconSize } from './defaultProperties';

/**
 * Renders a social media links element as JSX
 * @param element The social element data
 * @param previewHover Optional flag to preview hover state
 * @returns JSX representation of the social element
 */
export const renderSocialJSX = (element: SocialElementData, previewHover: boolean = false): JSX.Element => {
  // Determine animation class
  let animationClass = '';
  if (element.animation && element.animation !== 'none') {
    animationClass = `animate__animated animate__${element.animation}`;
  }
  
  // Determine responsive classes
  let responsiveClass = '';
  if (element.hideOnMobile) {
    responsiveClass += ' hide-on-mobile';
  }
  if (element.hideOnDesktop) {
    responsiveClass += ' hide-on-desktop';
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
        return <FaLink />;
    }
  };
  
  // Determine the container style based on element properties
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: element.spacing || '1rem',
    justifyContent: element.alignment === 'center' ? 'center' : 
                    element.alignment === 'right' ? 'flex-end' : 'flex-start',
    width: element.width || '100%',
    height: element.height || 'auto',
    margin: element.margin || '1rem 0',
    padding: element.padding || '0',
    backgroundColor: element.backgroundColor || 'transparent',
    borderRadius: element.borderRadius || '0',
    border: element.borderStyle !== 'none' ? 
      `${element.borderWidth || '1px'} ${element.borderStyle || 'solid'} ${element.borderColor || '#000000'}` : 
      'none',
    boxShadow: element.boxShadow || 'none'
  };
  
  // Determine the icon size
  const iconSize = getSocialIconSize(element.iconSize || 'md');
  
  // Get hover styles
  const getHoverStyles = (): React.CSSProperties => {
    if (!element.hoverEffect) return {};
    
    const hoverStyles: React.CSSProperties = {};
    
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
    if (element.hoverIconColor) {
      hoverStyles.color = element.hoverIconColor;
    } else if (element.hoverEffectType === 'color-shift' && element.iconColor) {
      hoverStyles.color = adjustColor(element.iconColor, 40);
    }
    
    if (element.hoverBackgroundColor && element.displayStyle === 'buttons') {
      hoverStyles.backgroundColor = element.hoverBackgroundColor;
    }
    
    if (element.hoverBorderColor && element.borderStyle !== 'none') {
      hoverStyles.borderColor = element.hoverBorderColor;
    }
    
    return hoverStyles;
  };
  
  // Render social links based on display style
  const renderSocialLinks = () => {
    if (!element.links || element.links.length === 0) {
      return <div style={{ color: '#666' }}>No social links added</div>;
    }
    
    return element.links.map((link, index) => {
      // Base icon style
      const iconStyle: React.CSSProperties = {
        color: element.iconColor || '#555555',
        fontSize: iconSize
      };
      
      // Apply hover styles if in preview mode
      if (previewHover && element.hoverEffect) {
        const hoverStyles = getHoverStyles();
        if (hoverStyles.color) {
          iconStyle.color = hoverStyles.color as string;
        }
      }
      
      // For button style
      const buttonStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: '#f0f0f0',
        borderRadius: '4px',
        color: element.iconColor || '#555555',
        textDecoration: 'none',
        fontSize: '0.875rem'
      };
      
      // Apply hover styles to button if in preview mode
      if (previewHover && element.hoverEffect) {
        const hoverStyles = getHoverStyles();
        Object.assign(buttonStyle, hoverStyles);
      }
      
      // For text style
      const textStyle: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: element.iconColor || '#555555',
        textDecoration: 'none',
        fontSize: '0.875rem'
      };
      
      // Apply hover styles to text if in preview mode
      if (previewHover && element.hoverEffect) {
        const hoverStyles = getHoverStyles();
        Object.assign(textStyle, hoverStyles);
      }
      
      // For icon style
      const iconLinkStyle: React.CSSProperties = {
        color: 'inherit',
        textDecoration: 'none'
      };
      
      // Apply hover styles to icon if in preview mode
      if (previewHover && element.hoverEffect) {
        const hoverStyles = getHoverStyles();
        Object.assign(iconLinkStyle, hoverStyles);
      }
      
      switch (element.displayStyle) {
        case 'buttons':
          return (
            <a 
              key={index} 
              href={link.url || '#'} 
              target={element.openInNewTab ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              style={buttonStyle}
            >
              <span style={iconStyle}>{getSocialIcon(link.platform)}</span>
              {element.showLabels && <span>{link.label || link.platform}</span>}
            </a>
          );
        case 'text':
          return (
            <a 
              key={index} 
              href={link.url || '#'} 
              target={element.openInNewTab ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              style={textStyle}
            >
              <span style={iconStyle}>{getSocialIcon(link.platform)}</span>
              {element.showLabels && <span>{link.label || link.platform}</span>}
            </a>
          );
        case 'icons':
        default:
          return (
            <a 
              key={index} 
              href={link.url || '#'} 
              target={element.openInNewTab ? "_blank" : "_self"} 
              rel="noopener noreferrer"
              style={iconLinkStyle}
            >
              <span style={iconStyle}>{getSocialIcon(link.platform)}</span>
            </a>
          );
      }
    });
  };
  
  // Apply animation properties if specified
  if (element.animation && element.animation !== 'none') {
    if (element.animationDuration) {
      (containerStyle as any).animationDuration = element.animationDuration;
    }
    if (element.animationDelay) {
      (containerStyle as any).animationDelay = element.animationDelay;
    }
    if (element.animationEasing) {
      (containerStyle as any).animationTimingFunction = element.animationEasing;
    }
  }
  
  // Create a style tag for hover effects (only needed when not in preview hover mode)
  const hoverStyleTag = (element.hoverEffect && !previewHover) ? (
    <style>
      {`
        .social-element-${element.id} a:hover {
          ${Object.entries(getHoverStyles()).map(([key, value]) => `${key}: ${value};`).join('\n')}
        }
        
        .social-element-${element.id} a:active {
          ${element.hoverEffectType === 'zoom' ? 'transform: scale(0.95);' : ''}
          ${element.hoverEffectType === 'brighten' ? 'filter: brightness(0.9);' : ''}
          ${element.hoverEffectType === 'darken' ? 'filter: brightness(0.7);' : ''}
          ${element.hoverEffectType === 'shadow' ? 'box-shadow: 0 2px 8px rgba(0,0,0,0.4);' : ''}
          ${element.hoverEffectType === 'elevate' ? 'transform: translateY(0px); box-shadow: 0 2px 5px rgba(0,0,0,0.3);' : ''}
          ${!['zoom', 'brighten', 'darken', 'shadow', 'elevate'].includes(element.hoverEffectType || '') ? 'transform: scale(0.98);' : ''}
          
          ${element.hoverIconColor ? `color: ${adjustColor(element.hoverIconColor, -20)};` : ''}
          ${element.hoverBackgroundColor && element.displayStyle === 'buttons' ? `background-color: ${adjustColor(element.hoverBackgroundColor, -20)};` : ''}
          
          transition: all 0.1s ease-out;
        }
        
        .social-element-${element.id} a {
          transition: all ${element.hoverTransitionDuration || '0.3s'} ease;
        }
      `}
    </style>
  ) : null;
  
  return (
    <>
      {hoverStyleTag}
      <div 
        className={`social-element social-element-${element.id} ${animationClass} ${responsiveClass}`}
        style={containerStyle}
        aria-label={element.ariaLabel || 'Social Media Links'}
        role={element.role || 'navigation'}
        tabIndex={element.tabIndex || 0}
        data-element-id={element.id}
        data-element-type={element.type}
      >
        {renderSocialLinks()}
      </div>
    </>
  );
};
