import { VideoElementData } from '../VideoElementData';
import { extractYouTubeVideoId, extractVimeoVideoId } from './defaultProperties';

/**
 * Render video element as EJS template string (for server-side rendering)
 * @param element The video element data
 * @returns EJS template string
 */
export const renderVideoEJS = (element: VideoElementData): string => {
  return `
  <% 
    // Extract video ID from URL if needed
    const videoId = element.videoId || (element.url ? (
      element.videoType === 'youtube' ? ${extractYouTubeVideoId.toString()}(element.url) :
      element.videoType === 'vimeo' ? ${extractVimeoVideoId.toString()}(element.url) : ''
    ) : '');
    
    // Log video properties for debugging
    console.log('Rendering Video EJS:', {
      videoType: element.videoType,
      videoId,
      url: element.url,
      videoUrl: element.videoUrl,
      embedCode: element.embedCode
    });
    
    // YouTube embed URL with parameters
    const youtubeEmbedUrl = videoId && element.videoType === 'youtube' ? 
      \`https://www.youtube.com/embed/\${videoId}?autoplay=\${element.autoplay ? 1 : 0}&mute=\${element.muted ? 1 : 0}&controls=\${element.controls ? 1 : 0}&loop=\${element.loop ? 1 : 0}\${element.startTime ? \`&start=\${Math.floor(element.startTime)}\` : ''}\${element.endTime ? \`&end=\${Math.floor(element.endTime)}\` : ''}\` 
      : '';
    
    // Vimeo embed URL with parameters
    const vimeoEmbedUrl = videoId && element.videoType === 'vimeo' ? 
      \`https://player.vimeo.com/video/\${videoId}?autoplay=\${element.autoplay ? 1 : 0}&muted=\${element.muted ? 1 : 0}&controls=\${element.controls ? 1 : 0}&loop=\${element.loop ? 1 : 0}\` 
      : '';
    
    // Direct video URL
    const videoUrl = element.videoUrl || element.url || '';
    
    // Extract src from embed code if present
    let embedSrc = '';
    if (element.embedCode) {
      const srcMatch = element.embedCode.match(/src=["']([^"']+)["']/i);
      embedSrc = srcMatch ? srcMatch[1] : '';
    }
    
    // Add responsive classes based on visibility settings
    let className = 'video-element';
    
    if (element.hideOnMobile) {
      className += ' hide-on-mobile';
    }
    
    if (element.hideOnDesktop) {
      className += ' hide-on-desktop';
    }
    
    // Generate a unique ID for this element
    const elementId = \`video-\${element.id || Date.now()}\`;
    
    // Helper function to adjust color brightness
    function adjustColor(color, amount) {
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
      return \`#\${r.toString(16).padStart(2, '0')}\${g.toString(16).padStart(2, '0')}\${b.toString(16).padStart(2, '0')}\`;
    }
  %>

<style>
  /* Base styles for the video element */
  .<%= elementId %> {
    width: <%= element.width || '100%' %>;
    border-radius: <%= element.borderRadius || '4px' %>;
    overflow: hidden;
    position: relative;
    
    <% if (element.aspectRatio && element.aspectRatio !== 'custom') { %>
      <% let paddingTop = '56.25%'; // Default 16:9 %>
      <% if (element.aspectRatio === '4:3') { %>
        <% paddingTop = '75%'; %>
      <% } else if (element.aspectRatio === '1:1') { %>
        <% paddingTop = '100%'; %>
      <% } %>
      padding-top: <%= paddingTop %>;
    <% } else if (element.customAspectRatio) { %>
      <% const parts = element.customAspectRatio.split(':'); %>
      <% if (parts.length === 2) { %>
        <% const width = parseFloat(parts[0]); %>
        <% const height = parseFloat(parts[1]); %>
        <% if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) { %>
          padding-top: <%= (height / width) * 100 %>%;
        <% } %>
      <% } %>
    <% } %>
    
    <% if (element.height && element.height !== 'auto' && (!element.aspectRatio || element.aspectRatio === 'custom')) { %>
      height: <%= element.height %>;
      padding-top: 0;
    <% } %>
    
    <% if (element.borderStyle && element.borderStyle !== 'none') { %>
      border: <%= element.borderWidth || '1px' %> <%= element.borderStyle %> <%= element.borderColor || '#000000' %>;
    <% } %>
    
    <% if (element.backgroundColor && element.backgroundColor !== 'transparent') { %>
      background-color: <%= element.backgroundColor %>;
    <% } %>
    
    <% if (element.boxShadow && element.boxShadow !== 'none') { %>
      <% const color = element.boxShadowColor || 'rgba(0,0,0,0.2)'; %>
      <% const blur = element.boxShadowBlur || '10px'; %>
      <% const spread = element.boxShadowSpread || '0'; %>
      <% const offsetX = element.boxShadowOffsetX || '0'; %>
      <% const offsetY = element.boxShadowOffsetY || '4px'; %>
      box-shadow: <%= offsetX %> <%= offsetY %> <%= blur %> <%= spread %> <%= color %>;
    <% } %>
    
    <% if (element.margin) { %>
      margin: <%= element.margin %>;
    <% } %>
    
    <% if (element.padding) { %>
      padding: <%= element.padding %>;
    <% } %>
    
    <% if (element.alignment) { %>
      <% if (element.alignment === 'center') { %>
        margin-left: auto;
        margin-right: auto;
      <% } else if (element.alignment === 'right') { %>
        margin-left: auto;
        margin-right: 0;
      <% } else { %>
        margin-left: 0;
        margin-right: auto;
      <% } %>
    <% } %>
    
    <% 
      const filters = [];
      
      if (element.opacity !== undefined && element.opacity !== 1) {
        filters.push(\`opacity(\${element.opacity})\`);
      }
      
      if (element.brightness !== undefined && element.brightness !== 1) {
        filters.push(\`brightness(\${element.brightness})\`);
      }
      
      if (element.contrast !== undefined && element.contrast !== 1) {
        filters.push(\`contrast(\${element.contrast})\`);
      }
      
      if (element.saturation !== undefined && element.saturation !== 1) {
        filters.push(\`saturate(\${element.saturation})\`);
      }
      
      if (element.hueRotate !== undefined && element.hueRotate !== 0) {
        filters.push(\`hue-rotate(\${element.hueRotate}deg)\`);
      }
      
      if (element.blur !== undefined && element.blur !== '0px') {
        filters.push(\`blur(\${element.blur})\`);
      }
      
      if (element.grayscale !== undefined && element.grayscale !== 0) {
        filters.push(\`grayscale(\${element.grayscale})\`);
      }
      
      if (element.sepia !== undefined && element.sepia !== 0) {
        filters.push(\`sepia(\${element.sepia})\`);
      }
    %>
    
    <% if (filters.length > 0) { %>
      filter: <%= filters.join(' ') %>;
    <% } %>
    
    <% if (element.animation && element.animation !== 'none') { %>
      animation: <%= element.animation %> <%= element.animationDuration || '1s' %> <%= element.animationEasing || 'ease' %> <%= element.animationDelay || '0s' %>;
    <% } %>
  }
  
  /* Caption styles */
  .<%= elementId %>-caption {
    <% if (element.captionPosition === 'bottom') { %>
      margin-top: 0.5rem;
    <% } else { %>
      margin-bottom: 0.5rem;
    <% } %>
    font-size: <%= element.captionSize || '14px' %>;
    color: <%= element.captionColor || '#000000' %>;
    text-align: <%= element.captionAlignment || 'center' %>;
  }
  
  /* Video iframe and player styles */
  .<%= elementId %> iframe,
  .<%= elementId %> video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
  
  /* Video player object-fit */
  .<%= elementId %> video {
    object-fit: <%= element.objectFit || 'contain' %>;
  }
  
  /* Overlay styles */
  .<%= elementId %>-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: <%= element.overlayColor || 'rgba(0,0,0,0.5)' %>;
    opacity: <%= element.overlayOpacity || 0.5 %>;
    display: flex;
    align-items: <%= element.overlayTextPosition === 'top' ? 'flex-start' : element.overlayTextPosition === 'bottom' ? 'flex-end' : 'center' %>;
    justify-content: center;
    padding: 1rem;
    color: <%= element.overlayTextColor || '#ffffff' %>;
    font-size: <%= element.overlayTextSize || '16px' %>;
    text-align: center;
    z-index: 1;
  }
  
  /* Responsive styles */
  @media (max-width: 768px) {
    <% if (element.hideOnMobile) { %>
      .hide-on-mobile {
        display: none !important;
      }
    <% } %>
    
    <% if (element.mobileWidth || element.mobileHeight) { %>
      .<%= elementId %> {
        <% if (element.mobileWidth) { %>
          width: <%= element.mobileWidth %>;
        <% } %>
        <% if (element.mobileHeight) { %>
          height: <%= element.mobileHeight %>;
          padding-top: 0;
        <% } %>
      }
    <% } %>
  }
  
  @media (min-width: 769px) {
    <% if (element.hideOnDesktop) { %>
      .hide-on-desktop {
        display: none !important;
      }
    <% } %>
  }
</style>

<div class="<%= className %>">
  <% if (element.showCaption && element.captionPosition === 'top' && element.caption) { %>
    <div class="<%= elementId %>-caption">
      <%= element.caption %>
    </div>
  <% } %>
  
  <div class="<%= elementId %>">
    <% if (element.videoType === 'youtube' && videoId) { %>
      <iframe 
        src="<%= youtubeEmbedUrl %>"
        allowfullscreen
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        title="<%= element.ariaLabel || 'YouTube video player' %>"
      ></iframe>
    <% } else if (element.videoType === 'vimeo' && videoId) { %>
      <iframe 
        src="<%= vimeoEmbedUrl %>"
        allowfullscreen
        frameborder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        title="<%= element.ariaLabel || 'Vimeo video player' %>"
      ></iframe>
    <% } else if (element.videoType === 'embed' && embedSrc) { %>
      <iframe 
        src="<%= embedSrc %>"
        allowfullscreen
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        title="<%= element.ariaLabel || 'Embedded video player' %>"
      ></iframe>
    <% } else { %>
      <video
        <% if (element.controls) { %>controls<% } %>
        <% if (element.autoplay) { %>autoplay<% } %>
        <% if (element.loop) { %>loop<% } %>
        <% if (element.muted) { %>muted<% } %>
        <% if (element.posterImage) { %>poster="<%= element.posterImage %>"<% } %>
        preload="<%= element.preload || 'metadata' %>"
        aria-label="<%= element.ariaLabel || 'Video player' %>"
      >
        <source src="<%= videoUrl %>" type="video/mp4">
        <% if (element.captions) { %>
          <track kind="captions" src="<%= element.captions %>" srclang="en" label="English" default>
        <% } %>
        Your browser does not support the video tag.
      </video>
    <% } %>
    
    <% if (element.overlay) { %>
      <div class="<%= elementId %>-overlay">
        <%= element.overlayText %>
      </div>
    <% } %>
  </div>
  
  <% if (element.showCaption && element.captionPosition === 'bottom' && element.caption) { %>
    <div class="<%= elementId %>-caption">
      <%= element.caption %>
    </div>
  <% } %>
</div>
  `.trim();
};
