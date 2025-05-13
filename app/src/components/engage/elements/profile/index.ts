import React, { ChangeEvent } from 'react';

// Main components
import ProfileElement from './ProfileElement';
import ProfileElementProperties from './ProfileElementProperties';
import type { ProfileElementData } from './ProfileElementData';
import { getProfileElementProperties } from './utils/defaultProperties';
import { renderProfileJSX } from './utils/renderProfileJSX';
import { renderProfileEJS } from './utils/renderProfileEJS';

// Section components
import ProfilePreview from './sections/ProfilePreview';
import ContentProperties from './sections/ContentProperties';
import Layout from './sections/Layout';
import Effects from './sections/Effects';

// Export the renderProfileElementPropertiesUI function
const renderProfileElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(ProfileElementProperties, { 
    element, 
    onChange: (updatedElement: ProfileElementData) => {
      console.log('ProfileElementProperties onChange called with:', updatedElement);
      
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
        console.log('Element update in renderProfileElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId
  });
};

export {
  // Main components
  ProfileElement,
  ProfileElementProperties,
  getProfileElementProperties,
  renderProfileElementPropertiesUI,
  
  // Render functions
  renderProfileJSX,
  renderProfileEJS,
  
  // Section components
  ProfilePreview,
  ContentProperties,
  Layout,
  Effects
};

export type { ProfileElementData };
