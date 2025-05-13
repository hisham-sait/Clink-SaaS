export interface ProfileElementData {
  id: string;
  type: string;
  label: string;
  
  // Basic properties
  name?: string;
  title?: string;
  bio?: string;
  
  // Avatar properties
  avatarUrl?: string;
  mediaId?: string;
  showAvatar?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  avatarShape?: 'circle' | 'square' | 'rounded';
  
  // Contact properties
  email?: string;
  phone?: string;
  
  // Social properties
  showSocial?: boolean;
  socialLinks?: {
    platform: string;
    url: string;
    icon: string;
  }[];
  
  // Layout properties
  width?: string;
  height?: string;
  alignment?: 'left' | 'center' | 'right';
  layoutTemplate?: 'classic' | 'horizontal' | 'minimal' | 'corporate' | 'creative' | 'social' | 
                   'linkCollection' | 'photoGrid' | 'professionalNetwork' | 'socialFeed' | 'businessCard';
  
  // Cover photo properties
  coverPhotoUrl?: string;
  coverPhotoHeight?: string;
  coverPhotoPosition?: 'top' | 'center' | 'bottom';
  coverPhotoOverlay?: boolean;
  coverPhotoOverlayColor?: string;
  coverPhotoOverlayOpacity?: number;
  
  // Typography properties
  nameFontSize?: string;
  titleFontSize?: string;
  bioFontSize?: string;
  contactFontSize?: string;
  socialIconSize?: string;
  
  // Spacing properties
  avatarSpacing?: string;
  nameSpacing?: string;
  titleSpacing?: string;
  bioSpacing?: string;
  contactSpacing?: string;
  socialSpacing?: string;
  
  // Border properties
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  
  // Background properties
  backgroundColor?: string;
  
  // Shadow properties
  boxShadow?: string;
  boxShadowColor?: string;
  boxShadowBlur?: string;
  boxShadowSpread?: string;
  boxShadowOffsetX?: string;
  boxShadowOffsetY?: string;
  
  // Spacing properties
  margin?: string;
  padding?: string;
  
  // Effect properties
  opacity?: number;
  
  // Animation properties
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'rotate' | 'pulse';
  animationDuration?: string;
  animationDelay?: string;
  animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  // Responsive properties
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  mobileWidth?: string;
  mobileHeight?: string;
  
  // Accessibility properties
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  
  required: boolean;
  description?: string;
}
