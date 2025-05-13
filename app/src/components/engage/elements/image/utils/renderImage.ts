import { ImageElementData } from '../ImageElementData';
import { updateBoxShadow, getFilterStyle as getFilterStyleFromProps } from './defaultProperties';

// Re-export getFilterStyle for use in other files
export { getFilterStyle } from './defaultProperties';

/**
 * Generate CSS styles for the image container
 * @param element The image element data
 * @returns CSS properties object for the container
 */
export const getImageContainerStyles = (element: ImageElementData): React.CSSProperties => {
  // Create container styles
  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: element.width || '100%',
    height: element.height || 'auto', // Explicitly set height
    margin: element.margin || '0 0 1rem 0',
    padding: element.padding || '0',
    display: 'inline-block',
    
    // Border properties
    borderRadius: element.borderRadius || '0',
  };
  
  // Add border if not none
  if (element.borderStyle && element.borderStyle !== 'none') {
    containerStyles.borderStyle = element.borderStyle;
    containerStyles.borderWidth = element.borderWidth || '1px';
    containerStyles.borderColor = element.borderColor || '#dee2e6';
  }
  
  // Add background color if not transparent
  if (element.backgroundColor && element.backgroundColor !== 'transparent') {
    containerStyles.backgroundColor = element.backgroundColor;
  }
  
  // Add background gradient if not none
  if (element.backgroundGradient && element.backgroundGradient !== 'none') {
    containerStyles.backgroundImage = element.backgroundGradient;
  }
  
  // Add box shadow if not none
  if (element.boxShadow && element.boxShadow !== 'none') {
    containerStyles.boxShadow = element.boxShadow;
  }
  
  // Add responsive styles for mobile if specified
  if (element.mobileWidth || element.mobileHeight) {
    const mediaQuery = '@media (max-width: 768px)';
    const mobileStyles: any = {};
    
    if (element.mobileWidth) {
      mobileStyles.width = element.mobileWidth;
    }
    
    if (element.mobileHeight) {
      mobileStyles.height = element.mobileHeight;
    }
    
    // Note: This won't work directly in React's style object
    // but we're keeping it for reference when generating HTML/CSS
    (containerStyles as any)[mediaQuery] = mobileStyles;
  }
  
  return containerStyles;
};

/**
 * Generate CSS styles for the image element
 * @param element The image element data
 * @returns CSS properties object for the image
 */
export const getImageStyles = (element: ImageElementData): React.CSSProperties => {
  // Create image styles
  const imageStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: (element.objectFit || 'contain') as any,
    borderRadius: element.borderRadius || '0',
  };
  
  // Add filter effects
  const filterStyle = getFilterStyleFromProps(element);
  if (filterStyle !== 'none') {
    imageStyles.filter = filterStyle;
  }
  
  // Add opacity if not 1
  if (element.opacity !== undefined && element.opacity !== 1) {
    imageStyles.opacity = element.opacity;
  }
  
  // Add animation if not none
  if (element.animation && element.animation !== 'none') {
    imageStyles.animation = `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}`;
  }
  
  return imageStyles;
};

/**
 * Generate CSS styles for the caption
 * @returns CSS properties object for the caption
 */
export const getCaptionStyles = (): React.CSSProperties => {
  return {
    marginTop: '8px',
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#6c757d',
  };
};

/**
 * Generate CSS styles for the overlay
 * @param element The image element data
 * @returns CSS properties object for the overlay
 */
export const getOverlayStyles = (element: ImageElementData): React.CSSProperties => {
  // Create overlay styles
  const overlayStyles: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    backgroundColor: element.overlayColor || 'rgba(0,0,0,0.5)',
    opacity: element.overlayOpacity || 0.5,
    borderRadius: element.borderRadius || '0',
  };
  
  // Set alignment based on position
  if (element.overlayPosition) {
    // Vertical alignment
    if (element.overlayPosition.includes('top')) {
      overlayStyles.alignItems = 'flex-start';
    } else if (element.overlayPosition.includes('bottom')) {
      overlayStyles.alignItems = 'flex-end';
    } else {
      overlayStyles.alignItems = 'center';
    }
    
    // Horizontal alignment
    if (element.overlayPosition.includes('left')) {
      overlayStyles.justifyContent = 'flex-start';
    } else if (element.overlayPosition.includes('right')) {
      overlayStyles.justifyContent = 'flex-end';
    } else {
      overlayStyles.justifyContent = 'center';
    }
  } else {
    // Default to center
    overlayStyles.alignItems = 'center';
    overlayStyles.justifyContent = 'center';
  }
  
  return overlayStyles;
};

/**
 * Generate CSS styles for the overlay text
 * @param element The image element data
 * @returns CSS properties object for the overlay text
 */
export const getOverlayTextStyles = (element: ImageElementData): React.CSSProperties => {
  return {
    color: element.overlayTextColor || '#ffffff',
    fontSize: element.overlayTextSize || '1rem',
    padding: '10px',
    textAlign: 'center',
  };
};

/**
 * Ensure image URL is properly formatted
 * @param url The image URL
 * @returns Properly formatted URL
 */
export const formatImageUrl = (url: string | undefined): string => {
  if (!url) {
    return 'https://via.placeholder.com/800x400';
  }
  
  // Fix for relative URLs - ensure they start with a slash
  if (!url.startsWith('http') && !url.startsWith('/')) {
    url = '/' + url;
  }
  
  // Fix for uploads/media URLs - ensure they start with a single slash
  if (url.includes('/uploads/media/')) {
    url = '/' + url.replace(/^\/+/, '');
  }
  
  return url;
};

/**
 * Render image element as HTML string (for public view)
 * @param element The image element data
 * @returns HTML string
 */
export const renderImageHTML = (element: ImageElementData): string => {
  const imageUrl = formatImageUrl(element.imageUrl || element.src);
  const altText = element.imageAlt || element.alt || element.label || 'Image';
  
  // Convert React styles to inline CSS strings
  const containerStyles = getImageContainerStyles(element);
  const imageStyles = getImageStyles(element);
  const captionStyles = getCaptionStyles();
  const overlayStyles = getOverlayStyles(element);
  const overlayTextStyles = getOverlayTextStyles(element);
  
  // Convert style objects to CSS strings
  const containerStyleStr = Object.entries(containerStyles)
    .filter(([key]) => !key.startsWith('@media')) // Filter out media queries for now
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  const imageStyleStr = Object.entries(imageStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  const captionStyleStr = Object.entries(captionStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  const overlayStyleStr = Object.entries(overlayStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  const overlayTextStyleStr = Object.entries(overlayTextStyles)
    .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
    .join('; ');
  
  // Add media queries for responsive behavior
  let responsiveStyles = '';
  if (element.hideOnMobile) {
    responsiveStyles += `@media (max-width: 768px) { display: none; }`;
  }
  if (element.hideOnDesktop) {
    responsiveStyles += `@media (min-width: 769px) { display: none; }`;
  }
  
  // Build HTML string
  let html = `<div style="${containerStyleStr}">`;
  
  // Add image
  html += `<img src="${imageUrl}" alt="${altText}" style="${imageStyleStr}">`;
  
  // Add caption if present
  if (element.caption) {
    html += `<div style="${captionStyleStr}">${element.caption}</div>`;
  }
  
  // Add overlay if enabled
  if (element.overlay) {
    html += `<div style="${overlayStyleStr}">`;
    if (element.overlayText) {
      html += `<span style="${overlayTextStyleStr}">${element.overlayText}</span>`;
    }
    html += `</div>`;
  }
  
  html += `</div>`;
  
  return html;
};

/**
 * Generate EJS template for rendering an image element
 * @returns EJS template string
 */
export const getImageEJSTemplate = (): string => {
  return `
<div style="
  position: relative;
  width: <%= element.width || '100%' %>;
  height: <%= element.height || 'auto' %>;
  margin: <%= element.margin || '0 0 1rem 0' %>;
  padding: <%= element.padding || '0' %>;
  display: inline-block;
  
  /* Border properties */
  border: <%= element.borderStyle !== 'none' ? (element.border || '1px solid #dee2e6') : 'none' %>;
  border-color: <%= element.borderColor || '#dee2e6' %>;
  border-width: <%= element.borderWidth || '1px' %>;
  border-style: <%= element.borderStyle || 'solid' %>;
  border-radius: <%= element.borderRadius || '0' %>;
  
  /* Background properties */
  background-color: <%= element.backgroundColor || 'transparent' %>;
  background-image: <%= element.backgroundGradient || 'none' %>;
  
  /* Shadow properties */
  box-shadow: <%= element.boxShadow || 'none' %>;
  
  /* Responsive properties */
  <% if (element.hideOnMobile) { %>
  @media (max-width: 768px) { display: none; }
  <% } %>
  
  <% if (element.hideOnDesktop) { %>
  @media (min-width: 769px) { display: none; }
  <% } %>
">
  <img src="<%= formatImageUrl(element.imageUrl || element.src) %>" 
       alt="<%= element.imageAlt || element.alt || element.label || 'Image' %>" 
       class="img-fluid" 
       style="
         width: 100%;
         height: 100%;
         object-fit: <%= element.objectFit || 'contain' %>;
         border-radius: <%= element.borderRadius || '0' %>;
         
         /* Filter properties */
         filter: <%= getFilterStyleFromProps(element) %>;
         
         opacity: <%= element.opacity || 1 %>;
         
         /* Animation properties */
         <% if (element.animation && element.animation !== 'none') { %>
         animation: <%= element.animation %> <%= element.animationDuration || '1s' %> <%= element.animationEasing || 'ease' %> <%= element.animationDelay || '0s' %>;
         <% } %>
       "
  >
  
  <% if (element.caption) { %>
  <div style="
    margin-top: 8px;
    text-align: center;
    font-size: 0.9rem;
    color: #6c757d;
  "><%= element.caption %></div>
  <% } %>
  
  <% if (element.overlay) { %>
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: <%= element.overlayPosition?.includes('top') ? 'flex-start' : 
                  element.overlayPosition?.includes('bottom') ? 'flex-end' : 'center' %>;
    justify-content: <%= element.overlayPosition?.includes('left') ? 'flex-start' : 
                      element.overlayPosition?.includes('right') ? 'flex-end' : 'center' %>;
    background-color: <%= element.overlayColor || 'rgba(0,0,0,0.5)' %>;
    opacity: <%= element.overlayOpacity || 0.5 %>;
    border-radius: <%= element.borderRadius || '0' %>;
  ">
    <% if (element.overlayText) { %>
    <span style="
      color: <%= element.overlayTextColor || '#ffffff' %>;
      font-size: <%= element.overlayTextSize || '1rem' %>;
      padding: 10px;
      text-align: center;
    "><%= element.overlayText %></span>
    <% } %>
  </div>
  <% } %>
</div>
  `.trim();
};
