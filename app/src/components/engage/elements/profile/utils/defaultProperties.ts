import { ProfileElementData } from '../ProfileElementData';

// Default properties for a profile element
export const getProfileElementProperties = (): Partial<ProfileElementData> => {
  return {
    type: 'profile',
    label: 'Profile Element',
    name: 'John Doe',
    title: 'Job Title',
    bio: 'Short biography or description',
    avatarUrl: '',
    showAvatar: true,
    avatarSize: 'md',
    avatarShape: 'circle',
    email: 'email@example.com',
    phone: '+1 (555) 123-4567',
    showSocial: true,
    socialLinks: [
      { platform: 'linkedin', url: '', icon: 'linkedin' },
      { platform: 'twitter', url: '', icon: 'twitter' }
    ],
    
    // Layout properties
    width: '100%',
    height: 'auto',
    alignment: 'center',
    layoutTemplate: 'classic',
    
    // Cover photo properties
    coverPhotoUrl: '',
    coverPhotoHeight: '200px',
    coverPhotoPosition: 'center',
    coverPhotoOverlay: false,
    coverPhotoOverlayColor: 'rgba(0,0,0,0.5)',
    coverPhotoOverlayOpacity: 0.5,
    
    // Typography properties
    nameFontSize: '1.5rem',
    titleFontSize: '1.1rem',
    bioFontSize: '0.9rem',
    contactFontSize: '0.9rem',
    socialIconSize: '1.5rem',
    
    // Spacing properties
    avatarSpacing: '1rem',
    nameSpacing: '0.5rem',
    titleSpacing: '0.5rem',
    bioSpacing: '1rem',
    contactSpacing: '0.5rem',
    socialSpacing: '1rem',
    
    // Border properties
    borderRadius: '4px',
    borderWidth: '0px',
    borderColor: '#000000',
    borderStyle: 'none',
    
    // Background properties
    backgroundColor: 'transparent',
    
    // Shadow properties
    boxShadow: 'none',
    boxShadowColor: 'rgba(0,0,0,0.2)',
    boxShadowBlur: '10px',
    boxShadowSpread: '0',
    boxShadowOffsetX: '0',
    boxShadowOffsetY: '4px',
    
    // Spacing properties
    margin: '0 0 1rem 0',
    padding: '1rem',
    
    // Effect properties
    opacity: 1,
    
    // Animation properties
    animation: 'none',
    animationDuration: '1s',
    animationDelay: '0s',
    animationEasing: 'ease',
    
    // Responsive properties
    hideOnMobile: false,
    hideOnDesktop: false,
    mobileWidth: '100%',
    mobileHeight: 'auto',
    
    // Accessibility properties
    ariaLabel: '',
    role: 'region',
    tabIndex: 0,
    
    required: false,
    description: 'Profile element for your page'
  };
};

// Helper function to update box shadow based on individual properties
export const updateBoxShadow = (element: ProfileElementData): string => {
  if (element.boxShadow === 'none') {
    return 'none';
  }
  
  const color = element.boxShadowColor || 'rgba(0,0,0,0.2)';
  const blur = element.boxShadowBlur || '10px';
  const spread = element.boxShadowSpread || '0';
  const offsetX = element.boxShadowOffsetX || '0';
  const offsetY = element.boxShadowOffsetY || '4px';
  
  return `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
};

// Helper function to get profile style based on properties
export const getProfileStyle = (element: ProfileElementData): React.CSSProperties => {
  const styles: React.CSSProperties = {
    width: element.width || '100%',
    borderRadius: element.borderRadius || '4px',
    overflow: 'hidden',
    position: 'relative',
  };
  
  // Apply height if specified
  if (element.height && element.height !== 'auto') {
    styles.height = element.height;
  }
  
  // Apply border
  if (element.borderStyle && element.borderStyle !== 'none') {
    styles.border = `${element.borderWidth || '1px'} ${element.borderStyle} ${element.borderColor || '#000000'}`;
  }
  
  // Apply background color
  if (element.backgroundColor && element.backgroundColor !== 'transparent') {
    styles.backgroundColor = element.backgroundColor;
  }
  
  // Apply box shadow
  if (element.boxShadow && element.boxShadow !== 'none') {
    styles.boxShadow = updateBoxShadow(element);
  }
  
  // Apply margin and padding
  if (element.margin) {
    styles.margin = element.margin;
  }
  
  if (element.padding) {
    styles.padding = element.padding;
  }
  
  // Apply alignment
  if (element.alignment) {
    if (element.alignment === 'center') {
      styles.marginLeft = 'auto';
      styles.marginRight = 'auto';
      styles.textAlign = 'center';
    } else if (element.alignment === 'right') {
      styles.marginLeft = 'auto';
      styles.marginRight = '0';
      styles.textAlign = 'right';
    } else {
      styles.marginLeft = '0';
      styles.marginRight = 'auto';
      styles.textAlign = 'left';
    }
  }
  
  // Apply opacity
  if (element.opacity !== undefined && element.opacity !== 1) {
    styles.opacity = element.opacity;
  }
  
  return styles;
};

// Helper function to get avatar style based on properties
export const getAvatarStyle = (element: ProfileElementData): React.CSSProperties => {
  const styles: React.CSSProperties = {
    display: element.showAvatar ? 'block' : 'none',
    margin: element.alignment === 'center' ? '0 auto 1rem' : '0 0 1rem',
  };
  
  // Apply avatar size
  if (element.avatarSize === 'sm') {
    styles.width = '50px';
    styles.height = '50px';
  } else if (element.avatarSize === 'md') {
    styles.width = '100px';
    styles.height = '100px';
  } else if (element.avatarSize === 'lg') {
    styles.width = '150px';
    styles.height = '150px';
  }
  
  // Apply avatar shape
  if (element.avatarShape === 'circle') {
    styles.borderRadius = '50%';
  } else if (element.avatarShape === 'square') {
    styles.borderRadius = '0';
  } else if (element.avatarShape === 'rounded') {
    styles.borderRadius = '8px';
  }
  
  // Apply object fit
  styles.objectFit = 'cover';
  
  return styles;
};
