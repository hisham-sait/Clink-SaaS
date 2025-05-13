import React, { ChangeEvent } from 'react';

// Main components
import ImageElement from './ImageElement';
import ImageElementProperties from './ImageElementProperties';
import { getImageElementProperties } from './utils/defaultProperties';
import { renderImageJSX } from './utils/renderImageJSX';
import { 
  formatImageUrl, 
  getImageContainerStyles, 
  getImageStyles, 
  getCaptionStyles, 
  getOverlayStyles, 
  getOverlayTextStyles,
  renderImageHTML,
  getImageEJSTemplate
} from './utils/renderImage';
import { renderImageEJS, getImageEJSTemplateCode } from './utils/renderImageEJS';

// Type exports
export type { ImageElementData } from './ImageElementData';

// Export the renderImageElementPropertiesUI function
const renderImageElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(ImageElementProperties, { 
    element, 
    onChange: (updatedElement: any) => {
      console.log('ImageElementProperties onChange called with:', updatedElement);
      
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
        console.log('Element update in renderImageElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId 
  });
};

export {
  // Main components
  ImageElement,
  getImageElementProperties,
  renderImageElementPropertiesUI,
  
  // Render functions
  renderImageJSX,
  renderImageHTML,
  renderImageEJS,
  
  // Helper functions
  formatImageUrl,
  getImageContainerStyles,
  getImageStyles,
  getCaptionStyles,
  getOverlayStyles,
  getOverlayTextStyles,
  
  // Template functions
  getImageEJSTemplate,
  getImageEJSTemplateCode
};
