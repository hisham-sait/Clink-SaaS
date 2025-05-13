import { CSSProperties } from 'react';

/**
 * Generate animation styles based on element properties
 * @param element Element with animation properties
 * @returns CSS properties for animation
 */
export const getAnimationStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (element.animation && element.animation !== 'none') {
    styles.animation = `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}`;
  }
  
  return styles;
};

/**
 * Generate hover effect styles based on element properties
 * @param element Element with hover effect properties
 * @returns CSS properties for hover effects
 */
export const getHoverStyles = (element: any): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (!element.hoverEffect) {
    return styles;
  }
  
  // Apply effect type specific styles
  switch (element.hoverEffectType) {
    case 'zoom':
      styles.transform = 'scale(1.1)';
      break;
    case 'brighten':
      styles.filter = 'brightness(1.2)';
      break;
    case 'darken':
      styles.filter = 'brightness(0.8)';
      break;
    case 'shadow':
      styles.boxShadow = '0 5px 15px rgba(0,0,0,0.3)';
      break;
    case 'elevate':
      styles.transform = 'translateY(-3px)';
      styles.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
      break;
    case 'blur':
      styles.filter = 'blur(2px)';
      break;
    case 'grayscale':
      styles.filter = 'grayscale(100%)';
      break;
    case 'sepia':
      styles.filter = 'sepia(100%)';
      break;
    case 'color-shift':
      // Color shift is handled separately with custom hover colors
      break;
  }
  
  return styles;
};

/**
 * Generate transition styles for hover effects
 * @param element Element with hover effect properties
 * @param hoverStyles The hover styles to generate transitions for
 * @returns CSS properties for transitions
 */
export const getTransitionStyles = (element: any, hoverStyles: CSSProperties): CSSProperties => {
  const styles: CSSProperties = {};
  
  if (!element.hoverEffect) {
    return styles;
  }
  
  const transitionDuration = element.hoverTransitionDuration || '0.3s';
  
  // Build transition property based on what's changing
  const transitionProps = [];
  if (hoverStyles.transform) transitionProps.push('transform');
  if (hoverStyles.filter) transitionProps.push('filter');
  if (hoverStyles.boxShadow) transitionProps.push('box-shadow');
  if (hoverStyles.backgroundColor || hoverStyles.backgroundImage) transitionProps.push('background-color', 'background-image');
  if (hoverStyles.color) transitionProps.push('color');
  if (hoverStyles.borderColor) transitionProps.push('border-color');
  
  // If no specific properties are changing, add a default set
  if (transitionProps.length === 0) {
    transitionProps.push('color', 'background-color', 'border-color', 'box-shadow');
  }
  
  styles.transition = transitionProps.map(prop => `${prop} ${transitionDuration} ease`).join(', ');
  
  return styles;
};

/**
 * Generate CSS keyframes for an animation
 * @param animationType The type of animation
 * @returns CSS keyframes string
 */
export const getAnimationKeyframes = (animationType: string): string => {
  switch (animationType) {
    case 'fade':
      return `
        @keyframes fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
    case 'slide':
      return `
        @keyframes slide {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
    case 'bounce':
      return `
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-30px); }
          60% { transform: translateY(-15px); }
        }
      `;
    case 'zoom':
      return `
        @keyframes zoom {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `;
    case 'flip':
      return `
        @keyframes flip {
          from { transform: perspective(400px) rotateY(90deg); opacity: 0; }
          to { transform: perspective(400px) rotateY(0deg); opacity: 1; }
        }
      `;
    case 'rotate':
      return `
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
    case 'pulse':
      return `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      `;
    default:
      return '';
  }
};

/**
 * Generate CSS for all animations
 * @returns CSS for all animations
 */
export const getAllAnimationsCSS = (): string => {
  const animations = ['fade', 'slide', 'bounce', 'zoom', 'flip', 'rotate', 'pulse'];
  return animations.map(animation => getAnimationKeyframes(animation)).join('\n');
};
