import { ImageElementData } from '../ImageElementData';
import { formatImageUrl } from './renderImage';
import { getFilterStyle } from './defaultProperties';

/**
 * Render image element as EJS template string (for page-view.ejs)
 * This function generates the EJS template code that will be used in the page-view.ejs file
 * 
 * @param element The image element data
 * @returns EJS template string
 */
export const renderImageEJS = (element: ImageElementData): string => {
  // Format the image URL
  const imageUrl = formatImageUrl(element.imageUrl || element.src);
  
  // Generate a unique ID for this element for hover effects
  const elementId = `image-${element.id || Date.now()}`;
  
  // Generate hover effect CSS if needed
  let hoverCss = '';
  if (element.hoverEffect) {
    switch (element.hoverEffectType) {
      case 'zoom':
        hoverCss = `
        .${elementId}:hover img {
          transform: scale(1.1);
          transition: transform 0.3s ease;
        }`;
        break;
      case 'brighten':
        hoverCss = `
        .${elementId}:hover img {
          filter: brightness(1.2);
          transition: filter 0.3s ease;
        }`;
        break;
      case 'darken':
        hoverCss = `
        .${elementId}:hover img {
          filter: brightness(0.8);
          transition: filter 0.3s ease;
        }`;
        break;
      case 'blur':
        hoverCss = `
        .${elementId}:hover img {
          filter: blur(3px);
          transition: filter 0.3s ease;
        }`;
        break;
      case 'grayscale':
        hoverCss = `
        .${elementId}:hover img {
          filter: grayscale(100%);
          transition: filter 0.3s ease;
        }`;
        break;
      case 'sepia':
        hoverCss = `
        .${elementId}:hover img {
          filter: sepia(100%);
          transition: filter 0.3s ease;
        }`;
        break;
      case 'shadow':
        hoverCss = `
        .${elementId}:hover img {
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          transition: box-shadow 0.3s ease;
        }`;
        break;
    }
  }
  
  // Add responsive styles for mobile
  let mobileStyles = '';
  if (element.mobileWidth || element.mobileHeight) {
    mobileStyles = `
    @media (max-width: 768px) {
      ${element.mobileWidth ? `width: ${element.mobileWidth};` : ''}
      ${element.mobileHeight ? `height: ${element.mobileHeight};` : ''}
    }`;
  }
  
  // Add lightbox functionality
  let lightboxScript = '';
  if (element.enableLightbox) {
    lightboxScript = `
    <script>
      document.querySelector('.${elementId} img').addEventListener('click', function() {
        // Create lightbox overlay
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
        
        // Create image element
        const img = document.createElement('img');
        img.src = '${imageUrl}';
        img.style.maxWidth = '90%';
        img.style.maxHeight = '90%';
        img.style.objectFit = 'contain';
        
        // Add caption if available
        ${(element.lightboxCaption || element.caption) ? `
        const caption = document.createElement('div');
        caption.textContent = '${element.lightboxCaption || element.caption || ''}';
        caption.style.position = 'absolute';
        caption.style.bottom = '20px';
        caption.style.left = '0';
        caption.style.width = '100%';
        caption.style.textAlign = 'center';
        caption.style.color = 'white';
        caption.style.padding = '10px';
        caption.style.backgroundColor = 'rgba(0,0,0,0.5)';
        lightbox.appendChild(caption);
        ` : ''}
        
        // Close lightbox when clicked
        lightbox.onclick = function() {
          document.body.removeChild(lightbox);
        };
        
        lightbox.appendChild(img);
        document.body.appendChild(lightbox);
      });
    </script>
    `;
  }
  
  // Add CSS classes for responsive behavior
  let responsiveClasses = '';
  if (element.hideOnMobile) {
    responsiveClasses += ' hide-on-mobile';
  }
  if (element.hideOnDesktop) {
    responsiveClasses += ' hide-on-desktop';
  }
  
  return `
${hoverCss ? `<style>${hoverCss}</style>` : ''}
<div class="image-element-container ${elementId}${responsiveClasses}" style="
  position: relative;
  width: ${element.width || '100%'};
  height: ${element.height || 'auto'};
  margin: ${element.margin || '0 0 1rem 0'};
  padding: ${element.padding || '0'};
  display: inline-block;
  
  /* Border properties */
  ${element.borderStyle !== 'none' ? `
  border: ${element.border || '1px solid #dee2e6'};
  border-color: ${element.borderColor || '#dee2e6'};
  border-width: ${element.borderWidth || '1px'};
  border-style: ${element.borderStyle || 'solid'};
  ` : ''}
  border-radius: ${element.borderRadius || '0'};
  
  /* Background properties */
  background-color: ${element.backgroundColor || 'transparent'};
  ${element.backgroundGradient && element.backgroundGradient !== 'none' ? `background-image: ${element.backgroundGradient};` : ''}
  
  /* Shadow properties */
  ${element.boxShadow && element.boxShadow !== 'none' ? `box-shadow: ${element.boxShadow};` : ''}
  
  /* Responsive properties */
  ${element.hideOnMobile ? '@media (max-width: 768px) { display: none !important; }' : ''}
  ${element.hideOnDesktop ? '@media (min-width: 769px) { display: none !important; }' : ''}
  ${mobileStyles}
">
  <img src="${imageUrl}" 
       alt="${element.imageAlt || element.alt || element.label || 'Image'}" 
       class="img-fluid ${element.enableLightbox ? 'lightbox-enabled' : ''}" 
       style="
         width: 100%;
         height: 100%;
         object-fit: ${element.objectFit || 'contain'};
         border-radius: ${element.borderRadius || '0'};
         ${element.enableLightbox ? 'cursor: pointer;' : ''}
         
         /* Filter properties */
         ${getFilterStyle(element) !== 'none' ? `filter: ${getFilterStyle(element)};` : ''}
         
         ${element.opacity !== undefined && element.opacity !== 1 ? `opacity: ${element.opacity};` : ''}
         
         /* Animation properties */
         ${element.animation && element.animation !== 'none' ? 
           `animation: ${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'};` : ''}
       "
  >
  
  ${element.caption ? `
  <div style="
    margin-top: 8px;
    text-align: center;
    font-size: 0.9rem;
    color: #6c757d;
  ">${element.caption}</div>
  ` : ''}
  
  ${element.overlay ? `
  <div style="
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: ${element.overlayPosition?.includes('top') ? 'flex-start' : 
                  element.overlayPosition?.includes('bottom') ? 'flex-end' : 'center'};
    justify-content: ${element.overlayPosition?.includes('left') ? 'flex-start' : 
                      element.overlayPosition?.includes('right') ? 'flex-end' : 'center'};
    background-color: ${element.overlayColor || 'rgba(0,0,0,0.5)'};
    opacity: ${element.overlayOpacity || 0.5};
    border-radius: ${element.borderRadius || '0'};
  ">
    ${element.overlayText ? `
    <span style="
      color: ${element.overlayTextColor || '#ffffff'};
      font-size: ${element.overlayTextSize || '1rem'};
      padding: 10px;
      text-align: center;
    ">${element.overlayText}</span>
    ` : ''}
  </div>
  ` : ''}
</div>
${lightboxScript}
  `.trim();
};

/**
 * Generate EJS template code for the page-view.ejs file
 * This function returns the EJS template code that will be used in the page-view.ejs file
 * to render image elements
 * 
 * @returns EJS template string
 */
export const getImageEJSTemplateCode = (): string => {
  return `
<% 
  // Ensure image URL is properly formatted
  let imageUrl = element.imageUrl || element.src || 'https://via.placeholder.com/800x400';
  
  // Fix for relative URLs - ensure they start with a slash
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
    imageUrl = '/' + imageUrl;
  }
  
  // Fix for uploads/media URLs - ensure they start with a single slash
  if (imageUrl && imageUrl.includes('/uploads/media/')) {
    imageUrl = '/' + imageUrl.replace(/^\/+/, '');
  }
  
  // Generate a unique ID for this element
  const elementId = \`image-\${element.id || Date.now()}\`;
  
  // Add CSS classes for responsive behavior
  let responsiveClasses = '';
  if (element.hideOnMobile) {
    responsiveClasses += ' hide-on-mobile';
  }
  if (element.hideOnDesktop) {
    responsiveClasses += ' hide-on-desktop';
  }
%>

<% if (element.hoverEffect) { %>
<style>
  <% if (element.hoverEffectType === 'zoom') { %>
  .<%= elementId %>:hover img {
    transform: scale(1.1);
    transition: transform 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'brighten') { %>
  .<%= elementId %>:hover img {
    filter: brightness(1.2);
    transition: filter 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'darken') { %>
  .<%= elementId %>:hover img {
    filter: brightness(0.8);
    transition: filter 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'blur') { %>
  .<%= elementId %>:hover img {
    filter: blur(3px);
    transition: filter 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'grayscale') { %>
  .<%= elementId %>:hover img {
    filter: grayscale(100%);
    transition: filter 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'sepia') { %>
  .<%= elementId %>:hover img {
    filter: sepia(100%);
    transition: filter 0.3s ease;
  }
  <% } else if (element.hoverEffectType === 'shadow') { %>
  .<%= elementId %>:hover img {
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    transition: box-shadow 0.3s ease;
  }
  <% } %>
</style>
<% } %>

<div class="image-element-container <%= elementId %><%= responsiveClasses %>" style="
  position: relative;
  width: <%= element.width || '100%' %>;
  height: <%= element.height || 'auto' %>;
  margin: <%= element.margin || '0 0 1rem 0' %>;
  padding: <%= element.padding || '0' %>;
  display: inline-block;
  
  /* Border properties */
  <% if (element.borderStyle && element.borderStyle !== 'none') { %>
  border: <%= element.border || '1px solid #dee2e6' %>;
  border-color: <%= element.borderColor || '#dee2e6' %>;
  border-width: <%= element.borderWidth || '1px' %>;
  border-style: <%= element.borderStyle || 'solid' %>;
  <% } %>
  border-radius: <%= element.borderRadius || '0' %>;
  
  /* Background properties */
  background-color: <%= element.backgroundColor || 'transparent' %>;
  <% if (element.backgroundGradient && element.backgroundGradient !== 'none') { %>
  background-image: <%= element.backgroundGradient %>;
  <% } %>
  
  /* Shadow properties */
  <% if (element.boxShadow && element.boxShadow !== 'none') { %>
  box-shadow: <%= element.boxShadow %>;
  <% } %>
  
  /* Responsive properties */
  <% if (element.hideOnMobile) { %>
  @media (max-width: 768px) { display: none !important; }
  <% } %>
  
  <% if (element.hideOnDesktop) { %>
  @media (min-width: 769px) { display: none !important; }
  <% } %>
  
  <% if (element.mobileWidth || element.mobileHeight) { %>
  @media (max-width: 768px) {
    <% if (element.mobileWidth) { %>width: <%= element.mobileWidth %>;<% } %>
    <% if (element.mobileHeight) { %>height: <%= element.mobileHeight %>;<% } %>
  }
  <% } %>
">
  <img src="<%= imageUrl %>" 
       alt="<%= element.imageAlt || element.alt || element.label || 'Image' %>" 
       class="img-fluid <%= element.enableLightbox ? 'lightbox-enabled' : '' %>" 
       style="
         width: 100%;
         height: 100%;
         object-fit: <%= element.objectFit || 'contain' %>;
         border-radius: <%= element.borderRadius || '0' %>;
         <% if (element.enableLightbox) { %>cursor: pointer;<% } %>
         
         /* Filter properties */
         <% 
           const filters = [];
           if (element.brightness !== undefined && element.brightness !== 100) {
             filters.push(\`brightness(\${element.brightness}%)\`);
           }
           if (element.contrast !== undefined && element.contrast !== 100) {
             filters.push(\`contrast(\${element.contrast}%)\`);
           }
           if (element.saturation !== undefined && element.saturation !== 100) {
             filters.push(\`saturate(\${element.saturation}%)\`);
           }
           if (element.hueRotate !== undefined && element.hueRotate !== 0) {
             filters.push(\`hue-rotate(\${element.hueRotate}deg)\`);
           }
           if (element.blur !== undefined && element.blur !== '0px') {
             filters.push(\`blur(\${element.blur})\`);
           }
           if (element.grayscale !== undefined && element.grayscale !== 0) {
             filters.push(\`grayscale(\${element.grayscale}%)\`);
           }
           if (element.sepia !== undefined && element.sepia !== 0) {
             filters.push(\`sepia(\${element.sepia}%)\`);
           }
         %>
         <% if (filters.length > 0) { %>
         filter: <%= filters.join(' ') %>;
         <% } %>
         
         <% if (element.opacity !== undefined && element.opacity !== 1) { %>
         opacity: <%= element.opacity %>;
         <% } %>
         
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

<% if (element.enableLightbox) { %>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.<%= elementId %> img').addEventListener('click', function() {
      // Create lightbox overlay
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
      
      // Create image element
      const img = document.createElement('img');
      img.src = '<%= imageUrl %>';
      img.style.maxWidth = '90%';
      img.style.maxHeight = '90%';
      img.style.objectFit = 'contain';
      
      <% if (element.lightboxCaption || element.caption) { %>
      // Add caption
      const caption = document.createElement('div');
      caption.textContent = '<%= element.lightboxCaption || element.caption %>';
      caption.style.position = 'absolute';
      caption.style.bottom = '20px';
      caption.style.left = '0';
      caption.style.width = '100%';
      caption.style.textAlign = 'center';
      caption.style.color = 'white';
      caption.style.padding = '10px';
      caption.style.backgroundColor = 'rgba(0,0,0,0.5)';
      lightbox.appendChild(caption);
      <% } %>
      
      // Close lightbox when clicked
      lightbox.onclick = function() {
        document.body.removeChild(lightbox);
      };
      
      lightbox.appendChild(img);
      document.body.appendChild(lightbox);
    });
  });
</script>
<% } %>
  `.trim();
};
