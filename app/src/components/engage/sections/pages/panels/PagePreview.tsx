import React from 'react';
import { Button, Form } from 'react-bootstrap';

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
}

interface PageAppearance {
  backgroundColor: string;
  backgroundImage: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  borderRadius: string;
  boxShadow: string;
  headerAlignment: string;
  buttonStyle: string;
  width: string;
  sectionTitleColor: string;
  sectionDividerColor: string;
  elementSpacing: string;
}

interface PagePreviewProps {
  pageTitle: string;
  sections: PageSection[];
  pageSettings: PageSettings;
  pageAppearance: PageAppearance;
}

const PagePreview: React.FC<PagePreviewProps> = ({
  pageTitle,
  sections,
  pageSettings,
  pageAppearance
}) => {
  // Generate CSS for preview based on appearance settings
  const getPreviewStyle = () => {
    return {
      backgroundColor: pageAppearance.backgroundColor,
      backgroundImage: pageAppearance.backgroundImage ? `url(${pageAppearance.backgroundImage})` : 'none',
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      borderRadius: pageAppearance.borderRadius,
      boxShadow: pageAppearance.boxShadow,
      padding: '30px',
      height: '100%'
    };
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
    const renderElementHeader = () => (
      <>
        <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
        {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
      </>
    );

    switch (element.type) {
      case 'text':
        const textElement = element as any;
        
        // Render based on text type
        if (textElement.textType === 'heading') {
          const HeadingTag = `h${textElement.headingLevel || 2}` as keyof JSX.IntrinsicElements;
          const headingStyle = {
            color: textElement.headingColor || '#212529',
            textAlign: textElement.headingAlignment || 'left',
            fontFamily: textElement.fontFamily || 'inherit',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
          } as React.CSSProperties;
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded">
                <HeadingTag style={headingStyle}>
                  {textElement.content || `Heading ${textElement.headingLevel || 2}`}
                </HeadingTag>
              </div>
            </div>
          );
        } 
        else if (textElement.textType === 'list') {
          const listStyle = {
            color: textElement.listColor || '#212529',
            fontFamily: textElement.fontFamily || 'inherit',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
          } as React.CSSProperties;
          
          const ListTag = textElement.listType === 'ordered' ? 'ol' : 'ul';
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded">
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
            color: textElement.paragraphColor || '#212529',
            textAlign: textElement.paragraphAlignment || 'left',
            fontFamily: textElement.fontFamily || 'inherit',
            lineHeight: textElement.paragraphLineHeight || '1.5',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
          } as React.CSSProperties;
          
          return (
            <div className="mb-3" style={getElementStyle()}>
              {renderElementHeader()}
              <div className="border p-2 rounded">
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
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <div className="border p-2 rounded bg-light text-center">
              <div className="py-3">
                <i className="fa fa-image fa-2x"></i>
                <p className="mb-0">Image</p>
              </div>
            </div>
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
        return (
          <div className="mb-3" style={getElementStyle()}>
            {renderElementHeader()}
            <Button variant="primary">Button</Button>
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
            <h4 style={getSectionTitleStyle()}>{section.title}</h4>
            {section.description && (
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
