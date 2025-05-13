// Export all element property functions
import { getTextFieldProperties, renderTextFieldPropertiesUI, FormElement } from './TextFieldElement';
import { getTextAreaProperties, renderTextAreaPropertiesUI } from './TextAreaElement';
import { getCheckboxProperties, renderCheckboxPropertiesUI } from './CheckboxElement';
import { getRadioProperties, renderRadioPropertiesUI } from './RadioElement';
import { getSelectProperties, renderSelectPropertiesUI } from './SelectElement';
import { getDatePickerProperties, renderDatePickerPropertiesUI } from './DatePickerElement';
import { getFileUploadProperties, renderFileUploadPropertiesUI } from './FileUploadElement';

// Import new page element property functions
import { TextElementData } from './text/TextElementData';
import { getTextElementProperties } from './text/utils/defaultProperties';
import { renderTextElementPropertiesUI } from './text';
import { ImageElementData } from './image/ImageElementData';
import { getImageElementProperties } from './image/utils/defaultProperties';
import { renderImageElementPropertiesUI } from './image';
import { VideoElementData } from './video/VideoElementData';
import { getVideoElementProperties, renderVideoElementPropertiesUI } from './video';
// Import from the new button module
import { 
  getButtonElementProperties, 
  ButtonElementData,
  renderButtonElementPropertiesUI 
} from './button';
import { getFormElementProperties, FormElementData } from './FormElement';
import { getCarouselElementProperties, CarouselElementData } from './CarouselElement';
import { getWysiwygElementProperties, WysiwygElementData } from './WysiwygElement';
import { 
  getProfileElementProperties, 
  ProfileElementData,
  renderProfileElementPropertiesUI 
} from './profile';
import { 
  getSocialElementProperties, 
  SocialElementData,
  renderSocialElementPropertiesUI 
} from './social';
import { getInstagramElementProperties, InstagramElementData } from './InstagramElement';
import { getFacebookElementProperties, FacebookElementData } from './FacebookElement';
import { getYoutubeElementProperties, YoutubeElementData } from './YoutubeElement';
import { getProductElementProperties, ProductElementData } from './ProductElement';

import { propertyStyles } from './propertyStyles';

// Re-export the FormElement interface and styles
export type { 
  FormElement,
  TextElementData,
  ImageElementData,
  VideoElementData,
  ButtonElementData,
  FormElementData,
  CarouselElementData,
  WysiwygElementData,
  ProfileElementData,
  SocialElementData,
  InstagramElementData,
  FacebookElementData,
  YoutubeElementData,
  ProductElementData
};
export { propertyStyles };

// Define types for the property renderers
type SimpleRenderer = (
  element: FormElement, 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
) => JSX.Element;

type OptionsRenderer = (
  element: FormElement, 
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  onOptionChange: (index: number, value: string) => void,
  onAddOption: () => void,
  onRemoveOption: (index: number) => void
) => JSX.Element;

// Export all property getters
export const elementProperties = {
  // Form elements
  text: getTextElementProperties, // Changed to use text element properties
  textarea: getTextAreaProperties,
  checkbox: getCheckboxProperties,
  radio: getRadioProperties,
  select: getSelectProperties,
  date: getDatePickerProperties,
  file: getFileUploadProperties,
  
  // Page elements
  image: getImageElementProperties,
  video: getVideoElementProperties,
  button: getButtonElementProperties,
  form: getFormElementProperties,
  carousel: getCarouselElementProperties,
  wysiwyg: getWysiwygElementProperties,
  profile: getProfileElementProperties,
  social: getSocialElementProperties,
  instagram: getInstagramElementProperties,
  facebook: getFacebookElementProperties,
  youtube: getYoutubeElementProperties,
  product: getProductElementProperties
};

// Export all property UI renderers
export const elementPropertiesUI = {
  // Form elements
  text: renderTextElementPropertiesUI as unknown as SimpleRenderer, // Use enhanced text element properties
  textarea: renderTextAreaPropertiesUI as SimpleRenderer,
  checkbox: renderCheckboxPropertiesUI as OptionsRenderer,
  radio: renderRadioPropertiesUI as OptionsRenderer,
  select: renderSelectPropertiesUI as OptionsRenderer,
  date: renderDatePickerPropertiesUI as SimpleRenderer,
  file: renderFileUploadPropertiesUI as SimpleRenderer,
  
  // Page elements
  image: renderImageElementPropertiesUI as unknown as SimpleRenderer,
  video: renderVideoElementPropertiesUI as unknown as SimpleRenderer,
  button: renderButtonElementPropertiesUI as unknown as SimpleRenderer,
  form: null,
  survey: null,
  carousel: null,
  wysiwyg: null,
  profile: renderProfileElementPropertiesUI as unknown as SimpleRenderer,
  social: renderSocialElementPropertiesUI as unknown as SimpleRenderer,
  instagram: null,
  facebook: null,
  youtube: null,
  product: null
};

// Helper function to get default properties for an element type
export const getDefaultProperties = (type: string): Partial<FormElement> => {
  const getProperties = elementProperties[type as keyof typeof elementProperties];
  if (getProperties) {
    return getProperties();
  }
  return {
    type,
    label: 'Unknown Element',
    required: false
  };
};

// Helper function to render properties UI for an element
export const renderPropertiesUI = (
  element: FormElement,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  onOptionChange?: (index: number, value: string) => void,
  onAddOption?: () => void,
  onRemoveOption?: (index: number) => void
) => {
  const renderer = elementPropertiesUI[element.type as keyof typeof elementPropertiesUI];
  if (!renderer) {
    return null;
  }

  // For elements with options
  if (element.type === 'checkbox' || element.type === 'radio' || element.type === 'select') {
    if (!onOptionChange || !onAddOption || !onRemoveOption) {
      console.error(`Option handlers required for ${element.type} element`);
      return null;
    }
    return (renderer as OptionsRenderer)(element, onChange, onOptionChange, onAddOption, onRemoveOption);
  }

  // For simple elements
  return (renderer as SimpleRenderer)(element, onChange);
};
