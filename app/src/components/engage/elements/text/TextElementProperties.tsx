import React from 'react';
import { TextElementData } from './TextElementData';
import { 
  textStyles as styles,
  Styling,
  Animation,
  Responsive,
  Accessibility
} from '../shared';
import { CollapsibleSection } from '../shared/components';
import TextPreview from './sections/TextPreview';

// Import all section components
import ContentProperties from './sections/ContentProperties';
import Typography from './sections/Typography';
import AdvancedTypography from './sections/AdvancedTypography';

interface TextElementPropertiesProps {
  element: TextElementData;
  onChange: (updatedElement: TextElementData) => void;
  companyId?: string;
}

/**
 * Properties panel for text elements
 * This component serves as a container for all the property sections
 */
const TextElementProperties: React.FC<TextElementPropertiesProps> = ({ 
  element, 
  onChange,
  companyId = '1'
}) => {
  // Handle form control changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log('TextElementProperties handleChange:', { name, value, type });
    
    // Handle special case for the entire element update
    if (name === 'element' && typeof value === 'object') {
      console.log('Updating entire element:', value);
      // Apply the update immediately
      onChange(value as TextElementData);
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        console.log('Element update should be complete now');
      }, 0);
      return;
    }
    
    // Create a deep copy of the element to ensure all properties are properly updated
    const updatedElement = JSON.parse(JSON.stringify(element)) as any;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      updatedElement[name] = checked;
    } else {
      // Handle all other inputs
      updatedElement[name] = value;
    }
    
    // Special case for text type specific properties
    const textType = updatedElement.textType || 'paragraph';
    
    // Synchronize size properties based on text type
    if (name === 'headingSize' && textType === 'heading') {
      updatedElement.fontSize = value;
    } else if (name === 'paragraphSize' && textType === 'paragraph') {
      updatedElement.fontSize = value;
    } else if (name === 'listSize' && textType === 'list') {
      updatedElement.fontSize = value;
    }
    
    console.log('Updated element before onChange:', updatedElement);
    onChange(updatedElement as TextElementData);
    
    // Force a re-render to ensure UI updates
    setTimeout(() => {
      console.log('Property update should be complete now');
    }, 0);
  };
  
  return (
    <div style={styles.container} data-testid="text-element-properties">
      {/* Text Preview Section */}
      <CollapsibleSection title="Text Preview" defaultExpanded={true}>
        <TextPreview element={element} previewText="Text with All Effects" showTitle={false} />
      </CollapsibleSection>
      
      {/* Content Properties Section */}
      <CollapsibleSection title="Content Properties" defaultExpanded={true}>
        <ContentProperties 
          element={element} 
          onChange={handleChange}
          companyId={companyId}
        />
      </CollapsibleSection>
      
      {/* Typography Section */}
      <CollapsibleSection title="Typography">
        <Typography element={element} onChange={handleChange} />
      </CollapsibleSection>
      
      {/* Advanced Typography Section */}
      <CollapsibleSection title="Advanced Typography">
        <AdvancedTypography element={element} onChange={handleChange} />
      </CollapsibleSection>
      
      {/* Styling Section */}
      <CollapsibleSection title="Styling">
        <Styling 
          element={element} 
          onChange={handleChange}
          styles={styles}
        />
      </CollapsibleSection>
      
      {/* Animation Section */}
      <CollapsibleSection title="Animation">
        <Animation 
          element={element} 
          onChange={handleChange}
          styles={styles}
        />
      </CollapsibleSection>
      
      {/* Responsive Section */}
      <CollapsibleSection title="Responsive">
        <Responsive 
          element={element} 
          onChange={handleChange}
          styles={styles}
        />
      </CollapsibleSection>
      
      {/* Accessibility Section */}
      <CollapsibleSection title="Accessibility">
        <Accessibility 
          element={element} 
          onChange={handleChange}
          styles={styles}
        />
      </CollapsibleSection>
    </div>
  );
};

export default TextElementProperties;
