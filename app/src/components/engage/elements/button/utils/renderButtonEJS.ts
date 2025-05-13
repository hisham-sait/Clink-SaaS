import { ButtonElementData } from '../ButtonElementData';

/**
 * Render button element as EJS template string (for server-side rendering)
 * @param element The button element data
 * @returns EJS template string
 */
export const renderButtonEJS = (element: ButtonElementData): string => {
  return `
  <% 
    // Generate a unique ID for this element for hover effects
    const elementId = \`button-\${element.id || Date.now()}\`;
    
    // Add CSS classes for responsive behavior
    let responsiveClasses = '';
    if (element.hideOnMobile) {
      responsiveClasses += ' hide-on-mobile';
    }
    if (element.hideOnDesktop) {
      responsiveClasses += ' hide-on-desktop';
    }
    
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
  <% if (element.hoverEffect) { %>
  /* Hover styles with higher specificity */
  .<%= elementId %>:hover {
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
    
    <% if (element.hoverButtonColor) { %>
      <% if (element.buttonStyle === 'gradient') { %>
    background-image: linear-gradient(45deg, <%= element.hoverButtonColor %>, <%= adjustColor(element.hoverButtonColor, 40) %>) !important;
      <% } else if (element.buttonStyle !== 'text') { %>
    background-color: <%= element.hoverButtonColor %> !important;
      <% } %>
      
      <% if (element.buttonStyle === 'outline' || element.buttonStyle === 'text') { %>
    color: <%= element.hoverButtonColor %> !important;
      <% } %>
    <% } else if (element.hoverEffectType === 'color-shift') { %>
    background-color: <%= element.buttonStyle === 'outline' ? (element.buttonColor || '#007bff') : adjustColor(element.buttonColor || '#007bff', 40) %> !important;
    color: <%= element.buttonStyle === 'outline' ? '#ffffff' : (element.textColor || '#ffffff') %> !important;
    <% } %>
    
    <% if (element.hoverTextColor) { %>
    color: <%= element.hoverTextColor %> !important;
    <% } %>
    
    <% if (element.hoverBorderColor && element.buttonStyle !== 'text') { %>
    border-color: <%= element.hoverBorderColor %> !important;
    <% } %>
    
    /* Build transition property */
    <% 
      const transitionProps = [];
      if (element.hoverEffectType === 'zoom' || element.hoverEffectType === 'elevate') transitionProps.push('transform');
      if (element.hoverEffectType === 'brighten' || element.hoverEffectType === 'darken') transitionProps.push('filter');
      if (element.hoverEffectType === 'shadow' || element.hoverEffectType === 'elevate') transitionProps.push('box-shadow');
      if (element.hoverButtonColor || element.hoverEffectType === 'color-shift') transitionProps.push('background-color', 'background-image');
      if (element.hoverTextColor || (element.hoverButtonColor && (element.buttonStyle === 'outline' || element.buttonStyle === 'text')) || element.hoverEffectType === 'color-shift') transitionProps.push('color');
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
  .<%= elementId %>:active {
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
    
    <% if (element.hoverButtonColor) { %>
      <% if (element.buttonStyle === 'gradient') { %>
    background-image: linear-gradient(45deg, <%= adjustColor(element.hoverButtonColor, -20) %>, <%= adjustColor(element.hoverButtonColor, 20) %>) !important;
      <% } else if (element.buttonStyle !== 'text') { %>
    background-color: <%= adjustColor(element.hoverButtonColor, -20) %> !important;
      <% } %>
    <% } else if (element.buttonStyle !== 'text' && element.buttonStyle !== 'outline') { %>
    background-color: <%= adjustColor(element.buttonColor || '#007bff', -20) %> !important;
    <% } %>
    
    transition: all 0.1s ease-out !important;
  }
  <% } %>
</style>

<div style="text-align: <%= element.alignment || 'left' %>; width: 100%;">
  <% if (element.buttonType === 'submit') { %>
    <button 
      class="button-element <%= elementId %><%= responsiveClasses %>"
      style="
        /* Display properties */
        display: inline-block;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        padding: <%= element.padding || '6px 12px' %>;
        font-size: <%= element.buttonSize === 'sm' ? '0.875rem' : element.buttonSize === 'lg' ? '1.25rem' : '1rem' %>;
        line-height: 1.5;
        text-decoration: none;
        cursor: pointer;
        
        /* Size properties */
        <% if (element.width && element.width !== 'auto') { %>width: <%= element.width %>;<% } %>
        <% if (element.height && element.height !== 'auto') { %>height: <%= element.height %>;<% } %>
        <% if (element.fullWidth) { %>width: 100%;<% } %>
        
        /* Border properties */
        border: <%= element.borderStyle !== 'none' ? (element.borderWidth || '1px') + ' ' + (element.borderStyle || 'solid') + ' ' + (element.borderColor || '#007bff') : 'none' %>;
        border-radius: <%= element.borderRadius || '4px' %>;
        
        /* Color properties */
        <% if (element.buttonStyle === 'outline') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } else if (element.buttonStyle === 'text') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: transparent;
        <% } else if (element.buttonStyle === 'gradient') { %>
        background-image: linear-gradient(45deg, <%= element.buttonColor || '#007bff' %>, <%= adjustColor(element.buttonColor || '#007bff', 40) %>);
        color: <%= element.textColor || '#ffffff' %>;
        border-color: transparent;
        <% } else { /* filled */ %>
        background-color: <%= element.buttonColor || '#007bff' %>;
        color: <%= element.textColor || '#ffffff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } %>
        
        /* Shadow properties */
        <% if (element.boxShadow && element.boxShadow !== 'none') { %>
        box-shadow: <%= element.boxShadow %>;
        <% } %>
        
        /* Animation properties */
        <% if (element.animation && element.animation !== 'none') { %>
        animation: <%= element.animation %> <%= element.animationDuration || '1s' %> <%= element.animationEasing || 'ease' %> <%= element.animationDelay || '0s' %>;
        <% } %>
        
        /* Transition properties */
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        
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
      "
      aria-label="<%= element.ariaLabel || element.buttonText || 'Button' %>"
      role="<%= element.role || 'button' %>"
      tabindex="<%= element.tabIndex || 0 %>"
      type="submit"
    >
      <% if (element.icon) { %>
        <% if (element.iconPosition === 'left') { %>
          <span style="margin-right: 5px;">[<%= element.icon %>]</span>
          <%= element.buttonText || 'Click Me' %>
        <% } else { %>
          <%= element.buttonText || 'Click Me' %>
          <span style="margin-left: 5px;">[<%= element.icon %>]</span>
        <% } %>
      <% } else { %>
        <%= element.buttonText || 'Click Me' %>
      <% } %>
    </button>
  <% } else if (element.buttonType === 'reset') { %>
    <button 
      class="button-element <%= elementId %><%= responsiveClasses %>"
      style="
        /* Display properties */
        display: inline-block;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        padding: <%= element.padding || '6px 12px' %>;
        font-size: <%= element.buttonSize === 'sm' ? '0.875rem' : element.buttonSize === 'lg' ? '1.25rem' : '1rem' %>;
        line-height: 1.5;
        text-decoration: none;
        cursor: pointer;
        
        /* Size properties */
        <% if (element.width && element.width !== 'auto') { %>width: <%= element.width %>;<% } %>
        <% if (element.height && element.height !== 'auto') { %>height: <%= element.height %>;<% } %>
        <% if (element.fullWidth) { %>width: 100%;<% } %>
        
        /* Border properties */
        border: <%= element.borderStyle !== 'none' ? (element.borderWidth || '1px') + ' ' + (element.borderStyle || 'solid') + ' ' + (element.borderColor || '#007bff') : 'none' %>;
        border-radius: <%= element.borderRadius || '4px' %>;
        
        /* Color properties */
        <% if (element.buttonStyle === 'outline') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } else if (element.buttonStyle === 'text') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: transparent;
        <% } else if (element.buttonStyle === 'gradient') { %>
        background-image: linear-gradient(45deg, <%= element.buttonColor || '#007bff' %>, <%= adjustColor(element.buttonColor || '#007bff', 40) %>);
        color: <%= element.textColor || '#ffffff' %>;
        border-color: transparent;
        <% } else { /* filled */ %>
        background-color: <%= element.buttonColor || '#007bff' %>;
        color: <%= element.textColor || '#ffffff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } %>
        
        /* Shadow properties */
        <% if (element.boxShadow && element.boxShadow !== 'none') { %>
        box-shadow: <%= element.boxShadow %>;
        <% } %>
        
        /* Animation properties */
        <% if (element.animation && element.animation !== 'none') { %>
        animation: <%= element.animation %> <%= element.animationDuration || '1s' %> <%= element.animationEasing || 'ease' %> <%= element.animationDelay || '0s' %>;
        <% } %>
        
        /* Transition properties */
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        
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
      "
      aria-label="<%= element.ariaLabel || element.buttonText || 'Button' %>"
      role="<%= element.role || 'button' %>"
      tabindex="<%= element.tabIndex || 0 %>"
      type="reset"
    >
      <% if (element.icon) { %>
        <% if (element.iconPosition === 'left') { %>
          <span style="margin-right: 5px;">[<%= element.icon %>]</span>
          <%= element.buttonText || 'Click Me' %>
        <% } else { %>
          <%= element.buttonText || 'Click Me' %>
          <span style="margin-left: 5px;">[<%= element.icon %>]</span>
        <% } %>
      <% } else { %>
        <%= element.buttonText || 'Click Me' %>
      <% } %>
    </button>
  <% } else { /* link */ %>
    <a 
      class="button-element <%= elementId %><%= responsiveClasses %>"
      style="
        /* Display properties */
        display: inline-block;
        font-weight: 400;
        text-align: center;
        vertical-align: middle;
        user-select: none;
        padding: <%= element.padding || '6px 12px' %>;
        font-size: <%= element.buttonSize === 'sm' ? '0.875rem' : element.buttonSize === 'lg' ? '1.25rem' : '1rem' %>;
        line-height: 1.5;
        text-decoration: none;
        cursor: pointer;
        
        /* Size properties */
        <% if (element.width && element.width !== 'auto') { %>width: <%= element.width %>;<% } %>
        <% if (element.height && element.height !== 'auto') { %>height: <%= element.height %>;<% } %>
        <% if (element.fullWidth) { %>width: 100%;<% } %>
        
        /* Border properties */
        border: <%= element.borderStyle !== 'none' ? (element.borderWidth || '1px') + ' ' + (element.borderStyle || 'solid') + ' ' + (element.borderColor || '#007bff') : 'none' %>;
        border-radius: <%= element.borderRadius || '4px' %>;
        
        /* Color properties */
        <% if (element.buttonStyle === 'outline') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } else if (element.buttonStyle === 'text') { %>
        background-color: transparent;
        color: <%= element.buttonColor || '#007bff' %>;
        border-color: transparent;
        <% } else if (element.buttonStyle === 'gradient') { %>
        background-image: linear-gradient(45deg, <%= element.buttonColor || '#007bff' %>, <%= adjustColor(element.buttonColor || '#007bff', 40) %>);
        color: <%= element.textColor || '#ffffff' %>;
        border-color: transparent;
        <% } else { /* filled */ %>
        background-color: <%= element.buttonColor || '#007bff' %>;
        color: <%= element.textColor || '#ffffff' %>;
        border-color: <%= element.buttonColor || '#007bff' %>;
        <% } %>
        
        /* Shadow properties */
        <% if (element.boxShadow && element.boxShadow !== 'none') { %>
        box-shadow: <%= element.boxShadow %>;
        <% } %>
        
        /* Animation properties */
        <% if (element.animation && element.animation !== 'none') { %>
        animation: <%= element.animation %> <%= element.animationDuration || '1s' %> <%= element.animationEasing || 'ease' %> <%= element.animationDelay || '0s' %>;
        <% } %>
        
        /* Transition properties */
        transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        
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
      "
      href="<%= element.url || '#' %>"
      target="<%= element.target || '_self' %>"
      aria-label="<%= element.ariaLabel || element.buttonText || 'Button' %>"
      role="<%= element.role || 'button' %>"
      tabindex="<%= element.tabIndex || 0 %>"
    >
      <% if (element.icon) { %>
        <% if (element.iconPosition === 'left') { %>
          <span style="margin-right: 5px;">[<%= element.icon %>]</span>
          <%= element.buttonText || 'Click Me' %>
        <% } else { %>
          <%= element.buttonText || 'Click Me' %>
          <span style="margin-left: 5px;">[<%= element.icon %>]</span>
        <% } %>
      <% } else { %>
        <%= element.buttonText || 'Click Me' %>
      <% } %>
    </a>
  <% } %>
</div>
  `.trim();
};
