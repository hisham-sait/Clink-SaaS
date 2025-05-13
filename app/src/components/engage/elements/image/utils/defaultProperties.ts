import { ImageElementData } from '../ImageElementData';

// Default properties for an image element
export const getImageElementProperties = (): Partial<ImageElementData> => {
  return {
    type: 'image',
    label: 'Image Element',
    
    // Basic properties
    src: '',
    alt: 'Image description',
    caption: '',
    
    // Size and layout properties
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    alignment: 'center',
    
    // Border properties
    borderRadius: '0',
    border: 'none',
    borderColor: '#dee2e6',
    borderWidth: '1px',
    borderStyle: 'solid',
    
    // Background properties
    backgroundColor: 'transparent',
    backgroundGradient: 'none',
    backgroundGradientStartColor: '#ffffff',
    backgroundGradientEndColor: '#f0f0f0',
    backgroundGradientAngle: 135,
    
    // Shadow properties
    boxShadow: 'none',
    boxShadowColor: 'rgba(0,0,0,0.2)',
    boxShadowBlur: '10px',
    boxShadowSpread: '0',
    boxShadowOffsetX: '0',
    boxShadowOffsetY: '4px',
    
    // Filter properties
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hueRotate: 0,
    blur: '0px',
    grayscale: 0,
    sepia: 0,
    opacity: 1,
    
    // Animation properties
    animation: 'none',
    animationDuration: '1s',
    animationDelay: '0s',
    animationEasing: 'ease',
    hoverEffect: false,
    hoverEffectType: 'zoom',
    
    // Spacing properties
    margin: '0 0 1rem 0',
    padding: '0',
    
    // Overlay properties
    overlay: false,
    overlayColor: 'rgba(0,0,0,0.5)',
    overlayOpacity: 0.5,
    overlayText: '',
    overlayTextColor: '#ffffff',
    overlayTextSize: '1rem',
    overlayPosition: 'center',
    
    // Responsive properties
    hideOnMobile: false,
    hideOnDesktop: false,
    mobileWidth: '100%',
    mobileHeight: 'auto',
    
    // Accessibility properties
    ariaLabel: '',
    role: 'img',
    tabIndex: 0,
    
    // Lightbox properties
    enableLightbox: false,
    lightboxCaption: '',
    
    // Media properties
    mediaId: '',
    thumbnailUrl: '',
    
    required: false,
    description: 'Image content for your page'
  };
};

// Helper function to update box shadow based on individual properties
export const updateBoxShadow = (element: ImageElementData): string => {
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

// Helper function to get CSS filter string
export const getFilterStyle = (element: ImageElementData): string => {
  const filters = [];
  
  if (element.brightness !== 100) {
    filters.push(`brightness(${element.brightness}%)`);
  }
  
  if (element.contrast !== 100) {
    filters.push(`contrast(${element.contrast}%)`);
  }
  
  if (element.saturation !== 100) {
    filters.push(`saturate(${element.saturation}%)`);
  }
  
  if (element.hueRotate !== 0) {
    filters.push(`hue-rotate(${element.hueRotate}deg)`);
  }
  
  if (element.blur !== '0px') {
    filters.push(`blur(${element.blur})`);
  }
  
  if (element.grayscale !== 0) {
    filters.push(`grayscale(${element.grayscale}%)`);
  }
  
  if (element.sepia !== 0) {
    filters.push(`sepia(${element.sepia}%)`);
  }
  
  if (element.opacity !== 1) {
    filters.push(`opacity(${element.opacity})`);
  }
  
  return filters.length > 0 ? filters.join(' ') : 'none';
};
