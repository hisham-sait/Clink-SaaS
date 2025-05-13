export interface TextElementData {
  id: string;
  type: string;
  label: string;
  content?: string;
  textType?: 'heading' | 'paragraph' | 'list';
  
  // Common font size property (synchronized with type-specific sizes)
  fontSize?: string;
  
  // Heading properties
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  headingAlignment?: 'left' | 'center' | 'right';
  headingColor?: string;
  headingSize?: string;
  headingWeight?: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  headingTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  headingStyle?: 'normal' | 'italic' | 'oblique';
  headingDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  headingLineHeight?: string;
  headingLetterSpacing?: string;
  headingTextShadow?: string;
  headingTextShadowColor?: string;
  headingTextShadowBlur?: string;
  headingTextShadowOffsetX?: string;
  headingTextShadowOffsetY?: string;
  
  // Paragraph properties
  paragraphAlignment?: 'left' | 'center' | 'right' | 'justify';
  paragraphColor?: string;
  paragraphSize?: string;
  paragraphWeight?: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  paragraphTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  paragraphStyle?: 'normal' | 'italic' | 'oblique';
  paragraphDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  paragraphLineHeight?: string;
  paragraphLetterSpacing?: string;
  paragraphIndent?: string;
  paragraphTextShadow?: string;
  paragraphTextShadowColor?: string;
  paragraphTextShadowBlur?: string;
  paragraphTextShadowOffsetX?: string;
  paragraphTextShadowOffsetY?: string;
  
  // List properties
  listType?: 'ordered' | 'unordered';
  listItems?: string[];
  listStyle?: 'disc' | 'circle' | 'square' | 'decimal' | 'lower-alpha' | 'upper-alpha' | 'lower-roman' | 'upper-roman';
  listSpacing?: string;
  listColor?: string;
  listSize?: string;
  listWeight?: 'normal' | 'bold' | 'light' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  listTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  listStyle2?: 'normal' | 'italic' | 'oblique';
  listDecoration?: 'none' | 'underline' | 'line-through' | 'overline';
  listLineHeight?: string;
  listLetterSpacing?: string;
  listTextShadow?: string;
  listTextShadowColor?: string;
  listTextShadowBlur?: string;
  listTextShadowOffsetX?: string;
  listTextShadowOffsetY?: string;
  
  // Common properties
  fontFamily?: string;
  textShadow?: string;
  animation?: 'none' | 'fade' | 'slide' | 'bounce' | 'zoom' | 'flip' | 'rotate' | 'pulse';
  animationDuration?: string;
  animationDelay?: string;
  animationEasing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  margin?: string;
  padding?: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  backgroundGradientStartColor?: string;
  backgroundGradientEndColor?: string;
  backgroundGradientAngle?: number;
  borderRadius?: string;
  border?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted' | 'double';
  boxShadow?: string;
  opacity?: number;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  wordBreak?: 'normal' | 'break-all' | 'keep-all' | 'break-word';
  wordWrap?: 'normal' | 'break-word';
  
  // Responsive properties
  hideOnMobile?: boolean;
  hideOnDesktop?: boolean;
  mobileTextSize?: string;
  
  // Accessibility properties
  ariaLabel?: string;
  role?: string;
  tabIndex?: number;
  
  required: boolean;
  description?: string;
}
