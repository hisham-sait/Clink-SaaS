import { TextElementData } from '../TextElementData';

/**
 * Updates the text shadow property based on the individual shadow components
 * @param element The text element data
 * @param textType The type of text (heading, paragraph, list)
 * @returns The updated text shadow value
 */
export const updateTextShadow = (
  element: TextElementData,
  textType: 'heading' | 'paragraph' | 'list'
): string => {
  const prefix = textType;
  
  const shadowType = element[`${prefix}TextShadow` as keyof TextElementData];
  if (shadowType === 'none') {
    return 'none';
  }
  
  const color = element[`${prefix}TextShadowColor` as keyof TextElementData] as string || 'rgba(0,0,0,0.3)';
  const blur = element[`${prefix}TextShadowBlur` as keyof TextElementData] as string || '2px';
  const offsetX = element[`${prefix}TextShadowOffsetX` as keyof TextElementData] as string || '1px';
  const offsetY = element[`${prefix}TextShadowOffsetY` as keyof TextElementData] as string || '1px';
  
  return `${offsetX} ${offsetY} ${blur} ${color}`;
};

/**
 * Gets the text shadow CSS value for a text element
 * @param element The text element data
 * @returns The CSS text-shadow value
 */
export const getTextShadowStyle = (element: TextElementData): string => {
  const textType = element.textType || 'paragraph';
  
  if (textType === 'heading') {
    return element.headingTextShadow === 'none' ? 
      'none' : 
      `${element.headingTextShadowOffsetX || '1px'} ${element.headingTextShadowOffsetY || '1px'} ${element.headingTextShadowBlur || '2px'} ${element.headingTextShadowColor || 'rgba(0,0,0,0.3)'}`;
  } else if (textType === 'paragraph') {
    return element.paragraphTextShadow === 'none' ? 
      'none' : 
      `${element.paragraphTextShadowOffsetX || '1px'} ${element.paragraphTextShadowOffsetY || '1px'} ${element.paragraphTextShadowBlur || '2px'} ${element.paragraphTextShadowColor || 'rgba(0,0,0,0.3)'}`;
  } else {
    return element.listTextShadow === 'none' ? 
      'none' : 
      `${element.listTextShadowOffsetX || '1px'} ${element.listTextShadowOffsetY || '1px'} ${element.listTextShadowBlur || '2px'} ${element.listTextShadowColor || 'rgba(0,0,0,0.3)'}`;
  }
};
