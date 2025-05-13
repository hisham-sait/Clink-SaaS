import React from 'react';
import { ImageElementData } from '../ImageElementData';
import { 
  getImageContainerStyles, 
  getImageStyles, 
  getCaptionStyles, 
  getOverlayStyles, 
  getOverlayTextStyles,
  formatImageUrl
} from './renderImage';

/**
 * Render image element as React JSX (for canvas and preview)
 * @param element The image element data
 * @returns React JSX element
 */
export const renderImageJSX = (element: ImageElementData): JSX.Element => {
  const imageUrl = formatImageUrl(element.imageUrl || element.src);
  const altText = element.imageAlt || element.alt || element.label || 'Image';
  
  // Add responsive classes based on visibility settings
  let className = 'image-element';
  
  // Apply responsive classes directly to the style for more reliable behavior
  const mediaStyles: React.CSSProperties = {};
  
  if (element.hideOnMobile) {
    className += ' d-none d-md-block hide-on-mobile'; // Bootstrap classes to hide on mobile
  }
  
  if (element.hideOnDesktop) {
    className += ' d-md-none hide-on-desktop'; // Bootstrap class to hide on desktop
  }
  
  // Create container styles with explicit height
  const containerStyles = {
    ...getImageContainerStyles(element),
    height: element.height || 'auto', // Ensure height is explicitly set
  };
  
  // Create image styles with animation
  const imageStyles = {
    ...getImageStyles(element),
  };
  
  // Add animation CSS if specified
  if (element.animation && element.animation !== 'none') {
    imageStyles.animation = `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}`;
  }
  
  // Add hover effect styles
  const hoverStyles: React.CSSProperties = {};
  if (element.hoverEffect) {
    switch (element.hoverEffectType) {
      case 'zoom':
        hoverStyles.transform = 'scale(1.1)';
        hoverStyles.transition = 'transform 0.3s ease';
        break;
      case 'brighten':
        hoverStyles.filter = 'brightness(1.2)';
        hoverStyles.transition = 'filter 0.3s ease';
        break;
      case 'darken':
        hoverStyles.filter = 'brightness(0.8)';
        hoverStyles.transition = 'filter 0.3s ease';
        break;
      case 'blur':
        hoverStyles.filter = 'blur(3px)';
        hoverStyles.transition = 'filter 0.3s ease';
        break;
      case 'grayscale':
        hoverStyles.filter = 'grayscale(100%)';
        hoverStyles.transition = 'filter 0.3s ease';
        break;
      case 'sepia':
        hoverStyles.filter = 'sepia(100%)';
        hoverStyles.transition = 'filter 0.3s ease';
        break;
      case 'shadow':
        hoverStyles.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
        hoverStyles.transition = 'box-shadow 0.3s ease';
        break;
    }
  }
  
  // Apply background gradient if specified
  if (element.backgroundGradient && element.backgroundGradient !== 'none') {
    containerStyles.backgroundImage = element.backgroundGradient;
  }
  
  // Create a style tag for hover effects
  const hoverStyleTag = element.hoverEffect ? (
    <style>
      {`
        .image-element-${element.id}:hover img {
          ${Object.entries(hoverStyles).map(([key, value]) => `${key}: ${value};`).join('\n')}
        }
      `}
    </style>
  ) : null;
  
  // Handle lightbox functionality
  const handleImageClick = () => {
    if (element.enableLightbox) {
      // Create a lightbox effect
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox-overlay';
      lightbox.style.position = 'fixed';
      lightbox.style.top = '0';
      lightbox.style.left = '0';
      lightbox.style.width = '100%';
      lightbox.style.height = '100%';
      lightbox.style.backgroundColor = 'rgba(0,0,0,0.9)';
      lightbox.style.display = 'flex';
      lightbox.style.alignItems = 'center';
      lightbox.style.justifyContent = 'center';
      lightbox.style.zIndex = '9999';
      
      // Create the image element
      const img = document.createElement('img');
      img.src = imageUrl;
      img.style.maxWidth = '90%';
      img.style.maxHeight = '90%';
      img.style.objectFit = 'contain';
      
      // Add caption if available
      if (element.lightboxCaption || element.caption) {
        const caption = document.createElement('div');
        caption.textContent = element.lightboxCaption || element.caption || '';
        caption.style.position = 'absolute';
        caption.style.bottom = '20px';
        caption.style.left = '0';
        caption.style.width = '100%';
        caption.style.textAlign = 'center';
        caption.style.color = 'white';
        caption.style.padding = '10px';
        caption.style.backgroundColor = 'rgba(0,0,0,0.5)';
        lightbox.appendChild(caption);
      }
      
      // Close lightbox when clicked
      lightbox.onclick = () => {
        document.body.removeChild(lightbox);
      };
      
      lightbox.appendChild(img);
      document.body.appendChild(lightbox);
    }
  };
  
  return (
    <>
      {hoverStyleTag}
      <div 
        style={containerStyles} 
        className={`${className} image-element-${element.id}`}
      >
        <img 
          src={imageUrl} 
          alt={altText} 
          style={imageStyles}
          onClick={element.enableLightbox ? handleImageClick : undefined}
          className={element.enableLightbox ? 'lightbox-enabled' : ''}
        />
        
        {element.caption && (
          <div style={getCaptionStyles()}>
            {element.caption}
          </div>
        )}
        
        {element.overlay && (
          <div style={getOverlayStyles(element)}>
            {element.overlayText && (
              <span style={getOverlayTextStyles(element)}>
                {element.overlayText}
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
};
