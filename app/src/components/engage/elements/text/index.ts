import React, { ChangeEvent } from 'react';
import './animations.css'; // Import animations CSS

// Main components
import TextElement from './TextElement';
import TextElementProperties from './TextElementProperties';
import { getTextElementProperties } from './utils/defaultProperties';
import { TextElementData } from './TextElementData';

// Utility functions
import { updateTextShadow, getTextShadowStyle } from './utils/textShadowUtils';

// Import shared section components
import { Styling, Animation, Responsive, Accessibility } from '../shared';

// Section components
import ContentProperties from './sections/ContentProperties';
import Typography from './sections/Typography';
import AdvancedTypography from './sections/AdvancedTypography';
import TextPreview from './sections/TextPreview';

// Type exports
export type { TextElementData } from './TextElementData';

// Export the renderTextElementPropertiesUI function for backward compatibility
const renderTextElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(TextElementProperties, { 
    element, 
    onChange: (updatedElement: TextElementData) => {
      console.log('TextElementProperties onChange called with:', updatedElement);
      
      // Instead of dispatching multiple individual events, create a single synthetic event
      // for the entire element update
      const syntheticEvent = {
        target: {
          name: 'element',
          value: updatedElement,
          type: 'object'
        },
        currentTarget: {
          name: 'element',
          value: updatedElement,
          type: 'object'
        },
        preventDefault: () => {},
        stopPropagation: () => {}
      } as any;
      
      console.log('Dispatching synthetic event for entire element:', syntheticEvent);
      onChange(syntheticEvent);
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        console.log('Element update in renderTextElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId
  });
};

export {
  // Main components
  TextElement,
  TextElementProperties,
  getTextElementProperties,
  renderTextElementPropertiesUI,
  
  // Utility functions
  updateTextShadow,
  getTextShadowStyle,
  
  
  // Section components
  ContentProperties,
  Typography,
  AdvancedTypography,
  TextPreview,
  Styling,
  Animation,
  Responsive,
  Accessibility
};
