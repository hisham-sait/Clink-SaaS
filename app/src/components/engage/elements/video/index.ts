import React, { ChangeEvent } from 'react';
import './animations.css'; // Import animations CSS

// Main components
import VideoElement from './VideoElement';
import VideoElementProperties from './VideoElementProperties';
import type { VideoElementData } from './VideoElementData';
import { getVideoElementProperties } from './utils/defaultProperties';
import { renderVideoJSX } from './utils/renderVideoJSX';
import { renderVideoEJS } from './utils/renderVideoEJS';

// Import shared section components
import { Styling, Animation, Responsive, Accessibility } from '../shared';

// Section components
import VideoPreview from './sections/VideoPreview';
import ContentProperties from './sections/ContentProperties';
import Layout from './sections/Layout';
import Effects from './sections/Effects';

// Export the renderVideoElementPropertiesUI function
const renderVideoElementPropertiesUI = (
  element: any,
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  companyId?: string
) => {
  return React.createElement(VideoElementProperties, { 
    element, 
    onChange: (updatedElement: VideoElementData) => {
      console.log('VideoElementProperties onChange called with:', updatedElement);
      
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
        console.log('Element update in renderVideoElementPropertiesUI should be complete now');
      }, 0);
    },
    companyId
  });
};

export {
  // Main components
  VideoElement,
  VideoElementProperties,
  getVideoElementProperties,
  renderVideoElementPropertiesUI,
  
  // Render functions
  renderVideoJSX,
  renderVideoEJS,
  
  // Section components
  VideoPreview,
  ContentProperties,
  Layout,
  Styling,
  Effects,
  Animation,
  Responsive,
  Accessibility
};

export type { VideoElementData };
