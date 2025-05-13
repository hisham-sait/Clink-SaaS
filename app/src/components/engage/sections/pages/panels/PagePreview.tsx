import React, { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { renderButtonJSX } from '../../../../../components/engage/elements/button/utils/renderButtonJSX';

interface PageElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface PageSection {
  id: string;
  title: string;
  description?: string;
  elements: PageElement[];
}

interface PageSettings {
  showSubmitButton: boolean;
  submitButtonText: string;
  showResetButton: boolean;
  resetButtonText: string;
  redirectAfterSubmit: boolean;
  redirectUrl: string;
  emailNotification: boolean;
  notificationEmail: string;
  showSectionWrappers?: boolean;
  showSectionTitles?: boolean;
  showSectionText?: boolean;
  showElementWrappers?: boolean;
  showElementTitles?: boolean;
  showElementDescriptions?: boolean;
  cleanView?: boolean;
}

interface PageAppearance {
  backgroundColor: string;
  backgroundImage: string;
  backgroundType?: 'color' | 'image' | 'simpleGradient' | 'abstractGradient' | 'customGradient';
  backgroundGradient?: string;
  backgroundAttachment?: 'scroll' | 'fixed';
  backgroundBlur?: number;
  backgroundBrightness?: number;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderRadius: string;
  boxShadow: string;
  headerAlignment: string;
  buttonStyle: string;
  width: string;
  padding: string;
  sectionTitleColor: string;
  sectionDividerColor: string;
  elementSpacing: string;
  usePhoneSilhouette?: boolean;
  phoneModel?: 'iphone14' | 'iphone13' | 'pixel7' | 'galaxy';
  phoneColor?: string;
  showButtons?: boolean;
  showHomeIndicator?: boolean;
}

interface PagePreviewProps {
  pageTitle: string;
  sections: PageSection[];
  pageSettings: PageSettings;
  pageAppearance: PageAppearance;
  previewHover?: boolean;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  pageTitle,
  sections,
  pageSettings,
  pageAppearance,
  previewHover = false
}) => {
  // Generate CSS for preview based on appearance settings
  const getPreviewStyle = () => {
    // Base styles
    const styles: any = {
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      borderRadius: pageAppearance.borderRadius,
      boxShadow: pageAppearance.boxShadow,
      padding: pageAppearance.padding || '20px',
      height: '100%',
      minHeight: '500px',
      overflowY: 'auto' as const
    };
    
    // Apply background based on type
    if (pageAppearance.backgroundType === 'simpleGradient' || 
        pageAppearance.backgroundType === 'abstractGradient' || 
        pageAppearance.backgroundType === 'customGradient') {
      styles.backgroundImage = pageAppearance.backgroundGradient;
      
      // Add blend mode for abstract gradients
      if (pageAppearance.backgroundType === 'abstractGradient') {
        styles.backgroundBlendMode = 'overlay, color-dodge, overlay, difference, normal';
      }
    } else if (pageAppearance.backgroundType === 'image') {
      styles.backgroundImage = pageAppearance.backgroundImage ? `url(${pageAppearance.backgroundImage})` : 'none';
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
    } else {
      // Default to color
      styles.backgroundColor = pageAppearance.backgroundColor;
    }
    
    // Apply background attachment
    if (pageAppearance.backgroundAttachment) {
      styles.backgroundAttachment = pageAppearance.backgroundAttachment;
    }
    
    // Apply background blur
    if (pageAppearance.backgroundBlur && pageAppearance.backgroundBlur > 0) {
      styles.backdropFilter = `blur(${pageAppearance.backgroundBlur}px)`;
    }
    
    // Apply background brightness
    if (pageAppearance.backgroundBrightness && pageAppearance.backgroundBrightness !== 100) {
      const brightness = pageAppearance.backgroundBrightness / 100;
      styles.filter = `brightness(${brightness})`;
    }
    
    return styles;
  };

  const getHeaderStyle = () => {
    return {
      textAlign: pageAppearance.headerAlignment as any,
      marginBottom: '30px'
    };
  };

  const getSectionTitleStyle = () => {
    return {
      color: pageAppearance.sectionTitleColor || pageAppearance.textColor,
      marginTop: '20px',
      marginBottom: '10px'
    };
  };

  const getSectionDividerStyle = () => {
    return {
      borderBottom: `1px solid ${pageAppearance.sectionDividerColor || '#dee2e6'}`,
      marginBottom: '15px',
      paddingBottom: '5px'
    };
  };

  const getElementStyle = () => {
    return {
      marginBottom: pageAppearance.elementSpacing || '15px'
    };
  };

  const getButtonStyle = () => {
    let buttonClass = 'btn ';
    
    switch(pageAppearance.buttonStyle) {
      case 'rounded':
        buttonClass += 'rounded-pill ';
        break;
      case 'square':
        buttonClass += 'rounded-0 ';
        break;
      case 'outline':
        buttonClass += 'btn-outline-';
        return buttonClass + (pageSettings.showSubmitButton ? 'primary' : 'secondary');
      default:
        buttonClass += 'btn-';
        return buttonClass + (pageSettings.showSubmitButton ? 'primary' : 'secondary');
    }
    
    buttonClass += 'btn-';
    return buttonClass + (pageSettings.showSubmitButton ? 'primary' : 'secondary');
  };

  const renderElementPreview = (element: PageElement) => {
    const renderElementHeader = () => {
      // Skip rendering element header if clean view is enabled or element titles/descriptions are disabled
      if (pageSettings.cleanView || 
          (!pageSettings.showElementTitles && !pageSettings.showElementDescriptions)) {
        return null;
      }
      
      return (
        <>
          {pageSettings.showElementTitles !== false && (
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
          )}
          {pageSettings.showElementDescriptions !== false && element.description && (
            <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>
          )}
        </>
      );
    };

    switch (element.type) {
      case 'text':
        const textElement = element as any;
        
        // Render based on text type
        if (textElement.textType === 'heading') {
          const HeadingTag = `h${textElement.headingLevel || 2}` as keyof JSX.IntrinsicElements;
          const headingStyle = {
            // Basic properties
            color: textElement.headingColor || '#212529',
            textAlign: textElement.headingAlignment || 'left',
            fontFamily: textElement.fontFamily || 'inherit',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
            
            // Typography properties
            fontWeight: textElement.headingWeight || 'bold',
            textTransform: textElement.headingTransform || 'none',
            fontStyle: textElement.headingStyle || 'normal',
            textDecoration: textElement.headingDecoration || 'none',
            lineHeight: textElement.headingLineHeight || '1.5',
            letterSpacing: textElement.headingLetterSpacing || 'normal',
            
            // Text shadow
            textShadow: (textElement.headingTextShadow && textElement.headingTextShadow !== 'none') ? 
              `${textElement.headingTextShadowOffsetX || '1px'} ${textElement.headingTextShadowOffsetY || '1px'} ${textElement.headingTextShadowBlur || '2px'} ${textElement.headingTextShadowColor || 'rgba(0,0,0,0.3)'}` : 'none',
            
            // Border properties
            border: textElement.border || 'none',
            borderColor: textElement.borderColor || '#dee2e6',
            borderWidth: textElement.borderWidth || '1px',
            borderStyle: textElement.borderStyle || 'solid',
            
            // Advanced styling
            boxShadow: textElement.boxShadow || 'none',
            opacity: textElement.opacity || 1,
            overflow: textElement.overflow || 'visible',
            wordBreak: textElement.wordBreak || 'normal',
            wordWrap: textElement.wordWrap || 'normal',
          } as React.CSSProperties;
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded" style={{ backgroundColor: 'transparent' }}>
                <HeadingTag style={headingStyle}>
                  {textElement.content || `Heading ${textElement.headingLevel || 2}`}
                </HeadingTag>
              </div>
            </div>
          );
        } 
        else if (textElement.textType === 'list') {
          const listStyle = {
            // Basic properties
            color: textElement.listColor || '#212529',
            fontFamily: textElement.fontFamily || 'inherit',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
            
            // Typography properties
            fontWeight: textElement.listWeight || 'normal',
            textTransform: textElement.listTransform || 'none',
            fontStyle: textElement.listStyle2 || 'normal',
            textDecoration: textElement.listDecoration || 'none',
            lineHeight: textElement.listLineHeight || '1.5',
            letterSpacing: textElement.listLetterSpacing || 'normal',
            
            // List specific properties
            listStyleType: textElement.listStyle || (textElement.listType === 'ordered' ? 'decimal' : 'disc'),
            listStylePosition: 'inside',
            
            // Text shadow
            textShadow: (textElement.listTextShadow && textElement.listTextShadow !== 'none') ? 
              `${textElement.listTextShadowOffsetX || '1px'} ${textElement.listTextShadowOffsetY || '1px'} ${textElement.listTextShadowBlur || '2px'} ${textElement.listTextShadowColor || 'rgba(0,0,0,0.3)'}` : 'none',
            
            // Border properties
            border: textElement.border || 'none',
            borderColor: textElement.borderColor || '#dee2e6',
            borderWidth: textElement.borderWidth || '1px',
            borderStyle: textElement.borderStyle || 'solid',
            
            // Advanced styling
            boxShadow: textElement.boxShadow || 'none',
            opacity: textElement.opacity || 1,
            overflow: textElement.overflow || 'visible',
            wordBreak: textElement.wordBreak || 'normal',
            wordWrap: textElement.wordWrap || 'normal',
          } as React.CSSProperties;
          
          const ListTag = textElement.listType === 'ordered' ? 'ol' : 'ul';
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded" style={{ backgroundColor: 'transparent' }}>
                <ListTag style={listStyle}>
                  {(textElement.listItems || ['Item 1', 'Item 2', 'Item 3']).map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ListTag>
              </div>
            </div>
          );
        } 
        else { // Default to paragraph
          const paragraphStyle = {
            // Basic properties
            color: textElement.paragraphColor || '#212529',
            textAlign: textElement.paragraphAlignment || 'left',
            fontFamily: textElement.fontFamily || 'inherit',
            lineHeight: textElement.paragraphLineHeight || '1.5',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
            
            // Typography properties
            fontWeight: textElement.paragraphWeight || 'normal',
            textTransform: textElement.paragraphTransform || 'none',
            fontStyle: textElement.paragraphStyle || 'normal',
            textDecoration: textElement.paragraphDecoration || 'none',
            letterSpacing: textElement.paragraphLetterSpacing || 'normal',
            textIndent: textElement.paragraphIndent || '0',
            
            // Text shadow
            textShadow: (textElement.paragraphTextShadow && textElement.paragraphTextShadow !== 'none') ? 
              `${textElement.paragraphTextShadowOffsetX || '1px'} ${textElement.paragraphTextShadowOffsetY || '1px'} ${textElement.paragraphTextShadowBlur || '2px'} ${textElement.paragraphTextShadowColor || 'rgba(0,0,0,0.3)'}` : 'none',
            
            // Border properties
            border: textElement.border || 'none',
            borderColor: textElement.borderColor || '#dee2e6',
            borderWidth: textElement.borderWidth || '1px',
            borderStyle: textElement.borderStyle || 'solid',
            
            // Advanced styling
            boxShadow: textElement.boxShadow || 'none',
            opacity: textElement.opacity || 1,
            overflow: textElement.overflow || 'visible',
            wordBreak: textElement.wordBreak || 'normal',
            wordWrap: textElement.wordWrap || 'normal',
          } as React.CSSProperties;
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded" style={{ backgroundColor: 'transparent' }}>
                <p style={paragraphStyle}>
                  {textElement.content || 'Paragraph text content goes here. This is a preview of how your paragraph will look.'}
                </p>
              </div>
            </div>
          );
        }
      case 'textarea':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <Form.Control as="textarea" rows={3} placeholder={element.placeholder} />
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            {element.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="checkbox"
                id={`${element.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            {element.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="radio"
                name={element.id}
                id={`${element.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'select':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <Form.Select>
              <option value="">Select an option</option>
              {element.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case 'date':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <Form.Control type="date" />
          </Form.Group>
        );
      case 'file':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <Form.Control type="file" />
          </Form.Group>
        );
      case 'image':
        const imageElement = element as any;
        // Get image styling properties
        const getImageStyle = () => {
          const styles: React.CSSProperties = {
            maxWidth: '100%',
            maxHeight: '300px',
            objectFit: (imageElement.objectFit || 'cover') as any,
            width: imageElement.width || '100%',
            height: imageElement.height || 'auto',
            display: 'block',
            margin: imageElement.alignment === 'center' ? '0 auto' : 
                   imageElement.alignment === 'right' ? '0 0 0 auto' : '0',
          };
          
          // Add filter effects if available
          const filters = [];
          if (imageElement.brightness !== undefined && imageElement.brightness !== 100) {
            filters.push(`brightness(${imageElement.brightness}%)`);
          }
          if (imageElement.contrast !== undefined && imageElement.contrast !== 100) {
            filters.push(`contrast(${imageElement.contrast}%)`);
          }
          if (imageElement.saturation !== undefined && imageElement.saturation !== 100) {
            filters.push(`saturate(${imageElement.saturation}%)`);
          }
          if (imageElement.hueRotate !== undefined && imageElement.hueRotate !== 0) {
            filters.push(`hue-rotate(${imageElement.hueRotate}deg)`);
          }
          if (imageElement.blur !== undefined && imageElement.blur !== '0px') {
            filters.push(`blur(${imageElement.blur})`);
          }
          if (imageElement.grayscale !== undefined && imageElement.grayscale !== 0) {
            filters.push(`grayscale(${imageElement.grayscale}%)`);
          }
          if (imageElement.sepia !== undefined && imageElement.sepia !== 0) {
            filters.push(`sepia(${imageElement.sepia}%)`);
          }
          if (imageElement.opacity !== undefined && imageElement.opacity !== 1) {
            filters.push(`opacity(${imageElement.opacity})`);
          }
          
          if (filters.length > 0) {
            styles.filter = filters.join(' ');
          }
          
          return styles;
        };
        
        // Get container styling properties
        const getContainerStyle = () => {
          const styles: React.CSSProperties = {
            position: 'relative',
            backgroundColor: imageElement.backgroundColor || 'transparent',
            borderRadius: imageElement.borderRadius || '0',
            padding: imageElement.padding || '0',
            margin: imageElement.margin || '0',
            overflow: 'hidden',
          };
          
          // Add border if not none
          if (imageElement.borderStyle && imageElement.borderStyle !== 'none') {
            styles.border = `${imageElement.borderWidth || '1px'} ${imageElement.borderStyle || 'solid'} ${imageElement.borderColor || '#dee2e6'}`;
          }
          
          // Add box shadow if not none
          if (imageElement.boxShadow && imageElement.boxShadow !== 'none') {
            const color = imageElement.boxShadowColor || 'rgba(0,0,0,0.2)';
            const blur = imageElement.boxShadowBlur || '10px';
            const spread = imageElement.boxShadowSpread || '0';
            const offsetX = imageElement.boxShadowOffsetX || '0';
            const offsetY = imageElement.boxShadowOffsetY || '4px';
            
            styles.boxShadow = `${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
          }
          
          return styles;
        };
        
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            {(imageElement.src || imageElement.imageUrl || imageElement.thumbnailUrl) ? (
              <div className="border p-2 rounded text-center">
                <div style={getContainerStyle()}>
                  <img 
                    src={imageElement.imageUrl || imageElement.src || imageElement.thumbnailUrl} 
                    alt={imageElement.imageAlt || imageElement.alt || 'Image'} 
                    className="img-fluid" 
                    style={getImageStyle()}
                  />
                  
                  {/* Render overlay if enabled */}
                  {imageElement.overlay && (
                    <div 
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: imageElement.overlayPosition?.includes('top') ? 'flex-start' : 
                                    imageElement.overlayPosition?.includes('bottom') ? 'flex-end' : 'center',
                        justifyContent: imageElement.overlayPosition?.includes('left') ? 'flex-start' : 
                                        imageElement.overlayPosition?.includes('right') ? 'flex-end' : 'center',
                        backgroundColor: imageElement.overlayColor || 'rgba(0,0,0,0.5)',
                        opacity: imageElement.overlayOpacity || 0.5,
                        color: '#ffffff',
                        textAlign: 'center',
                        padding: '10px',
                      }}
                    >
                      {imageElement.overlayText && (
                        <span style={{
                          color: imageElement.overlayTextColor || '#ffffff',
                          fontSize: imageElement.overlayTextSize || '1rem',
                          textAlign: 'center',
                          padding: '5px',
                        }}>
                          {imageElement.overlayText}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                {imageElement.caption && (
                  <div className="mt-2 text-muted small">
                    {imageElement.caption}
                  </div>
                )}
              </div>
            ) : (
              <div className="border p-2 rounded bg-light text-center">
                <div className="py-3">
                  <i className="fa fa-image fa-2x"></i>
                  <p className="mb-0">No image selected</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'video':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-3">
                <i className="fa fa-video fa-2x"></i>
                <p className="mb-0">Embedded Video</p>
              </div>
            </div>
          </div>
        );
      case 'button':
        const buttonElement = element as import('../../../../../components/engage/elements').ButtonElementData;
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded">
              {renderButtonJSX(buttonElement, previewHover)}
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light">
              <p className="mb-0">Embedded Form</p>
              <Button variant="outline-secondary" size="sm" className="mt-1">Select Form</Button>
            </div>
          </div>
        );
      case 'survey':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light">
              <p className="mb-0">Embedded Survey</p>
              <Button variant="outline-secondary" size="sm" className="mt-1">Select Survey</Button>
            </div>
          </div>
        );
      case 'carousel':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-3">
                <i className="fa fa-images fa-2x"></i>
                <p className="mb-0">Image/Video Carousel</p>
              </div>
            </div>
          </div>
        );
      case 'wysiwyg':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light">
              <p className="mb-0">WYSIWYG Editor</p>
              <div className="btn-toolbar mt-1">
                <Button variant="outline-secondary" size="sm" className="me-1">B</Button>
                <Button variant="outline-secondary" size="sm" className="me-1">I</Button>
                <Button variant="outline-secondary" size="sm">U</Button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light d-flex align-items-center">
              <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-2" style={{ width: '40px', height: '40px' }}>
                <i className="fa fa-user"></i>
              </div>
              <div>
                <p className="mb-0">User Profile</p>
              </div>
            </div>
          </div>
        );
      case 'social':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light">
              <p className="mb-0">Social Media Links</p>
              <div className="mt-1">
                <i className="fa fa-facebook me-2"></i>
                <i className="fa fa-twitter me-2"></i>
                <i className="fa fa-instagram me-2"></i>
                <i className="fa fa-linkedin"></i>
              </div>
            </div>
          </div>
        );
      case 'instagram':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-2">
                <i className="fa fa-instagram fa-2x"></i>
                <p className="mb-0">Instagram Embed</p>
              </div>
            </div>
          </div>
        );
      case 'facebook':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-2">
                <i className="fa fa-facebook fa-2x"></i>
                <p className="mb-0">Facebook Embed</p>
              </div>
            </div>
          </div>
        );
      case 'youtube':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-2">
                <i className="fa fa-youtube fa-2x"></i>
                <p className="mb-0">YouTube Embed</p>
              </div>
            </div>
          </div>
        );
      case 'product':
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light">
              <p className="mb-0">Product Data</p>
              <Button variant="outline-secondary" size="sm" className="mt-1">Select Product</Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <p className="text-muted">[{element.type} element]</p>
          </div>
        );
    }
  };

  return (
    <div className="p-4" style={getPreviewStyle()}>
      <div style={getHeaderStyle()}>
        <h3>{pageTitle}</h3>
      </div>
      <Form>
        {sections.map(section => (
          <div key={section.id} className="page-section mb-4">
            {/* Only show section title if not in clean view and section titles are enabled */}
            {!pageSettings.cleanView && pageSettings.showSectionTitles !== false && (
              <h4 style={getSectionTitleStyle()}>{section.title}</h4>
            )}
            
            {/* Only show section description if not in clean view and section text is enabled */}
            {!pageSettings.cleanView && pageSettings.showSectionText !== false && section.description && (
              <p className="text-muted" style={getSectionDividerStyle()}>{section.description}</p>
            )}
            
            {section.elements.map(element => (
              <div key={element.id}>
                {renderElementPreview(element)}
              </div>
            ))}
          </div>
        ))}
        <div className="mt-4" style={{ textAlign: pageAppearance.headerAlignment as any }}>
          {pageSettings.showSubmitButton && (
            <Button 
              className={getButtonStyle()} 
              style={{ 
                backgroundColor: pageAppearance.primaryColor, 
                borderColor: pageAppearance.primaryColor 
              }}
            >
              {pageSettings.submitButtonText}
            </Button>
          )}
          {pageSettings.showResetButton && (
            <Button 
              variant="outline-secondary" 
              className="ms-2"
            >
              {pageSettings.resetButtonText}
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
};

export default PagePreview;
