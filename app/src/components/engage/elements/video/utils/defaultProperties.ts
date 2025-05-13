import { VideoElementData } from '../VideoElementData';

// Default properties for a video element
export const getVideoElementProperties = (): Partial<VideoElementData> => {
  return {
    type: 'video',
    label: 'Video Element',
    
    // Content properties
    videoSource: '',
    videoType: 'url',
    videoId: '',
    videoUrl: '',
    url: '',
    posterImage: '',
    captions: '',
    
    // Caption properties
    caption: '',
    showCaption: false,
    captionPosition: 'bottom',
    captionSize: '14px',
    captionColor: '#000000',
    captionAlignment: 'center',
    
    // Playback properties
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    preload: 'metadata',
    playbackRate: 1,
    startTime: 0,
    endTime: 0,
    
    // Layout properties
    width: '100%',
    height: 'auto',
    aspectRatio: '16:9',
    customAspectRatio: '',
    objectFit: 'contain',
    alignment: 'center',
    
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
    padding: '0',
    
    // Effect properties
    opacity: 1,
    brightness: 1,
    contrast: 1,
    saturation: 1,
    hueRotate: 0,
    blur: '0px',
    grayscale: 0,
    sepia: 0,
    
    // Overlay properties
    overlay: false,
    overlayColor: 'rgba(0,0,0,0.5)',
    overlayOpacity: 0.5,
    overlayText: '',
    overlayTextColor: '#ffffff',
    overlayTextSize: '16px',
    overlayTextPosition: 'center',
    
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
    transcript: '',
    
    required: false,
    description: 'Video element for your page'
  };
};

// Helper function to update box shadow based on individual properties
export const updateBoxShadow = (element: VideoElementData): string => {
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

// Helper function to get video style based on properties
export const getVideoStyle = (element: VideoElementData): React.CSSProperties => {
  const styles: React.CSSProperties = {
    width: element.width || '100%',
    borderRadius: element.borderRadius || '4px',
    overflow: 'hidden',
    position: 'relative',
  };
  
  // Apply aspect ratio
  if (element.aspectRatio && element.aspectRatio !== 'custom') {
    let paddingTop = '56.25%'; // Default 16:9
    
    if (element.aspectRatio === '4:3') {
      paddingTop = '75%';
    } else if (element.aspectRatio === '1:1') {
      paddingTop = '100%';
    }
    
    styles.paddingTop = paddingTop;
  } else if (element.customAspectRatio) {
    // Parse custom aspect ratio (e.g., "16:10")
    const parts = element.customAspectRatio.split(':');
    if (parts.length === 2) {
      const width = parseFloat(parts[0]);
      const height = parseFloat(parts[1]);
      if (!isNaN(width) && !isNaN(height) && width > 0 && height > 0) {
        styles.paddingTop = `${(height / width) * 100}%`;
      }
    }
  }
  
  // Apply height if specified and not using aspect ratio
  if (element.height && element.height !== 'auto' && (!element.aspectRatio || element.aspectRatio === 'custom')) {
    styles.height = element.height;
    styles.paddingTop = undefined;
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
    } else if (element.alignment === 'right') {
      styles.marginLeft = 'auto';
      styles.marginRight = '0';
    } else {
      styles.marginLeft = '0';
      styles.marginRight = 'auto';
    }
  }
  
  // Apply effects
  const filters = [];
  
  if (element.opacity !== undefined && element.opacity !== 1) {
    filters.push(`opacity(${element.opacity})`);
  }
  
  if (element.brightness !== undefined && element.brightness !== 1) {
    filters.push(`brightness(${element.brightness})`);
  }
  
  if (element.contrast !== undefined && element.contrast !== 1) {
    filters.push(`contrast(${element.contrast})`);
  }
  
  if (element.saturation !== undefined && element.saturation !== 1) {
    filters.push(`saturate(${element.saturation})`);
  }
  
  if (element.hueRotate !== undefined && element.hueRotate !== 0) {
    filters.push(`hue-rotate(${element.hueRotate}deg)`);
  }
  
  if (element.blur !== undefined && element.blur !== '0px') {
    filters.push(`blur(${element.blur})`);
  }
  
  if (element.grayscale !== undefined && element.grayscale !== 0) {
    filters.push(`grayscale(${element.grayscale})`);
  }
  
  if (element.sepia !== undefined && element.sepia !== 0) {
    filters.push(`sepia(${element.sepia})`);
  }
  
  if (filters.length > 0) {
    styles.filter = filters.join(' ');
  }
  
  return styles;
};

/**
 * Helper function to extract YouTube video ID from URL
 * Handles various YouTube URL formats including:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/watch?v=VIDEO_ID&feature=featured
 * - https://youtu.be/VIDEO_ID?t=1s
 * - https://youtu.be/VIDEO_ID?si=SOMETHING
 * @param url The YouTube URL
 * @returns The YouTube video ID or empty string if not found
 */
export const extractYouTubeVideoId = (url: string): string => {
  if (!url) return '';
  
  // Log the URL for debugging
  console.log('Extracting YouTube ID from URL:', url);
  
  // Handle youtu.be URLs
  if (url.includes('youtu.be')) {
    // Extract the ID from youtu.be URLs
    const match = url.match(/youtu\.be\/([^?&#]+)/i);
    if (match && match[1]) {
      console.log('Extracted YouTube ID (youtu.be):', match[1]);
      return match[1];
    }
  }
  
  // Handle youtube.com URLs
  if (url.includes('youtube.com')) {
    // Try to extract from watch URLs
    let match = url.match(/[?&]v=([^?&#]+)/i);
    if (match && match[1]) {
      console.log('Extracted YouTube ID (watch):', match[1]);
      return match[1];
    }
    
    // Try to extract from embed URLs
    match = url.match(/embed\/([^?&#]+)/i);
    if (match && match[1]) {
      console.log('Extracted YouTube ID (embed):', match[1]);
      return match[1];
    }
    
    // Try to extract from v URLs
    match = url.match(/youtube\.com\/v\/([^?&#]+)/i);
    if (match && match[1]) {
      console.log('Extracted YouTube ID (v):', match[1]);
      return match[1];
    }
  }
  
  // If the URL is already just the ID (11 characters of letters, numbers, - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    console.log('URL is already a YouTube ID:', url);
    return url;
  }
  
  // If no match found, return empty string
  console.log('No YouTube ID found in URL:', url);
  return '';
};

/**
 * Helper function to extract Vimeo video ID from URL
 * Handles various Vimeo URL formats including:
 * - https://vimeo.com/VIDEO_ID
 * - https://vimeo.com/channels/staffpicks/VIDEO_ID
 * - https://vimeo.com/groups/name/videos/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 * @param url The Vimeo URL
 * @returns The Vimeo video ID or empty string if not found
 */
export const extractVimeoVideoId = (url: string): string => {
  if (!url) return '';
  
  // Log the URL for debugging
  console.log('Extracting Vimeo ID from URL:', url);
  
  // Try to match Vimeo URLs
  const match = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|video\/|)(\d+)(?:$|\/|\?)/i);
  
  if (match && match[1]) {
    console.log('Extracted Vimeo ID:', match[1]);
    return match[1];
  }
  
  // If the URL is already just the ID (numeric)
  if (/^\d+$/.test(url)) {
    console.log('URL is already a Vimeo ID:', url);
    return url;
  }
  
  // If no match found, return empty string
  console.log('No Vimeo ID found in URL:', url);
  return '';
};

// Helper function to adjust color brightness
export const adjustColor = (color: string, amount: number): string => {
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
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};
