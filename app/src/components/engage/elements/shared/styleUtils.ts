import { CSSProperties } from 'react';

/**
 * Generate border styles based on element properties
 * @param element Element with border properties
 * @returns CSS properties for borders
 */
export const getBorderStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.borderStyle && element.borderStyle !== 'none') {
    styles.borderStyle = element.borderStyle;
    styles.borderWidth = element.borderWidth || '1px';
    styles.borderColor = element.borderColor || '#000000';
  } else {
    styles.border = 'none';
  }
  
  if (element.borderRadius) {
    styles.borderRadius = element.borderRadius;
  }
  
  return styles;
};

/**
 * Generate box shadow styles based on element properties
 * @param element Element with shadow properties
 * @returns CSS properties for box shadow
 */
export const getBoxShadowStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.boxShadow && element.boxShadow !== 'none') {
    styles.boxShadow = element.boxShadow;
  } else if (
    element.boxShadowColor || 
    element.boxShadowBlur || 
    element.boxShadowSpread || 
    element.boxShadowOffsetX || 
    element.boxShadowOffsetY
  ) {
    const color = element.boxShadowColor || 'rgba(0,0,0,0.5)';
    const blur = element.boxShadowBlur || '5px';
    const spread = element.boxShadowSpread || '0px';
    const offsetX = element.boxShadowOffsetX || '0px';
    const offsetY = element.boxShadowOffsetY || '0px';
    
    styles.boxShadow = `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
  }
  
  return styles;
};

/**
 * Generate background styles based on element properties
 * @param element Element with background properties
 * @returns CSS properties for background
 */
export const getBackgroundStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.backgroundGradient && element.backgroundGradient !== 'none') {
    const startColor = element.backgroundGradientStartColor || '#ffffff';
    const endColor = element.backgroundGradientEndColor || '#000000';
    const angle = element.backgroundGradientAngle || 45;
    
    styles.backgroundImage = `linear-gradient(${angle}deg, ${startColor}, ${endColor})`;
  } else if (element.backgroundColor) {
    styles.backgroundColor = element.backgroundColor;
  }
  
  return styles;
};

/**
 * Generate spacing styles based on element properties
 * @param element Element with spacing properties
 * @returns CSS properties for spacing
 */
export const getSpacingStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.margin) {
    styles.margin = element.margin;
  }
  
  if (element.padding) {
    styles.padding = element.padding;
  }
  
  return styles;
};

/**
 * Generate dimension styles based on element properties
 * @param element Element with dimension properties
 * @returns CSS properties for dimensions
 */
export const getDimensionStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.width && element.width !== 'auto') {
    styles.width = element.width;
  }
  
  if (element.height && element.height !== 'auto') {
    styles.height = element.height;
  }
  
  if (element.fullWidth) {
    styles.width = '100%';
  }
  
  return styles;
};

/**
 * Adjust color brightness
 * @param color Hex color code
 * @param amount Amount to adjust brightness (-255 to 255)
 * @returns Adjusted hex color
 */
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

/**
 * Combine multiple style objects
 * @param styles Array of style objects
 * @returns Combined style object
 */
export const combineStyles = (...styles: CSSProperties[]): CSSProperties => {
  return Object.assign({}, ...styles);
};
