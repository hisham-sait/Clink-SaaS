import React, { ChangeEvent } from 'react';

// Main components
import SocialElement from './SocialElement';
import SocialElementProperties from './SocialElementProperties';
import { getSocialElementProperties } from './utils/defaultProperties';
import { renderSocialJSX } from './utils/renderSocialJSX';
import { renderSocialEJS } from './utils/renderSocialEJS';

// Type exports
export type { SocialElementData } from './SocialElementData';
export type { SocialLink } from './SocialElementData';

// Export the renderSocialElementPropertiesUI function
const renderSocialElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(SocialElementProperties, { 
    element, 
    onChange: (updatedElement: any) => {
      console.log('SocialElementProperties onChange called with:', updatedElement);
      
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
        console.log('Element update in renderSocialElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId
  });
};

export {
  // Main components
  SocialElement,
  SocialElementProperties,
  getSocialElementProperties,
  renderSocialElementPropertiesUI,
  
  // Render functions
  renderSocialJSX,
  renderSocialEJS
};
