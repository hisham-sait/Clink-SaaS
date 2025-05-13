import React from 'react';
import { SocialElementData } from './SocialElementData';
import { 
  buttonStyles as styles,
  Styling,
  Animation,
  Responsive,
  Accessibility
} from '../shared';
import { CollapsibleSection } from '../shared/components';
import SocialPreview from './sections/SocialPreview';
import ContentProperties from './sections/ContentProperties';
import Layout from './sections/Layout';

interface SocialElementPropertiesProps {
  element: SocialElementData;
  onChange: (updatedElement: SocialElementData) => void;
  companyId?: string;
}

/**
 * Container component for all social element property sections
 */
const SocialElementProperties: React.FC<SocialElementPropertiesProps> = ({
  element,
  onChange,
  companyId = '1'
}) => {
  // Handle form control changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log('SocialElementProperties handleChange:', { name, value, type });
    
    // Handle special case for the entire element update
    if (name === 'element' && typeof value === 'object') {
      console.log('Updating entire element:', value);
      // Apply the update immediately
      onChange(value as SocialElementData);
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        console.log('Element update should be complete now');
      }, 0);
      return;
    }
    
    // Create a deep copy of the element to ensure all properties are properly updated
    const updatedElement = JSON.parse(JSON.stringify(element)) as SocialElementData;
    
    // Handle checkbox inputs
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      // Use type assertion to handle dynamic property access
      (updatedElement as any)[name] = checked;
    } else {
      // Handle all other inputs
      // Use type assertion to handle dynamic property access
      (updatedElement as any)[name] = value;
    }
    
    console.log('Updated element before onChange:', updatedElement);
    onChange(updatedElement);
    
    // Force a re-render to ensure UI updates
    setTimeout(() => {
      console.log('Property update should be complete now');
    }, 0);
  };
  
  return (
    <div style={styles.container} data-testid="social-element-properties">
      {/* Social Preview Section */}
      <CollapsibleSection title="Social Links Preview" defaultExpanded={true}>
        <SocialPreview element={element} showTitle={false} />
      </CollapsibleSection>
      
      {/* Content Properties Section */}
      <CollapsibleSection title="Content Properties" defaultExpanded={true}>
        <ContentProperties 
          element={element} 
          onChange={handleChange}
          companyId={companyId}
        />
      </CollapsibleSection>
      
      {/* Layout Section */}
      <CollapsibleSection title="Layout">
        <Layout 
          element={element} 
          onChange={handleChange} 
        />
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

export default SocialElementProperties;
