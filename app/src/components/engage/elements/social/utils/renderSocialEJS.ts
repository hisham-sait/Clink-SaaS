import { SocialElementData } from '../SocialElementData';

/**
 * Render social media links element as EJS template string (for server-side rendering)
 * @param element The social element data
 * @returns EJS template string
 */
export const renderSocialEJS = (element: SocialElementData): string => {
  return `
<% 
  // Generate a unique ID for this element for hover effects
  const elementId = \`social-\${element.id || Date.now()}\`;
  
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

  // Determine animation class
  let animationClass = '';
  if (element.animation && element.animation !== 'none') {
    animationClass = \`animate__animated animate__\${element.animation}\`;
  }
  
  // Determine responsive classes
  let responsiveClass = '';
  if (element.hideOnMobile) {
    responsiveClass += ' hide-on-mobile';
  }
  if (element.hideOnDesktop) {
    responsiveClass += ' hide-on-desktop';
  }
  
  // Helper function to get icon size in pixels
  function getSocialIconSize(size) {
    switch (size) {
      case 'sm':
        return '1rem';
      case 'md':
        return '1.5rem';
      case 'lg':
        return '2rem';
      default:
        return '1.5rem';
    }
  }
  
  // Get the icon size
  const iconSize = getSocialIconSize(element.iconSize || 'md');
  
  // Helper function to get social platform label
  function getSocialPlatformLabel(platform) {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return 'LinkedIn';
      case 'twitter':
        return 'Twitter';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'github':
        return 'GitHub';
      case 'youtube':
        return 'YouTube';
      case 'pinterest':
        return 'Pinterest';
      case 'tiktok':
        return 'TikTok';
      case 'snapchat':
        return 'Snapchat';
      case 'reddit':
        return 'Reddit';
      default:
        return platform;
    }
  }
  
  // Helper function to get Font Awesome icon class for a platform
  function getFontAwesomeIconClass(platform) {
    switch (platform.toLowerCase()) {
      case 'linkedin':
        return 'fa-linkedin-in';
      case 'twitter':
        return 'fa-x-twitter';
      case 'facebook':
        return 'fa-facebook-f';
      case 'instagram':
        return 'fa-instagram';
      case 'github':
        return 'fa-github';
      case 'youtube':
        return 'fa-youtube';
      case 'pinterest':
        return 'fa-pinterest-p';
      case 'tiktok':
        return 'fa-tiktok';
      case 'snapchat':
        return 'fa-snapchat-ghost';
      case 'reddit':
        return 'fa-reddit-alien';
      default:
        return 'fa-link';
    }
  }
%>

<% if (element.hoverEffect) { %>
<style>
  /* Hover styles for social links */
  .<%= elementId %> a:hover {
    <% if (element.hoverEffectType === 'zoom') { %>
    transform: scale(1.1) !important;
    <% } else if (element.hoverEffectType === 'brighten') { %>
    filter: brightness(1.2) !important;
    <% } else if (element.hoverEffectType === 'darken') { %>
    filter: brightness(0.8) !important;
    <% } else if (element.hoverEffectType === 'shadow') { %>
    box-shadow: 0 5px 15px rgba(0,0,0,0.3) !important;
    <% } else if (element.hoverEffectType === 'elevate') { %>
    transform: translateY(-3px) !important;
    box-shadow: 0 5px 15px rgba(0,0,0,0.2) !important;
    <% } %>
    
    <% if (element.hoverIconColor) { %>
    color: <%= element.hoverIconColor %> !important;
    <% } else if (element.hoverEffectType === 'color-shift' && element.iconColor) { %>
    color: <%= adjustColor(element.iconColor, 40) %> !important;
    <% } %>
    
    <% if (element.hoverBackgroundColor && element.displayStyle === 'buttons') { %>
    background-color: <%= element.hoverBackgroundColor %> !important;
    <% } %>
    
    <% if (element.hoverBorderColor && element.borderStyle !== 'none') { %>
    border-color: <%= element.hoverBorderColor %> !important;
    <% } %>
    
    /* Build transition property */
    <% 
      const transitionProps = [];
      if (element.hoverEffectType === 'zoom' || element.hoverEffectType === 'elevate') transitionProps.push('transform');
      if (element.hoverEffectType === 'brighten' || element.hoverEffectType === 'darken') transitionProps.push('filter');
      if (element.hoverEffectType === 'shadow' || element.hoverEffectType === 'elevate') transitionProps.push('box-shadow');
      if (element.hoverIconColor || element.hoverEffectType === 'color-shift') transitionProps.push('color');
      if (element.hoverBackgroundColor && element.displayStyle === 'buttons') transitionProps.push('background-color');
      if (element.hoverBorderColor) transitionProps.push('border-color');
      
      // If no specific properties are changing, add a default set
      if (transitionProps.length === 0) {
        transitionProps.push('color', 'background-color', 'border-color', 'box-shadow');
      }
      
      const transitionDuration = element.hoverTransitionDuration || '0.3s';
      const transitionValue = transitionProps.map(prop => \`\${prop} \${transitionDuration} ease\`).join(', ');
    %>
    transition: <%= transitionValue %> !important;
  }
  
  /* Active state styles for click feedback */
  .<%= elementId %> a:active {
    <% if (element.hoverEffectType === 'zoom') { %>
    transform: scale(0.95) !important;
    <% } else if (element.hoverEffectType === 'brighten') { %>
    filter: brightness(0.9) !important;
    <% } else if (element.hoverEffectType === 'darken') { %>
    filter: brightness(0.7) !important;
    <% } else if (element.hoverEffectType === 'shadow') { %>
    box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
    <% } else if (element.hoverEffectType === 'elevate') { %>
    transform: translateY(0px) !important;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
    <% } else { %>
    transform: scale(0.98) !important;
    <% } %>
    
    <% if (element.hoverIconColor) { %>
    color: <%= adjustColor(element.hoverIconColor, -20) %> !important;
    <% } %>
    
    <% if (element.hoverBackgroundColor && element.displayStyle === 'buttons') { %>
    background-color: <%= adjustColor(element.hoverBackgroundColor, -20) %> !important;
    <% } %>
    
    transition: all 0.1s ease-out !important;
  }
  
  /* Add transition to all social links */
  .<%= elementId %> a {
    transition: all <%= element.hoverTransitionDuration || '0.3s' %> ease !important;
  }
</style>
<% } %>

<div 
  class="social-element <%= elementId %> <%= animationClass %> <%= responsiveClass %>"
  style="
    display: flex;
    flex-wrap: wrap;
    gap: <%= element.spacing || '1rem' %>;
    justify-content: <%= element.alignment === 'center' ? 'center' : element.alignment === 'right' ? 'flex-end' : 'flex-start' %>;
    width: <%= element.width || '100%' %>;
    height: <%= element.height || 'auto' %>;
    margin: <%= element.margin || '1rem 0' %>;
    padding: <%= element.padding || '0' %>;
    background-color: <%= element.backgroundColor || 'transparent' %>;
    border-radius: <%= element.borderRadius || '0' %>;
    border: <%= element.borderStyle !== 'none' ? 
      \`\${element.borderWidth || '1px'} \${element.borderStyle || 'solid'} \${element.borderColor || '#000000'}\` : 
      'none' %>;
    box-shadow: <%= element.boxShadow || 'none' %>;
    
    <% if (element.animation && element.animation !== 'none') { %>
    animation-duration: <%= element.animationDuration || '1s' %>;
    animation-delay: <%= element.animationDelay || '0s' %>;
    animation-timing-function: <%= element.animationEasing || 'ease' %>;
    <% } %>
  "
  aria-label="<%= element.ariaLabel || 'Social Media Links' %>"
  role="<%= element.role || 'navigation' %>"
  tabindex="<%= element.tabIndex || 0 %>"
  data-element-id="<%= element.id %>"
  data-element-type="<%= element.type %>"
>
  <% if (!element.links || element.links.length === 0) { %>
    <div style="color: #666;">No social links added</div>
  <% } else { %>
    <% element.links.forEach(function(link, index) { %>
      <% if (element.displayStyle === 'buttons') { %>
        <a 
          href="<%= link.url || '#' %>" 
          target="<%= element.openInNewTab ? '_blank' : '_self' %>" 
          rel="noopener noreferrer"
          style="
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            background-color: #f0f0f0;
            border-radius: 4px;
            color: <%= element.iconColor || '#555555' %>;
            text-decoration: none;
            font-size: 0.875rem;
          "
        >
          <span style="
            color: <%= element.iconColor || '#555555' %>;
            font-size: <%= iconSize %>;
          ">
            <i class="fa fa-<%= link.platform === 'twitter' ? 'twitter' : link.platform %>"></i>
          </span>
          <% if (element.showLabels) { %>
            <span><%= link.label || getSocialPlatformLabel(link.platform) %></span>
          <% } %>
        </a>
      <% } else if (element.displayStyle === 'text') { %>
        <a 
          href="<%= link.url || '#' %>" 
          target="<%= element.openInNewTab ? '_blank' : '_self' %>" 
          rel="noopener noreferrer"
          style="
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: <%= element.iconColor || '#555555' %>;
            text-decoration: none;
            font-size: 0.875rem;
          "
        >
          <span style="
            color: <%= element.iconColor || '#555555' %>;
            font-size: <%= iconSize %>;
          ">
            <i class="fa fa-<%= link.platform === 'twitter' ? 'twitter' : link.platform %>"></i>
          </span>
          <% if (element.showLabels) { %>
            <span><%= link.label || getSocialPlatformLabel(link.platform) %></span>
          <% } %>
        </a>
      <% } else { /* icons */ %>
        <a 
          href="<%= link.url || '#' %>" 
          target="<%= element.openInNewTab ? '_blank' : '_self' %>" 
          rel="noopener noreferrer"
          style="
            color: inherit;
            text-decoration: none;
          "
        >
          <span style="
            color: <%= element.iconColor || '#555555' %>;
            font-size: <%= iconSize %>;
          ">
            <i class="fa fa-<%= link.platform === 'twitter' ? 'twitter' : link.platform %>"></i>
          </span>
        </a>
      <% } %>
    <% }); %>
  <% } %>
</div>
  `.trim();
};
