export interface ButtonElementData {
  id: string;
  type: string;
  label: string;
  
  // Content properties
  buttonText?: string;
  buttonType?: 'link' | 'submit' | 'reset';
  url?: string;
  target?: '_blank' | '_self';
  icon?: string;
  iconPosition?: 'left' | 'right';
  
  // Styling properties
  buttonStyle?: 'filled' | 'outline' | 'text' | 'gradient';
  buttonVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark';
  buttonSize?: 'sm' | 'md' | 'lg';
  buttonColor?: string;
  textColor?: string;
  
  // Layout properties
  width?: string;
  height?: string;
  fullWidth?: boolean;
  alignment?: 'left' | 'center' | 'right';
  
  // Border properties
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
  
  // Spacing properties
  margin?: string;
  padding?: string;
  
  // Animation properties
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'rotate' | 'pulse';
  animationDuration?: string;
  animationDelay?: string;
  animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  
  // Hover properties
  hoverEffect?: boolean;
  hoverEffectType?: 'zoom' | 'brighten' | 'darken' | 'shadow' | 'elevate' | 'color-shift';
  hoverButtonColor?: string;
  hoverTextColor?: string;
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
