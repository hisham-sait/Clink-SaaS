export interface VideoElementData {
  id: string;
  type: string;
  label: string;
  
  // Content properties
  videoSource?: string;
  videoType?: 'url' | 'file' | 'embed' | 'youtube' | 'vimeo' | 'custom';
  videoId?: string;
  videoUrl?: string;
  url?: string;
  posterImage?: string;
  captions?: string;
  embedCode?: string; // Added for direct embed code support
  
  // Caption properties
  caption?: string;
  showCaption?: boolean;
  captionPosition?: 'top' | 'bottom';
  captionSize?: string;
  captionColor?: string;
  captionAlignment?: 'left' | 'center' | 'right';
  
  // Playback properties
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
  playbackRate?: number;
  startTime?: number;
  endTime?: number;
  
  // Layout properties
  width?: string;
  height?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1' | 'custom';
  customAspectRatio?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  alignment?: 'left' | 'center' | 'right';
  
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
  brightness?: number;
  contrast?: number;
  saturation?: number;
  hueRotate?: number;
  blur?: string;
  grayscale?: number;
  sepia?: number;
  
  // Overlay properties
  overlay?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayText?: string;
  overlayTextColor?: string;
  overlayTextSize?: string;
  overlayTextPosition?: 'top' | 'center' | 'bottom';
  
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
  transcript?: string;
  
  required: boolean;
  description?: string;
}
