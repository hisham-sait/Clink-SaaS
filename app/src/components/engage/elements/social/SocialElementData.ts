export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  label?: string;
}

export interface SocialElementData {
  id: string;
  type: string;
  label: string;
  
  // Content properties
  links: SocialLink[];
  displayStyle: 'icons' | 'buttons' | 'text';
  iconSize: 'sm' | 'md' | 'lg';
  iconColor?: string;
  
  // Layout properties
  alignment: 'left' | 'center' | 'right';
  spacing?: string;
  showLabels: boolean;
  openInNewTab: boolean;
  
  // Styling properties
  backgroundColor?: string;
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  
  // Shadow properties
  boxShadow?: string;
  boxShadowColor?: string;
  boxShadowBlur?: string;
  boxShadowSpread?: string;
  boxShadowOffsetX?: string;
  boxShadowOffsetY?: string;
  
  // Size properties
  width?: string;
  height?: string;
  
  // Spacing properties
  margin?: string;
  padding?: string;
  
  // Animation properties
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'rotate' | 'pulse';
  animationDuration?: string;
  animationDelay?: string;
  animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  // Hover effect properties
  hoverEffect?: boolean;
  hoverEffectType?: 'zoom' | 'brighten' | 'darken' | 'shadow' | 'elevate' | 'color-shift';
  hoverIconColor?: string;
  hoverBackgroundColor?: string;
  hoverBorderColor?: string;
  hoverTransitionDuration?: string;
  
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
