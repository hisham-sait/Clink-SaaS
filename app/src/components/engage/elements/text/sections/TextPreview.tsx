import React from 'react';
import { TextElementData } from '../TextElementData';
import { textStyles as styles } from '../../shared';
import { getTextShadowStyle } from '../utils/textShadowUtils';

interface TextPreviewProps {
  element: TextElementData;
  previewText?: string;
  showTitle?: boolean;
}

/**
 * An enhanced component that previews text with all styling and effects
 */
const TextPreview: React.FC<TextPreviewProps> = ({ 
  element, 
  previewText = 'Text Preview', 
  showTitle = false 
}) => {
  const textType = element.textType || 'paragraph';
  
  // Get the appropriate text color based on text type
  const textColor = textType === 'heading' ? 
    (element.headingColor || '#212529') : 
    textType === 'paragraph' ? 
    (element.paragraphColor || '#212529') : 
    (element.listColor || '#212529');
  
  // Get the appropriate font weight based on text type
  const fontWeight = textType === 'heading' ? 
    (element.headingWeight || 'bold') : 
    textType === 'paragraph' ? 
    (element.paragraphWeight || 'normal') : 
    (element.listWeight || 'normal');
  
  // Get the appropriate font size based on text type
  const fontSize = textType === 'heading' ? 
    (element.headingSize || '1.75rem') : 
    textType === 'paragraph' ? 
    (element.paragraphSize || '1rem') : 
    (element.listSize || '1rem');
  
  // Get the appropriate font style based on text type
  const fontStyle = textType === 'heading' ? 
    (element.headingStyle || 'normal') : 
    textType === 'paragraph' ? 
    (element.paragraphStyle || 'normal') : 
    (element.listStyle2 || 'normal');
  
  // Get the appropriate text decoration based on text type
  const textDecoration = textType === 'heading' ? 
    (element.headingDecoration || 'none') : 
    textType === 'paragraph' ? 
    (element.paragraphDecoration || 'none') : 
    (element.listDecoration || 'none');
  
  // Get the appropriate text transform based on text type
  const textTransform = textType === 'heading' ? 
    (element.headingTransform || 'none') : 
    textType === 'paragraph' ? 
    (element.paragraphTransform || 'none') : 
    (element.listTransform || 'none');
  
  // Get the appropriate line height based on text type
  const lineHeight = textType === 'heading' ? 
    (element.headingLineHeight || '1.5') : 
    textType === 'paragraph' ? 
    (element.paragraphLineHeight || '1.5') : 
    (element.listLineHeight || '1.5');
  
  // Get the appropriate letter spacing based on text type
  const letterSpacing = textType === 'heading' ? 
    (element.headingLetterSpacing || 'normal') : 
    textType === 'paragraph' ? 
    (element.paragraphLetterSpacing || 'normal') : 
    (element.listLetterSpacing || 'normal');
  
  // Get the text shadow style
  const textShadow = getTextShadowStyle(element);
  
  // Get the text alignment
  const textAlign = textType === 'heading' ? 
    (element.headingAlignment || 'left') : 
    textType === 'paragraph' ? 
    (element.paragraphAlignment || 'left') : 
    'left';
  
  // Get text indent for paragraphs
  const textIndent = textType === 'paragraph' ? 
    (element.paragraphIndent || '0') : 
    '0';
  
  // Get animation properties if they exist
  const animation = element.animation !== 'none' && element.animation ? 
    `${element.animation} ${element.animationDuration || '1s'} ${element.animationEasing || 'ease'} ${element.animationDelay || '0s'}` : 
    'none';
  
  // Get background color
  const backgroundColor = element.backgroundColor === 'transparent' ? 
    'transparent' : 
    element.backgroundColor || 'transparent';
  
  // Get border properties
  const border = element.borderStyle !== 'none' ? 
    `${element.borderWidth || '1px'} ${element.borderStyle || 'solid'} ${element.borderColor || '#dee2e6'}` : 
    'none';
  
  // Get border radius
  const borderRadius = element.borderRadius || '0';
  
  // Get opacity
  const opacity = element.opacity !== undefined ? element.opacity : 1;
  
  // Get animation class based on the selected animation
  const getAnimationClass = () => {
    if (!element.animation || element.animation === 'none') {
      return '';
    }
    return `text-animation-${element.animation}`;
  };
  
  return (
    <div style={{
      ...styles.textShadowPreview,
      marginTop: '0',
      marginBottom: '10px',
      padding: '10px',
      height: 'auto',
      minHeight: '60px',
      flexDirection: 'column'
    }}>
      {showTitle && (
        <div style={{
          fontSize: '10px',
          color: '#6c757d',
          marginBottom: '5px',
          textAlign: 'center'
        }}>
          Preview
        </div>
      )}
      <div 
        className={getAnimationClass()}
        style={{
          textShadow,
          fontWeight,
          color: textColor,
          fontFamily: element.fontFamily || 'inherit',
          fontSize,
          fontStyle,
          textDecoration,
          textTransform,
          lineHeight,
          letterSpacing,
          textAlign,
          textIndent,
          backgroundColor,
          border,
          borderRadius,
          opacity,
          padding: '5px',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '--animation-duration': element.animationDuration || '1s',
          '--animation-delay': element.animationDelay || '0s',
          '--animation-easing': element.animationEasing || 'ease',
        } as React.CSSProperties}
      >
        {previewText}
      </div>
    </div>
  );
};

export default TextPreview;
