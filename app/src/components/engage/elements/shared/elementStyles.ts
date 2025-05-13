import { CSSProperties } from 'react';

/**
 * Type definitions for element styles
 */
export interface BaseStyles {
  formGroup: CSSProperties;
  label: CSSProperties;
  inlineLabel: CSSProperties;
  formControl: CSSProperties;
  select: CSSProperties;
  textarea: CSSProperties;
  helpText: CSSProperties;
  row: CSSProperties;
  header: CSSProperties;
  container: CSSProperties;
  sectionHeader: CSSProperties;
  inlineControl: CSSProperties;
  compactColorControl: CSSProperties;
  colorText: CSSProperties;
  colorSwatch: CSSProperties;
  unitInput: CSSProperties;
  valueInput: CSSProperties;
  unitSelect: CSSProperties;
  grid3: CSSProperties;
  grid2: CSSProperties;
  sliderContainer: CSSProperties;
  sliderLabel: CSSProperties;
  slider: CSSProperties;
  miniButton: CSSProperties;
  switchLabel: CSSProperties;
  divider: CSSProperties;
  colorPicker: CSSProperties;
}

export interface PreviewStyles {
  previewContainer: CSSProperties;
  previewLabel: CSSProperties;
}

export interface TextElementStyles extends BaseStyles, PreviewStyles {
  fontPreview: CSSProperties;
  textShadowPreview: CSSProperties;
}

export interface ImageElementStyles extends BaseStyles, PreviewStyles {
  imagePreview: CSSProperties;
  imagePlaceholder: CSSProperties;
  mediaSelector: CSSProperties;
  mediaThumbnail: CSSProperties;
  overlay: CSSProperties;
}

export interface VideoElementStyles extends BaseStyles, PreviewStyles {
  videoPreview: CSSProperties;
  videoPlaceholder: CSSProperties;
  urlInputGroup: CSSProperties;
  urlInput: CSSProperties;
}

export interface ButtonElementStyles extends BaseStyles, PreviewStyles {
  buttonPreview: CSSProperties;
  buttonPlaceholder: CSSProperties;
  iconSelector: CSSProperties;
}

/**
 * Base styles shared across all elements
 */
export const baseStyles: BaseStyles = {
  formGroup: {
    marginBottom: '3px',
  },
  label: {
    fontSize: '10px',
    marginBottom: '1px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  formControl: {
    fontSize: '11px',
    padding: '2px 6px',
    height: '22px',
  },
  select: {
    fontSize: '11px',
    padding: '2px 6px',
    height: '22px',
  },
  textarea: {
    minHeight: '60px',
    fontSize: '11px',
    padding: '2px 6px',
    resize: 'vertical' as 'vertical',
    height: 'auto',
  },
  colorPicker: {
    width: '22px',
    height: '22px',
    padding: '1px',
    marginRight: '2px',
  },
  helpText: {
    fontSize: '9px',
    marginTop: '1px',
    color: '#6c757d',
  },
  row: {
    marginBottom: '2px',
  },
  header: {
    fontSize: '12px',
    fontWeight: 600,
    marginBottom: '4px',
  },
  container: {
    padding: '0px',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    marginTop: '6px',
    marginBottom: '1px',
    borderBottom: '1px solid #dee2e6',
    paddingBottom: '1px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  inlineLabel: {
    fontSize: '10px',
    fontWeight: 500,
    marginBottom: '0',
    marginRight: '4px',
    whiteSpace: 'nowrap',
  },
  inlineControl: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '3px',
  },
  compactColorControl: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '3px',
    overflow: 'hidden',
    height: '22px',
  },
  colorText: {
    fontSize: '11px',
    padding: '2px 6px',
    border: 'none',
    flex: 1,
    height: '22px',
  },
  colorSwatch: {
    width: '22px',
    height: '22px',
    border: 'none',
    padding: '0',
  },
  unitInput: {
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #ced4da',
    borderRadius: '3px',
    overflow: 'hidden',
    height: '22px',
  },
  valueInput: {
    fontSize: '11px',
    padding: '2px 6px',
    border: 'none',
    width: '60%',
    height: '22px',
  },
  unitSelect: {
    fontSize: '11px',
    padding: '0 2px',
    border: 'none',
    borderLeft: '1px solid #ced4da',
    width: '40%',
    height: '22px',
  },
  grid3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '4px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '4px',
  },
  sliderContainer: {
    marginBottom: '4px',
  },
  sliderLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    marginBottom: '1px',
  },
  slider: {
    width: '100%',
    height: '14px',
    padding: '0',
  },
  miniButton: {
    fontSize: '9px',
    padding: '0px 4px',
    height: '18px',
    lineHeight: '16px',
  },
  switchLabel: {
    fontSize: '10px',
    marginLeft: '4px',
  },
  divider: {
    margin: '6px 0',
    borderTop: '1px solid #e9ecef',
  },
};

/**
 * Common preview styles
 */
export const previewStyles: PreviewStyles = {
  previewContainer: {
    marginTop: '5px',
    marginBottom: '10px',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '3px',
    backgroundColor: '#f8f9fa',
  },
  previewLabel: {
    fontSize: '10px',
    fontWeight: 500,
    marginBottom: '4px',
  },
};

/**
 * Text element specific styles
 */
export const textStyles: TextElementStyles = {
  ...baseStyles,
  ...previewStyles,
  fontPreview: {
    fontSize: '11px',
    padding: '2px',
    marginTop: '2px',
    border: '1px solid #dee2e6',
    borderRadius: '3px',
    backgroundColor: '#f8f9fa',
  },
  textShadowPreview: {
    marginTop: '5px',
    marginBottom: '10px',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '3px',
    fontSize: '12px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    height: '40px'
  }
};

/**
 * Image element specific styles
 */
export const imageStyles: ImageElementStyles = {
  ...baseStyles,
  ...previewStyles,
  imagePreview: {
    marginTop: '5px',
    marginBottom: '10px',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: '100px',
    position: 'relative' as 'relative',
    overflow: 'hidden',
  },
  imagePlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d',
    fontSize: '12px',
    width: '100%',
    height: '100%',
  },
  mediaSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
  mediaThumbnail: {
    width: '40px',
    height: '40px',
    objectFit: 'cover',
    borderRadius: '3px',
    border: '1px solid #dee2e6',
  },
  overlay: {
    position: 'absolute' as 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    textAlign: 'center',
    padding: '10px',
  }
};

/**
 * Video element specific styles
 */
export const videoStyles: VideoElementStyles = {
  ...baseStyles,
  ...previewStyles,
  videoPreview: {
    marginTop: '5px',
    marginBottom: '10px',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: '100px',
    position: 'relative' as 'relative',
    overflow: 'hidden',
  },
  videoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d',
    fontSize: '12px',
    width: '100%',
    height: '100%',
  },
  urlInputGroup: {
    display: 'flex',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    marginRight: '4px',
  },
};

/**
 * Button element specific styles
 */
export const buttonStyles: ButtonElementStyles = {
  ...baseStyles,
  ...previewStyles,
  buttonPreview: {
    marginTop: '5px',
    marginBottom: '10px',
    padding: '8px',
    border: '1px dashed #ccc',
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    minHeight: '60px',
    position: 'relative' as 'relative',
    overflow: 'hidden',
  },
  buttonPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6c757d',
    fontSize: '12px',
    width: '100%',
    height: '100%',
  },
  iconSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px',
  },
};

/**
 * Profile element specific styles
 */
export const profileStyles: BaseStyles & PreviewStyles = {
  ...baseStyles,
  ...previewStyles
};

// Export a function to get styles for a specific element type
export function getElementStyles(elementType: string): any {
  switch (elementType) {
    case 'text':
      return textStyles;
    case 'image':
      return imageStyles;
    case 'video':
      return videoStyles;
    case 'button':
      return buttonStyles;
    case 'profile':
      return profileStyles;
    default:
      return baseStyles;
  }
}
