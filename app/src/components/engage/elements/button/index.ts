import React, { ChangeEvent } from 'react';
import './animations.css'; // Import animations CSS (you'll need to create this file)

// Main components
import ButtonElement from './ButtonElement';
import ButtonElementProperties from './ButtonElementProperties';
import { getButtonElementProperties } from './utils/defaultProperties';
import { renderButtonJSX } from './utils/renderButtonJSX';
import { renderButtonEJS } from './utils/renderButtonEJS';

// Type exports
export type { ButtonElementData } from './ButtonElementData';

// Export the renderButtonElementPropertiesUI function
const renderButtonElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(ButtonElementProperties, { 
    element, 
    onChange: (updatedElement: any) => {
      console.log('ButtonElementProperties onChange called with:', updatedElement);
      
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
        console.log('Element update in renderButtonElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId
  });
};

export {
  // Main components
  ButtonElement,
  ButtonElementProperties,
  getButtonElementProperties,
  renderButtonElementPropertiesUI,
  
  // Render functions
  renderButtonJSX,
  renderButtonEJS
};
