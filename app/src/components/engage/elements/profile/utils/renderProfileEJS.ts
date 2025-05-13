import { ProfileElementData } from '../ProfileElementData';
import { getProfileStyle, getAvatarStyle } from './defaultProperties';

/**
 * Generates EJS template code for a profile element
 * @param element The profile element data
 * @returns EJS template code as a string
 */
export const renderProfileEJS = (element: ProfileElementData): string => {
  // Generate EJS template code
  return getProfileEJSTemplateCode(element);
};

/**
 * Generates the EJS template code for a profile element
 * @param element The profile element data
 * @returns EJS template code as a string
 */
export const getProfileEJSTemplateCode = (element: ProfileElementData): string => {
  // Get styles as objects
  const profileStyle = getProfileStyle(element);
  const avatarStyle = getAvatarStyle(element);
  
  // Convert style objects to inline style strings
  const profileStyleString = Object.entries(profileStyle)
    .map(([key, value]) => `${kebabCase(key)}: ${value};`)
    .join(' ');
    
  const avatarStyleString = Object.entries(avatarStyle)
    .map(([key, value]) => `${kebabCase(key)}: ${value};`)
    .join(' ');
  
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
  
  // Determine layout class
  const layoutClass = `profile-layout-${element.layoutTemplate || 'classic'}`;
  
  // Generate the EJS template
  return `
<div 
  class="profile-element ${layoutClass} ${animationClass} ${responsiveClass}"
  style="${profileStyleString}"
  aria-label="${element.ariaLabel || `Profile for ${element.name}`}"
  role="${element.role || 'region'}"
  tabindex="${element.tabIndex || 0}"
  data-element-id="${element.id}"
  data-element-type="${element.type}"
>
  <% /* Cover Photo */ %>
  <% if ("${element.coverPhotoUrl}") { %>
    <div class="profile-cover-photo" style="position: relative; margin-bottom: 1rem;">
      <img 
        src="${element.coverPhotoUrl}" 
        alt="Cover" 
        style="width: 100%; height: ${element.coverPhotoHeight || '200px'}; object-fit: cover; object-position: ${element.coverPhotoPosition || 'center'};"
      />
      <% if (${!!element.coverPhotoOverlay}) { %>
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: ${element.coverPhotoOverlayColor || 'rgba(0,0,0,0.5)'}; opacity: ${element.coverPhotoOverlayOpacity || 0.5};"></div>
      <% } %>
    </div>
  <% } %>

  <% /* Layout-specific container based on template */ %>
  <% if ("${element.layoutTemplate}" === "horizontal") { %>
    <div style="display: flex; align-items: flex-start; gap: 1.5rem; padding: 1rem; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <div style="flex-shrink: 0;">
        <% if (${!!element.showAvatar} && "${element.avatarUrl}") { %>
          <img 
            src="${element.avatarUrl}" 
            alt="${element.name} avatar" 
            style="${avatarStyleString}"
            class="profile-avatar"
          />
        <% } %>
      </div>
      <div style="flex: 1; min-width: 0;">
        <% if ("${element.name}") { %>
          <h3 class="profile-name" style="margin: 0 0 ${element.nameSpacing || '0.5rem'}; font-weight: bold; font-size: ${element.nameFontSize || '1.5rem'};">
            ${element.name}
          </h3>
        <% } %>
        
        <% if ("${element.title}") { %>
          <h4 class="profile-title" style="margin: 0 0 ${element.titleSpacing || '0.5rem'}; font-weight: normal; color: #666; font-size: ${element.titleFontSize || '1.1rem'};">
            ${element.title}
          </h4>
        <% } %>
        
        <% if ("${element.bio}") { %>
          <p class="profile-bio" style="margin: 0 0 ${element.bioSpacing || '1rem'}; font-size: ${element.bioFontSize || '0.9rem'};">
            ${element.bio}
          </p>
        <% } %>
        
        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <% if ("${element.email}" || "${element.phone}") { %>
              <div class="profile-contact" style="margin: ${element.contactSpacing || '1rem'} 0; font-size: ${element.contactFontSize || '0.9rem'};">
                <% if ("${element.email}") { %>
                  <div class="profile-email" style="display: flex; align-items: center; margin: 0.5rem 0;">
                    <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i> ${element.email}
                  </div>
                <% } %>
                
                <% if ("${element.phone}") { %>
                  <div class="profile-phone" style="display: flex; align-items: center; margin: 0.5rem 0;">
                    <i class="fas fa-phone" style="margin-right: 0.5rem;"></i> ${element.phone}
                  </div>
                <% } %>
              </div>
            <% } %>
          </div>
          <div>
            <% if (${!!element.showSocial} && ${(element.socialLinks || []).length > 0}) { %>
              <div class="profile-social" style="display: flex; justify-content: ${element.alignment === 'center' ? 'center' : 'flex-start'}; gap: 1rem; margin: ${element.socialSpacing || '1rem'} 0;">
                <% ${JSON.stringify(element.socialLinks || [])}.forEach(function(social) { %>
                  <a 
                    href="<%= social.url || '#' %>" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="profile-social-link"
                    style="font-size: ${element.socialIconSize || '1.5rem'}; color: inherit; text-decoration: none;"
                  >
                    <i class="fab fa-<%= social.icon || social.platform %>"></i>
                  </a>
                <% }); %>
              </div>
            <% } %>
          </div>
        </div>
      </div>
    </div>
  <% } else if ("${element.layoutTemplate}" === "minimal") { %>
    <div style="background-color: #ffffff; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="display: flex; flex-direction: column; align-items: ${element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start')}; gap: 0.75rem;">
        <% if (${!!element.showAvatar} && "${element.avatarUrl}") { %>
          <img 
            src="${element.avatarUrl}" 
            alt="${element.name} avatar" 
            style="${avatarStyleString}"
            class="profile-avatar"
          />
        <% } %>
        
        <% if ("${element.name}") { %>
          <h3 class="profile-name" style="margin: 0 0 ${element.nameSpacing || '0.5rem'}; font-weight: bold; font-size: ${element.nameFontSize || '1.5rem'};">
            ${element.name}
          </h3>
        <% } %>
        
        <% if ("${element.title}") { %>
          <h4 class="profile-title" style="margin: 0 0 ${element.titleSpacing || '0.5rem'}; font-weight: normal; color: #666; font-size: ${element.titleFontSize || '1.1rem'};">
            ${element.title}
          </h4>
        <% } %>
        
        <% if ("${element.bio}") { %>
          <p class="profile-bio" style="margin: 0 0 ${element.bioSpacing || '1rem'}; font-size: ${element.bioFontSize || '0.9rem'};">
            ${element.bio}
          </p>
        <% } %>
        
        <% if ("${element.email}" || "${element.phone}") { %>
          <div class="profile-contact" style="margin: ${element.contactSpacing || '1rem'} 0; font-size: ${element.contactFontSize || '0.9rem'};">
            <% if ("${element.email}") { %>
              <div class="profile-email" style="display: flex; align-items: center; margin: 0.5rem 0;">
                <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i> ${element.email}
              </div>
            <% } %>
            
            <% if ("${element.phone}") { %>
              <div class="profile-phone" style="display: flex; align-items: center; margin: 0.5rem 0;">
                <i class="fas fa-phone" style="margin-right: 0.5rem;"></i> ${element.phone}
              </div>
            <% } %>
          </div>
        <% } %>
        
        <% if (${!!element.showSocial} && ${(element.socialLinks || []).length > 0}) { %>
          <div class="profile-social" style="display: flex; justify-content: ${element.alignment === 'center' ? 'center' : 'flex-start'}; gap: 1rem; margin: ${element.socialSpacing || '1rem'} 0;">
            <% ${JSON.stringify(element.socialLinks || [])}.forEach(function(social) { %>
              <a 
                href="<%= social.url || '#' %>" 
                target="_blank" 
                rel="noopener noreferrer"
                class="profile-social-link"
                style="font-size: ${element.socialIconSize || '1.5rem'}; color: inherit; text-decoration: none;"
              >
                <i class="fab fa-<%= social.icon || social.platform %>"></i>
              </a>
            <% }); %>
          </div>
        <% } %>
      </div>
    </div>
  <% } else { %>
    <% /* Default layout for all other templates */ %>
    <div style="text-align: ${element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'right' : 'left')};">
      <% if (${!!element.showAvatar} && "${element.avatarUrl}") { %>
        <img 
          src="${element.avatarUrl}" 
          alt="${element.name} avatar" 
          style="${avatarStyleString}"
          class="profile-avatar"
        />
      <% } %>
      
      <% if ("${element.name}") { %>
        <h3 class="profile-name" style="margin: 0 0 ${element.nameSpacing || '0.5rem'}; font-weight: bold; font-size: ${element.nameFontSize || '1.5rem'};">
          ${element.name}
        </h3>
      <% } %>
      
      <% if ("${element.title}") { %>
        <h4 class="profile-title" style="margin: 0 0 ${element.titleSpacing || '0.5rem'}; font-weight: normal; color: #666; font-size: ${element.titleFontSize || '1.1rem'};">
          ${element.title}
        </h4>
      <% } %>
      
      <% if ("${element.bio}") { %>
        <p class="profile-bio" style="margin: 0 0 ${element.bioSpacing || '1rem'}; font-size: ${element.bioFontSize || '0.9rem'};">
          ${element.bio}
        </p>
      <% } %>
      
      <% if ("${element.email}" || "${element.phone}") { %>
        <div class="profile-contact" style="margin: ${element.contactSpacing || '1rem'} 0; font-size: ${element.contactFontSize || '0.9rem'};">
          <% if ("${element.email}") { %>
            <div class="profile-email" style="display: flex; align-items: center; margin: 0.5rem 0; justify-content: ${element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start')};">
              <i class="fas fa-envelope" style="margin-right: 0.5rem;"></i> ${element.email}
            </div>
          <% } %>
          
          <% if ("${element.phone}") { %>
            <div class="profile-phone" style="display: flex; align-items: center; margin: 0.5rem 0; justify-content: ${element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start')};">
              <i class="fas fa-phone" style="margin-right: 0.5rem;"></i> ${element.phone}
            </div>
          <% } %>
        </div>
      <% } %>
      
      <% if (${!!element.showSocial} && ${(element.socialLinks || []).length > 0}) { %>
        <div class="profile-social" style="display: flex; justify-content: ${element.alignment === 'center' ? 'center' : (element.alignment === 'right' ? 'flex-end' : 'flex-start')}; gap: 1rem; margin: ${element.socialSpacing || '1rem'} 0;">
          <% ${JSON.stringify(element.socialLinks || [])}.forEach(function(social) { %>
            <a 
              href="<%= social.url || '#' %>" 
              target="_blank" 
              rel="noopener noreferrer"
              class="profile-social-link"
              style="font-size: ${element.socialIconSize || '1.5rem'}; color: inherit; text-decoration: none;"
            >
              <i class="fab fa-<%= social.icon || social.platform %>"></i>
            </a>
          <% }); %>
        </div>
      <% } %>
    </div>
  <% } %>
</div>
  `.trim();
};

/**
 * Converts a camelCase string to kebab-case
 * @param str The camelCase string
 * @returns The kebab-case string
 */
const kebabCase = (str: string): string => {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
};

/**
 * Gets the EJS template for a profile element
 * @param element The profile element data
 * @returns The EJS template as a string
 */
export const getProfileEJSTemplate = (element: ProfileElementData): string => {
  return `<%- include('partials/elements/profile', ${JSON.stringify({ element })}) %>`;
};
