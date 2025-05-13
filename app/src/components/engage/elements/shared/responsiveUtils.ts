import { CSSProperties } from 'react';

/**
 * Generate responsive class names based on element properties
 * @param element Element with responsive properties
 * @returns Class names for responsive behavior
 */
export const getResponsiveClassNames = (element: any): string => {
  let classNames = '';
  
  if (element.hideOnMobile) {
    classNames += ' d-none d-md-block hide-on-mobile';
  }
  
  if (element.hideOnDesktop) {
    classNames += ' d-md-none hide-on-desktop';
  }
  
  return classNames;
};

/**
 * Generate responsive styles for mobile devices
 * @param element Element with responsive properties
 * @returns CSS media query string for mobile devices
 */
export const getMobileStyles = (element: any): string => {
  const styles = [];
  
  if (element.hideOnMobile) {
    styles.push('@media (max-width: 768px) { display: none !important; }');
  }
  
  if (element.mobileWidth || element.mobileHeight) {
    let mediaQueryContent = '@media (max-width: 768px) {';
    
    if (element.mobileWidth) {
      mediaQueryContent += ` width: ${element.mobileWidth};`;
    }
    
    if (element.mobileHeight) {
      mediaQueryContent += ` height: ${element.mobileHeight};`;
    }
    
    mediaQueryContent += ' }';
    styles.push(mediaQueryContent);
  }
  
  if (element.mobileTextSize) {
    styles.push(`@media (max-width: 768px) { font-size: ${element.mobileTextSize}; }`);
  }
  
  return styles.join('\n');
};

/**
 * Generate responsive styles for desktop devices
 * @param element Element with responsive properties
 * @returns CSS media query string for desktop devices
 */
export const getDesktopStyles = (element: any): string => {
  const styles = [];
  
  if (element.hideOnDesktop) {
    styles.push('@media (min-width: 769px) { display: none !important; }');
  }
  
  return styles.join('\n');
};

/**
 * Generate inline responsive styles for React components
 * @param element Element with responsive properties
 * @returns CSS properties for responsive behavior
 */
export const getResponsiveStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  // These are handled via class names in getResponsiveClassNames
  // This function is primarily for any additional inline styles
  
  return styles;
};

/**
 * Generate a complete set of responsive CSS rules
 * @param element Element with responsive properties
 * @param elementId Unique ID for the element
 * @returns Complete CSS string for responsive behavior
 */
export const getResponsiveCSS = (element: any, elementId: string): string => {
  const styles = [];
  
  if (element.hideOnMobile) {
    styles.push(`
      @media (max-width: 768px) {
        .${elementId} {
          display: none !important;
        }
      }
    `);
  }
  
  if (element.hideOnDesktop) {
    styles.push(`
      @media (min-width: 769px) {
        .${elementId} {
          display: none !important;
        }
      }
    `);
  }
  
  if (element.mobileWidth || element.mobileHeight || element.mobileTextSize) {
    let mediaQueryContent = `
      @media (max-width: 768px) {
        .${elementId} {
    `;
    
    if (element.mobileWidth) {
      mediaQueryContent += `width: ${element.mobileWidth} !important;`;
    }
    
    if (element.mobileHeight) {
      mediaQueryContent += `height: ${element.mobileHeight} !important;`;
    }
    
    if (element.mobileTextSize) {
      mediaQueryContent += `font-size: ${element.mobileTextSize} !important;`;
    }
    
    mediaQueryContent += `
        }
      }
    `;
    
    styles.push(mediaQueryContent);
  }
  
  return styles.join('\n');
};
