export interface ImageElementData {
  id: string;
  type: string;
  label: string;
  
  // Basic properties
  src?: string;
  imageUrl?: string; // Added for compatibility with EJS templates
  alt?: string;
  imageAlt?: string; // Added for compatibility with EJS templates
  caption?: string;
  
  // Size and layout properties
  width?: string;
  height?: string;
  objectFit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down';
  alignment?: 'left' | 'center' | 'right';
  
  // Border properties
  borderRadius?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  
  // Background properties
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundGradientStartColor?: string;
  backgroundGradientEndColor?: string;
  backgroundGradientAngle?: number;
  
  // Shadow properties
  boxShadow?: string;
  boxShadowColor?: string;
  boxShadowBlur?: string;
  boxShadowSpread?: string;
  boxShadowOffsetX?: string;
  boxShadowOffsetY?: string;
  
  // Filter properties
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hueRotate?: number;
  blur?: string;
  grayscale?: number;
  sepia?: number;
  opacity?: number;
  
  // Animation properties
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'rotate' | 'pulse';
  animationDuration?: string;
  animationDelay?: string;
  animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  hoverEffect?: boolean;
  hoverEffectType?: 'zoom' | 'brighten' | 'darken' | 'blur' | 'grayscale' | 'sepia' | 'shadow';
  
  // Spacing properties
  margin?: string;
  padding?: string;
  
  // Overlay properties
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayText?: string;
  overlayTextColor?: string;
  overlayTextSize?: string;
  overlayPosition?: 'top' | 'bottom' | 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  // Responsive properties
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  mobileWidth?: string;
  mobileHeight?: string;
  
  // Accessibility properties
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  
  // Lightbox properties
  enableLightbox?: boolean;
  lightboxCaption?: string;
  
  // Media properties
  mediaId?: string;
  thumbnailUrl?: string;
  
  required: boolean;
  description?: string;
}
