import { TextElementData } from '../TextElementData';

// Default properties for a text element
export const getTextElementProperties = (): Partial<TextElementData> => {
  return {
    type: 'text',
    label: 'Text Element',
    content: '',
    textType: 'paragraph',
    
    // Heading properties
    headingLevel: 2,
    headingAlignment: 'left',
    headingColor: '#212529',
    headingSize: '1.75rem',
    headingWeight: 'bold',
    headingTransform: 'none',
    headingStyle: 'normal',
    headingDecoration: 'none',
    headingLineHeight: '1.5',
    headingLetterSpacing: 'normal',
    headingTextShadow: 'none',
    headingTextShadowColor: 'rgba(0,0,0,0.3)',
    headingTextShadowBlur: '2px',
    headingTextShadowOffsetX: '1px',
    headingTextShadowOffsetY: '1px',
    
    // Paragraph properties
    paragraphAlignment: 'left',
    paragraphColor: '#212529',
    paragraphSize: '1rem',
    paragraphWeight: 'normal',
    paragraphTransform: 'none',
    paragraphStyle: 'normal',
    paragraphDecoration: 'none',
    paragraphLineHeight: '1.5',
    paragraphLetterSpacing: 'normal',
    paragraphIndent: '0',
    paragraphTextShadow: 'none',
    paragraphTextShadowColor: 'rgba(0,0,0,0.3)',
    paragraphTextShadowBlur: '2px',
    paragraphTextShadowOffsetX: '1px',
    paragraphTextShadowOffsetY: '1px',
    
    // List properties
    listType: 'unordered',
    listItems: ['Item 1', 'Item 2', 'Item 3'],
    listStyle: 'disc',
    listSpacing: '0.5rem',
    listColor: '#212529',
    listSize: '1rem',
    listWeight: 'normal',
    listTransform: 'none',
    listStyle2: 'normal',
    listDecoration: 'none',
    listLineHeight: '1.5',
    listLetterSpacing: 'normal',
    listTextShadow: 'none',
    listTextShadowColor: 'rgba(0,0,0,0.3)',
    listTextShadowBlur: '2px',
    listTextShadowOffsetX: '1px',
    listTextShadowOffsetY: '1px',
    
    // Common properties
    fontFamily: 'inherit',
    textShadow: 'none',
    animation: 'none',
    animationDuration: '1s',
    animationDelay: '0s',
    animationEasing: 'ease',
    margin: '0 0 1rem 0',
    padding: '0',
    backgroundColor: 'transparent',
    backgroundGradient: 'none',
    backgroundGradientStartColor: '#ffffff',
    backgroundGradientEndColor: '#f0f0f0',
    backgroundGradientAngle: 135,
    borderRadius: '0',
    border: 'none',
    borderColor: '#dee2e6',
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: 'none',
    opacity: 1,
    overflow: 'visible',
    wordBreak: 'normal',
    wordWrap: 'normal',
    
    // Responsive properties
    hideOnMobile: false,
    hideOnDesktop: false,
    mobileTextSize: '0.9rem',
    
    // Accessibility properties
    ariaLabel: '',
    role: '',
    tabIndex: 0,
    
    required: false,
    description: 'Text content for headings, paragraphs, or lists'
  };
};
