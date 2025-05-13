import React from 'react';
import { ImageElementData } from './ImageElementData';
import { 
  imageStyles as styles,
  Styling,
  Animation,
  Responsive,
  Accessibility
} from '../shared';
import { CollapsibleSection } from '../shared/components';
import ImagePreview from './sections/ImagePreview';
import ContentProperties from './sections/ContentProperties';
import Layout from './sections/Layout';
import Effects from './sections/Effects';

interface ImageElementPropertiesProps {
  element: ImageElementData;
  onChange: (updatedElement: ImageElementData) => void;
  companyId?: string;
}

/**
 * Container component for all image element property sections
 */
const ImageElementProperties: React.FC<ImageElementPropertiesProps> = ({
  element,
  onChange,
  companyId = '1'
}) => {
  // Handle form control changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    console.log('ImageElementProperties handleChange:', { name, value, type });
    
    // Handle special case for the entire element update
    if (name === 'element' && typeof value === 'object') {
      console.log('Updating entire element:', value);
      // Apply the update immediately
      onChange(value as ImageElementData);
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        console.log('Element update should be complete now');
      }, 0);
      return;
    }
    
    // Create a deep copy of the element to ensure all properties are properly updated
    const updatedElement = JSON.parse(JSON.stringify(element)) as ImageElementData;
    
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
    
    // Special case for imageUrl/src synchronization
    if (name === 'src') {
      updatedElement.imageUrl = value;
      console.log('Setting imageUrl to:', value);
    } else if (name === 'imageUrl') {
      updatedElement.src = value;
      console.log('Setting src to:', value);
    }
    
    // Special case for alt/imageAlt synchronization
    if (name === 'alt') {
      updatedElement.imageAlt = value;
      console.log('Setting imageAlt to:', value);
    } else if (name === 'imageAlt') {
      updatedElement.alt = value;
      console.log('Setting alt to:', value);
    }
    
    console.log('Updated element before onChange:', updatedElement);
    onChange(updatedElement);
    
    // Force a re-render to ensure UI updates
    setTimeout(() => {
      console.log('Property update should be complete now');
    }, 0);
  };
  
  return (
    <div style={styles.container} data-testid="image-element-properties">
      {/* Image Preview Section */}
      <CollapsibleSection title="Image Preview" defaultExpanded={true}>
        <ImagePreview element={element} showTitle={false} />
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
      
      {/* Effects Section */}
      <CollapsibleSection title="Effects">
        <Effects 
          element={element} 
          onChange={handleChange} 
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

export default ImageElementProperties;
