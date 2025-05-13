/**
 * Generate accessibility attributes based on element properties
 * @param element Element with accessibility properties
 * @returns Object containing accessibility attributes
 */
export const getAccessibilityAttributes = (element: any): Record<string, any> => {
  const attributes: Record<string, any> = {};
  
  // Add ARIA label if provided
  if (element.ariaLabel) {
    attributes['aria-label'] = element.ariaLabel;
  } else if (element.buttonText) {
    // Use button text as fallback for buttons
    attributes['aria-label'] = element.buttonText;
  } else if (element.alt) {
    // Use alt text as fallback for images
    attributes['aria-label'] = element.alt;
  } else if (element.content) {
    // Use content as fallback for text elements
    // Truncate long content for aria-label
    const truncatedContent = element.content.substring(0, 100);
    attributes['aria-label'] = truncatedContent + (element.content.length > 100 ? '...' : '');
  }
  
  // Add role if provided
  if (element.role) {
    attributes.role = element.role;
  } else {
    // Set default roles based on element type
    switch (element.type) {
      case 'button':
        attributes.role = 'button';
        break;
      case 'image':
        attributes.role = 'img';
        break;
      case 'text':
        if (element.textType === 'heading') {
          attributes.role = 'heading';
          attributes['aria-level'] = element.headingLevel || 2;
        }
        break;
    }
  }
  
  // Add tabIndex if provided
  if (element.tabIndex !== undefined) {
    attributes.tabIndex = element.tabIndex;
  }
  
  // Add additional accessibility attributes based on element type
  switch (element.type) {
    case 'button':
      if (element.buttonType === 'submit') {
        attributes.type = 'submit';
      } else if (element.buttonType === 'reset') {
        attributes.type = 'reset';
      }
      break;
    case 'image':
      // Ensure alt text is always available for images
      if (!attributes['aria-label'] && !element.alt) {
        attributes['aria-label'] = element.label || 'Image';
      }
      
      // If image is decorative, set appropriate attributes
      if (element.decorative) {
        attributes['aria-hidden'] = 'true';
        attributes.role = 'presentation';
      }
      break;
  }
  
  return attributes;
};

/**
 * Check if an element meets basic accessibility requirements
 * @param element Element to check
 * @returns Object containing validation results
 */
export const validateAccessibility = (element: any): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  // Check for missing alt text on images
  if (element.type === 'image' && !element.alt && !element.ariaLabel) {
    issues.push('Image is missing alternative text (alt or aria-label)');
  }
  
  // Check for missing button text
  if (element.type === 'button' && !element.buttonText && !element.ariaLabel) {
    issues.push('Button is missing text or aria-label');
  }
  
  // Check for color contrast issues (simplified check)
  if (element.type === 'text' || element.type === 'button') {
    // This would ideally use a color contrast algorithm
    // For now, just flag potential issues
    if (element.textColor === element.backgroundColor) {
      issues.push('Text color matches background color, which may cause visibility issues');
    }
  }
  
  // Check for proper heading structure
  if (element.type === 'text' && element.textType === 'heading') {
    if (!element.headingLevel) {
      issues.push('Heading is missing a level (h1-h6)');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};

/**
 * Generate ARIA attributes for form elements
 * @param element Element with form-related properties
 * @returns Object containing ARIA attributes for forms
 */
export const getFormAccessibilityAttributes = (element: any): Record<string, any> => {
  const attributes: Record<string, any> = {};
  
  if (element.required) {
    attributes['aria-required'] = 'true';
  }
  
  if (element.description) {
    // In a real implementation, this would generate a unique ID
    // and link it to a description element
    attributes['aria-describedby'] = `desc-${element.id}`;
  }
  
  return attributes;
};

/**
 * Combine multiple accessibility attribute objects
 * @param attributeSets Array of attribute objects to combine
 * @returns Combined attributes object
 */
export const combineAccessibilityAttributes = (...attributeSets: Record<string, any>[]): Record<string, any> => {
  return Object.assign({}, ...attributeSets);
};
