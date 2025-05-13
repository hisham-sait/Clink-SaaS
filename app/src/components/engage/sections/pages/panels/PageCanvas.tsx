import React, { useState } from 'react';
import { Button, Col, Form, Dropdown, Overlay, Popover } from 'react-bootstrap';
import { FaCode, FaPlus } from 'react-icons/fa';

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

interface PageAppearance {
  backgroundColor: string;
  backgroundImage: string;
  backgroundType?: 'color' | 'image' | 'simpleGradient' | 'abstractGradient' | 'customGradient';
  backgroundGradient?: string;
  backgroundAttachment?: 'scroll' | 'fixed';
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
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
  // Phone silhouette properties
  usePhoneSilhouette?: boolean;
  phoneModel?: 'iphone14' | 'iphone13' | 'pixel7' | 'galaxy';
  phoneColor?: string;
  showButtons?: boolean;
  showHomeIndicator?: boolean;
}

interface PageSettings {
  showSectionWrappers?: boolean;
  showSectionTitles?: boolean;
  showSectionText?: boolean;
  showElementWrappers?: boolean;
  showElementTitles?: boolean;
  showElementDescriptions?: boolean;
  cleanView?: boolean;
}

interface PageCanvasProps {
  sections: PageSection[];
  selectedSection: PageSection;
  selectedElement: PageElement | null;
  pageAppearance: PageAppearance;
  pageSettings: PageSettings;
  onSectionSelect: (section: PageSection) => void;
  onElementSelect: (element: PageElement) => void;
  onAddSection: () => void;
  onAddElement: (type: string) => void;
  renderElementPreview: (element: PageElement) => React.ReactNode;
}

const PageCanvas: React.FC<PageCanvasProps> = ({
  sections,
  selectedSection,
  selectedElement,
  pageAppearance,
  pageSettings,
  onSectionSelect,
  onElementSelect,
  onAddSection,
  onAddElement,
  renderElementPreview
}) => {
  // State for floating action button
  const [showPopup, setShowPopup] = useState(false);
  const [showElementsPopup, setShowElementsPopup] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  // Phone silhouette settings with defaults
  const usePhoneSilhouette = pageAppearance.usePhoneSilhouette !== undefined ? pageAppearance.usePhoneSilhouette : true;
  const phoneModel = pageAppearance.phoneModel || 'iphone14';
  const phoneColor = pageAppearance.phoneColor || '#1a1a1a'; // Space black default
  const showButtons = pageAppearance.showButtons !== undefined ? pageAppearance.showButtons : true;
  const showHomeIndicator = pageAppearance.showHomeIndicator !== undefined ? pageAppearance.showHomeIndicator : true;
  // Default values for visibility settings
  const showSectionWrappers = pageSettings?.showSectionWrappers !== undefined ? pageSettings.showSectionWrappers : true;
  const showSectionTitles = pageSettings?.showSectionTitles !== undefined ? pageSettings.showSectionTitles : true;
  const showSectionText = pageSettings?.showSectionText !== undefined ? pageSettings.showSectionText : true;
  const showElementWrappers = pageSettings?.showElementWrappers !== undefined ? pageSettings.showElementWrappers : true;
  const showElementTitles = pageSettings?.showElementTitles !== undefined ? pageSettings.showElementTitles : true;
  const showElementDescriptions = pageSettings?.showElementDescriptions !== undefined ? pageSettings.showElementDescriptions : true;

  // Generate CSS for canvas based on appearance settings
  const getCanvasStyle = () => {
    // Base styles that apply in both normal and clean view
    const baseStyles: any = {
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      height: '100%'
    };
    
    // In clean view mode, only adjust padding and remove borders/shadows
    if (pageSettings.cleanView) {
      baseStyles.padding = '0';
      baseStyles.borderRadius = '0';
      baseStyles.boxShadow = 'none';
      
      // Apply background styles even in clean view
      if (pageAppearance.backgroundType === 'simpleGradient' || 
          pageAppearance.backgroundType === 'abstractGradient' || 
          pageAppearance.backgroundType === 'customGradient') {
        baseStyles.backgroundImage = pageAppearance.backgroundGradient;
        
        // Add blend mode for abstract gradients
        if (pageAppearance.backgroundType === 'abstractGradient') {
          baseStyles.backgroundBlendMode = 'overlay, color-dodge, overlay, difference, normal';
        }
      } else if (pageAppearance.backgroundType === 'image') {
        baseStyles.backgroundImage = pageAppearance.backgroundImage ? `url(${pageAppearance.backgroundImage})` : 'none';
        baseStyles.backgroundSize = pageAppearance.backgroundSize || 'cover';
        baseStyles.backgroundPosition = pageAppearance.backgroundPosition || 'center';
        baseStyles.backgroundRepeat = pageAppearance.backgroundRepeat || 'no-repeat';
      } else {
        // Default to color
        baseStyles.backgroundColor = pageAppearance.backgroundColor;
      }
      
      // Apply background attachment
      if (pageAppearance.backgroundAttachment) {
        baseStyles.backgroundAttachment = pageAppearance.backgroundAttachment;
      }
      
      return baseStyles;
    }
    
    // Base styles
    const styles: any = {
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      borderRadius: pageAppearance.borderRadius,
      boxShadow: pageAppearance.boxShadow,
      padding: pageAppearance.padding || '20px',
      height: '100%'
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
      styles.backgroundSize = pageAppearance.backgroundSize || 'cover';
      styles.backgroundPosition = pageAppearance.backgroundPosition || 'center';
      styles.backgroundRepeat = pageAppearance.backgroundRepeat || 'no-repeat';
    } else {
      // Default to color
      styles.backgroundColor = pageAppearance.backgroundColor;
    }
    
    // Apply background attachment
    if (pageAppearance.backgroundAttachment) {
      styles.backgroundAttachment = pageAppearance.backgroundAttachment;
    }
    
    return styles;
  };

  // Generate CSS for sections without background properties
  const getSectionContainerStyle = () => {
    // Base styles for sections
    const styles: any = {
      fontFamily: pageAppearance.fontFamily,
      color: pageAppearance.textColor,
      borderRadius: pageAppearance.borderRadius,
      boxShadow: pageAppearance.boxShadow,
      padding: pageSettings.cleanView ? '0' : (pageAppearance.padding || '20px'),
      backgroundColor: 'transparent', // Use transparent background for sections
    };
    
    // In clean view mode, adjust padding and remove borders/shadows
    if (pageSettings.cleanView) {
      styles.padding = '0';
      styles.borderRadius = '0';
      styles.boxShadow = 'none';
    }
    
    return styles;
  };

  const getSectionTitleStyle = () => {
    return {
      color: pageAppearance.sectionTitleColor || pageAppearance.textColor
    };
  };

  const getSectionStyle = () => {
    return {
      borderBottom: `1px solid ${pageAppearance.sectionDividerColor || '#dee2e6'}`,
      marginBottom: '15px'
    };
  };

  const getElementStyle = () => {
    return {
      marginBottom: pageAppearance.elementSpacing || '15px'
    };
  };

  const getButtonStyle = () => {
    return {
      backgroundColor: pageAppearance.primaryColor,
      borderColor: pageAppearance.primaryColor
    };
  };

  // Element types for dropdown
  const elementTypes = [
    { type: 'text', label: 'Text' },
    { type: 'image', label: 'Image' },
    { type: 'video', label: 'Video' },
    { type: 'button', label: 'Button' },
    { type: 'form', label: 'Form' },
    { type: 'survey', label: 'Survey' },
    { type: 'carousel', label: 'Carousel' },
    { type: 'wysiwyg', label: 'WYSIWYG Editor' },
    { type: 'profile', label: 'Profile' },
    { type: 'social', label: 'Social Links' },
    { type: 'instagram', label: 'Instagram' },
    { type: 'facebook', label: 'Facebook' },
    { type: 'youtube', label: 'YouTube' },
    { type: 'product', label: 'Product Data' }
  ];

  // Phone silhouette styles
  const getPhoneStyles = () => {
    // Base phone dimensions
    let dimensions = {
      width: '375px',
      height: '812px',
      borderRadius: '50px',
      homeIndicatorWidth: '134px',
      homeIndicatorHeight: '5px',
      notchWidth: '150px',
      notchHeight: '30px'
    };

    // Adjust dimensions based on model
    if (phoneModel === 'iphone13') {
      dimensions = {
        width: '375px',
        height: '812px',
        borderRadius: '45px',
        homeIndicatorWidth: '134px',
        homeIndicatorHeight: '5px',
        notchWidth: '150px',
        notchHeight: '30px'
      };
    } else if (phoneModel === 'pixel7') {
      dimensions = {
        width: '360px',
        height: '800px',
        borderRadius: '30px',
        homeIndicatorWidth: '0px',
        homeIndicatorHeight: '0px',
        notchWidth: '0px',
        notchHeight: '0px'
      };
    } else if (phoneModel === 'galaxy') {
      dimensions = {
        width: '360px',
        height: '780px',
        borderRadius: '40px',
        homeIndicatorWidth: '100px',
        homeIndicatorHeight: '3px',
        notchWidth: '0px',
        notchHeight: '0px'
      };
    }

    // Ensure max width is 800px for the container
    const containerMaxWidth = '800px';

    return {
      container: {
        position: 'relative' as const,
        width: dimensions.width,
        height: dimensions.height,
        backgroundColor: phoneColor,
        borderRadius: dimensions.borderRadius,
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
        margin: '0 auto',
        overflow: 'hidden',
        border: `10px solid ${phoneColor}`,
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'space-between' as const,
        maxWidth: containerMaxWidth
      },
      notch: {
        display: dimensions.notchWidth !== '0px' ? 'block' : 'none',
        position: 'absolute' as const,
        top: '0',
        left: '50%',
        transform: 'translateX(-50%)',
        width: dimensions.notchWidth,
        height: dimensions.notchHeight,
        backgroundColor: '#000',
        borderBottomLeftRadius: '14px',
        borderBottomRightRadius: '14px',
        zIndex: 10
      },
      screen: {
        flex: 1,
        overflow: 'auto',
        position: 'relative' as const,
        zIndex: 1,
        ...getCanvasStyle()
      },
      homeIndicator: {
        display: showHomeIndicator && dimensions.homeIndicatorHeight !== '0px' ? 'block' : 'none',
        position: 'absolute' as const,
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: dimensions.homeIndicatorWidth,
        height: dimensions.homeIndicatorHeight,
        backgroundColor: '#ffffff',
        borderRadius: '3px',
        zIndex: 10
      },
      volumeButtons: {
        display: showButtons ? 'block' : 'none',
        position: 'absolute' as const,
        left: '-15px',
        top: '100px',
        width: '5px',
        height: '100px',
        zIndex: 10
      },
      volumeUp: {
        width: '5px',
        height: '30px',
        backgroundColor: '#0a0a0a',
        borderRadius: '2px',
        marginBottom: '10px'
      },
      volumeDown: {
        width: '5px',
        height: '30px',
        backgroundColor: '#0a0a0a',
        borderRadius: '2px'
      },
      powerButton: {
        display: showButtons ? 'block' : 'none',
        position: 'absolute' as const,
        right: '-15px',
        top: '120px',
        width: '5px',
        height: '40px',
        backgroundColor: '#0a0a0a',
        borderRadius: '2px',
        zIndex: 10
      },
      contentWrapper: {
        padding: pageAppearance.padding || '20px',
        height: '100%',
        overflow: 'auto'
      }
    };
  };

  // Clean view element style
  const getCleanViewElementStyle = () => {
    if (pageSettings.cleanView) {
      return {
        border: 'none',
        boxShadow: 'none',
        backgroundColor: 'transparent',
        padding: '0',
        margin: '0 0 15px 0'
      };
    }
    return {};
  };

  return (
    <Col md={6}>
      {usePhoneSilhouette ? (
        <div className="phone-container" style={{ padding: '20px 0', position: 'relative' }}>
          {/* Floating Action Button */}
          <div 
            className="floating-action-button"
            style={{
              position: 'absolute',
              right: '20px',
              bottom: '30px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: pageAppearance.primaryColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              zIndex: 1000
            }}
            onClick={(e) => {
              setShowPopup(!showPopup);
              setTarget(e.currentTarget);
            }}
          >
            <FaPlus size={24} />
          </div>
          
          {/* Popup Menu */}
          <Overlay
            show={showPopup}
            target={target}
            placement="left"
            container={document.body}
            rootClose
            onHide={() => setShowPopup(false)}
          >
            <Popover id="popover-basic">
              <Popover.Body>
                <div className="d-flex flex-column">
                  <Button 
                    variant="outline-primary" 
                    className="mb-2"
                    onClick={() => {
                      onAddSection();
                      setShowPopup(false);
                    }}
                  >
                    Add Section
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setShowElementsPopup(true);
                      setShowPopup(false);
                    }}
                  >
                    Add Element
                  </Button>
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
          
          {/* Elements Popup */}
          <Overlay
            show={showElementsPopup}
            target={target}
            placement="left"
            container={document.body}
            rootClose
            onHide={() => setShowElementsPopup(false)}
          >
            <Popover id="popover-elements" style={{ maxWidth: '300px' }}>
              <Popover.Header>Select Element Type</Popover.Header>
              <Popover.Body>
                <div className="d-flex flex-wrap">
                  {elementTypes.map((element) => (
                    <Button 
                      key={element.type}
                      variant="outline-secondary"
                      size="sm"
                      className="m-1"
                      onClick={() => {
                        onAddElement(element.type);
                        setShowElementsPopup(false);
                      }}
                    >
                      {element.label}
                    </Button>
                  ))}
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
          
          <div className="phone-silhouette" style={getPhoneStyles().container}>
            {/* Volume Buttons */}
            <div style={getPhoneStyles().volumeButtons}>
              <div style={getPhoneStyles().volumeUp}></div>
              <div style={getPhoneStyles().volumeDown}></div>
            </div>
            
            {/* Power Button */}
            <div style={getPhoneStyles().powerButton}></div>
            
            {/* Notch */}
            <div style={getPhoneStyles().notch}></div>
            
            {/* Home Indicator */}
            <div style={getPhoneStyles().homeIndicator}></div>
            
            {/* Screen Content */}
            <div className="phone-screen" style={getPhoneStyles().screen}>
              <div style={getPhoneStyles().contentWrapper}>
          {sections.length === 0 ? (
            <div className="text-center p-5 border rounded bg-light">
              <p className="mb-0">Add a section to start building your page</p>
            </div>
          ) : (
            <div>
              {sections.map((section) => (
                <div 
                  key={section.id} 
                  className={`mb-4 ${showSectionWrappers && !pageSettings.cleanView ? 'border' : ''} ${selectedSection.id === section.id && !pageSettings.cleanView ? 'border-primary' : showSectionWrappers && !pageSettings.cleanView ? 'border-light' : ''}`}
                  onClick={() => onSectionSelect(section)}
                  style={{...getSectionContainerStyle(), padding: showSectionWrappers && !pageSettings.cleanView ? '0' : '10px 0'}}
                >
                  {showSectionWrappers && !pageSettings.cleanView && (
                    <div className="bg-light p-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0" style={getSectionTitleStyle()}>{section.title}</h5>
                        <div>
                          <Dropdown>
                            <Dropdown.Toggle 
                              variant="outline-secondary" 
                              size="sm"
                              id={`dropdown-add-element-${section.id}`}
                            >
                              <FaPlus className="me-1" /> Add Element
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              {elementTypes.map((element) => (
                                <Dropdown.Item 
                                  key={element.type}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSectionSelect(section);
                                    onAddElement(element.type);
                                  }}
                                >
                                  {element.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={showSectionWrappers && !pageSettings.cleanView ? 'p-3' : ''}>
                    {showSectionTitles && !showSectionWrappers && !pageSettings.cleanView && (
                      <h5 className="mb-2" style={getSectionTitleStyle()}>{section.title}</h5>
                    )}
                    
                    {showSectionText && section.description && !pageSettings.cleanView && (
                      <p className="text-muted" style={getSectionStyle()}>{section.description}</p>
                    )}
                    
                    {section.elements.length === 0 ? (
                      <div className="text-center p-4 border rounded bg-light">
                        <p className="mb-0">No elements yet. Click "Add Element" to start building your page.</p>
                      </div>
                    ) : (
                      <Form>
                        {section.elements.map(element => (
                          <div 
                            key={element.id} 
                            onClick={(e) => {
                              e.stopPropagation();
                              onElementSelect(element);
                            }}
                            className={`form-element-wrapper ${showElementWrappers && !pageSettings.cleanView ? 'p-2 mb-2 rounded border' : 'mb-3'} ${selectedElement?.id === element.id && !pageSettings.cleanView ? 'border-primary' : showElementWrappers && !pageSettings.cleanView ? 'border-light' : ''}`}
                            style={getElementStyle()}
                          >
                            {showElementTitles && !pageSettings.cleanView && element.label && (
                              <Form.Label className={showElementWrappers ? '' : 'mb-1'}>
                                {element.label}{element.required && <span className="text-danger">*</span>}
                              </Form.Label>
                            )}
                            
                            {showElementDescriptions && !pageSettings.cleanView && element.description && (
                              <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>
                            )}
                            
                            {/* In clean view mode, only show the element preview without any labels or borders */}
                            <div 
                              className={pageSettings.cleanView ? 'clean-view-element' : ''}
                              style={getCleanViewElementStyle()}
                            >
                              {renderElementPreview(element)}
                            </div>
                          </div>
                        ))}
                      </Form>
                    )}
                    
                    {!showSectionWrappers && !pageSettings.cleanView && (
                      <div className="mt-2 mb-3">
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="outline-secondary" 
                            size="sm"
                            id={`dropdown-add-element-inline-${section.id}`}
                          >
                            <FaPlus className="me-1" /> Add Element
                          </Dropdown.Toggle>

                          <Dropdown.Menu>
                            {elementTypes.map((element) => (
                              <Dropdown.Item 
                                key={element.type}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSectionSelect(section);
                                  onAddElement(element.type);
                                }}
                              >
                                {element.label}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="page-canvas" style={{...getCanvasStyle(), position: 'relative'}}>
          {/* Floating Action Button */}
          <div 
            className="floating-action-button"
            style={{
              position: 'absolute',
              right: '-20px',
              bottom: '30px',
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: pageAppearance.primaryColor,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
              cursor: 'pointer',
              zIndex: 1000
            }}
            onClick={(e) => {
              setShowPopup(!showPopup);
              setTarget(e.currentTarget);
            }}
          >
            <FaPlus size={24} />
          </div>
          
          {/* Popup Menu */}
          <Overlay
            show={showPopup}
            target={target}
            placement="left"
            container={document.body}
            rootClose
            onHide={() => setShowPopup(false)}
          >
            <Popover id="popover-basic">
              <Popover.Body>
                <div className="d-flex flex-column">
                  <Button 
                    variant="outline-primary" 
                    className="mb-2"
                    onClick={() => {
                      onAddSection();
                      setShowPopup(false);
                    }}
                  >
                    Add Section
                  </Button>
                  <Button 
                    variant="outline-primary"
                    onClick={() => {
                      setShowElementsPopup(true);
                      setShowPopup(false);
                    }}
                  >
                    Add Element
                  </Button>
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
          
          {/* Elements Popup */}
          <Overlay
            show={showElementsPopup}
            target={target}
            placement="left"
            container={document.body}
            rootClose
            onHide={() => setShowElementsPopup(false)}
          >
            <Popover id="popover-elements" style={{ maxWidth: '300px' }}>
              <Popover.Header>Select Element Type</Popover.Header>
              <Popover.Body>
                <div className="d-flex flex-wrap">
                  {elementTypes.map((element) => (
                    <Button 
                      key={element.type}
                      variant="outline-secondary"
                      size="sm"
                      className="m-1"
                      onClick={() => {
                        onAddElement(element.type);
                        setShowElementsPopup(false);
                      }}
                    >
                      {element.label}
                    </Button>
                  ))}
                </div>
              </Popover.Body>
            </Popover>
          </Overlay>
          
          <div className="p-4">
            {sections.length === 0 ? (
              <div className="text-center p-5 border rounded bg-light">
                <p className="mb-0">Add a section to start building your page</p>
              </div>
            ) : (
              <div>
                {sections.map((section) => (
                  <div 
                    key={section.id} 
                    className={`mb-4 ${showSectionWrappers && !pageSettings.cleanView ? 'border' : ''} ${selectedSection.id === section.id && !pageSettings.cleanView ? 'border-primary' : showSectionWrappers && !pageSettings.cleanView ? 'border-light' : ''}`}
                    onClick={() => onSectionSelect(section)}
                    style={{...getSectionContainerStyle(), padding: showSectionWrappers && !pageSettings.cleanView ? '0' : '10px 0'}}
                  >
                    {showSectionWrappers && !pageSettings.cleanView && (
                      <div className="bg-light p-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0" style={getSectionTitleStyle()}>{section.title}</h5>
                          <div>
                            <Dropdown>
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm"
                                id={`dropdown-add-element-${section.id}`}
                              >
                                <FaPlus className="me-1" /> Add Element
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                {elementTypes.map((element) => (
                                  <Dropdown.Item 
                                    key={element.type}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSectionSelect(section);
                                      onAddElement(element.type);
                                    }}
                                  >
                                    {element.label}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className={showSectionWrappers && !pageSettings.cleanView ? 'p-3' : ''}>
                      {showSectionTitles && !showSectionWrappers && !pageSettings.cleanView && (
                        <h5 className="mb-2" style={getSectionTitleStyle()}>{section.title}</h5>
                      )}
                      
                      {showSectionText && section.description && !pageSettings.cleanView && (
                        <p className="text-muted" style={getSectionStyle()}>{section.description}</p>
                      )}
                      
                      {section.elements.length === 0 ? (
                        <div className="text-center p-4 border rounded bg-light">
                          <p className="mb-0">No elements yet. Click "Add Element" to start building your page.</p>
                        </div>
                      ) : (
                        <Form>
                          {section.elements.map(element => (
                            <div 
                              key={element.id} 
                              onClick={(e) => {
                                e.stopPropagation();
                                onElementSelect(element);
                              }}
                              className={`form-element-wrapper ${showElementWrappers && !pageSettings.cleanView ? 'p-2 mb-2 rounded border' : 'mb-3'} ${selectedElement?.id === element.id && !pageSettings.cleanView ? 'border-primary' : showElementWrappers && !pageSettings.cleanView ? 'border-light' : ''}`}
                              style={getElementStyle()}
                            >
                              {showElementTitles && !pageSettings.cleanView && element.label && (
                                <Form.Label className={showElementWrappers ? '' : 'mb-1'}>
                                  {element.label}{element.required && <span className="text-danger">*</span>}
                                </Form.Label>
                              )}
                              
                              {showElementDescriptions && !pageSettings.cleanView && element.description && (
                                <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>
                              )}
                              
                              {/* In clean view mode, only show the element preview without any labels or borders */}
                              <div 
                                className={pageSettings.cleanView ? 'clean-view-element' : ''}
                                style={getCleanViewElementStyle()}
                              >
                                {renderElementPreview(element)}
                              </div>
                            </div>
                          ))}
                        </Form>
                      )}
                      
                      {!showSectionWrappers && !pageSettings.cleanView && (
                        <div className="mt-2 mb-3">
                          <Dropdown>
                            <Dropdown.Toggle 
                              variant="outline-secondary" 
                              size="sm"
                              id={`dropdown-add-element-inline-${section.id}`}
                            >
                              <FaPlus className="me-1" /> Add Element
                            </Dropdown.Toggle>

                            <Dropdown.Menu>
                              {elementTypes.map((element) => (
                                <Dropdown.Item 
                                  key={element.type}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSectionSelect(section);
                                    onAddElement(element.type);
                                  }}
                                >
                                  {element.label}
                                </Dropdown.Item>
                              ))}
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Col>
  );
};

export default PageCanvas;
