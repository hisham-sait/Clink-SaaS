import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Col, Alert, Button, Spinner, Accordion, Form } from 'react-bootstrap';
import { FaSave, FaEye, FaArrowLeft, FaPlus, FaSlidersH, FaPalette, FaTrash, FaArrowUp, FaArrowDown, FaCog, FaMousePointer } from 'react-icons/fa';
import { PagesService } from '../../../../services/engage';
import { renderButtonJSX } from '../../../../components/engage/elements/button/utils/renderButtonJSX';
import { renderProfileJSX } from '../../../../components/engage/elements/profile/utils/renderProfileJSX';
import { renderSocialJSX } from '../../../../components/engage/elements/social/utils/renderSocialJSX';

// Import panel components
import { 
  PageElementsPanel, 
  PageCanvas, 
  PagePropertiesPanel, 
  ElementPropertiesPanel,
  PageAppearanceSettings
} from './panels';

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

const PageDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { pageId } = useParams<{ pageId: string }>();
  const [pageTitle, setPageTitle] = useState('New Page');
  const [sections, setSections] = useState<PageSection[]>([
    {
      id: 'section-1',
      title: 'Default Section',
      description: 'This is the default section of your page.',
      elements: []
    }
  ]);
  const [selectedSection, setSelectedSection] = useState<PageSection>(sections[0]);
  const [selectedElement, setSelectedElement] = useState<PageElement | null>(null);
  const [previewHover, setPreviewHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageSettings, setPageSettings] = useState({
    showSubmitButton: false,
    submitButtonText: 'Submit',
    showResetButton: false,
    resetButtonText: 'Reset',
    redirectAfterSubmit: false,
    redirectUrl: '',
    emailNotification: false,
    notificationEmail: '',
    footerText: '',
    // Visibility toggle settings
    showSectionWrappers: true,
    showSectionTitles: true,
    showSectionText: true,
    showElementWrappers: true,
    showElementTitles: true,
    showElementDescriptions: true,
    // Clean view toggle (hides all structure elements)
    cleanView: false
  });
  
  // Store original visibility settings when toggling clean view
  const [originalVisibilitySettings, setOriginalVisibilitySettings] = useState({
    showSectionWrappers: true,
    showSectionTitles: true,
    showSectionText: true,
    showElementWrappers: true,
    showElementTitles: true,
    showElementDescriptions: true
  });
  
  // Define the PageAppearance interface to match the one in PageCanvas
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
    // Phone silhouette properties
    usePhoneSilhouette?: boolean;
    phoneModel?: 'iphone14' | 'iphone13' | 'pixel7' | 'galaxy';
    phoneColor?: string;
    showButtons?: boolean;
    showHomeIndicator?: boolean;
  }

  // Page appearance state
  const [pageAppearance, setPageAppearance] = useState<PageAppearance>({
    backgroundColor: '#ffffff',
    backgroundImage: '',
    fontFamily: 'Arial, sans-serif',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    textColor: '#212529',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
    headerAlignment: 'center',
    buttonStyle: 'default',
    width: '800px',
    padding: '20px',
    sectionTitleColor: '#343a40',
    sectionDividerColor: '#dee2e6',
    elementSpacing: '15px',
    usePhoneSilhouette: true,
    phoneModel: 'iphone14',
    phoneColor: '#1a1a1a',
    showButtons: true,
    showHomeIndicator: true
  });

  // Load page data if editing an existing page
  useEffect(() => {
    if (pageId && pageId !== 'new') {
      const fetchPageData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const page = await PagesService.getPageById(pageId);
          
          setPageTitle(page.title);
          
          // Handle sections if they exist in settings or directly in the page
          if (page.settings && page.settings.sections) {
            setSections(page.settings.sections);
            if (page.settings.sections.length > 0) {
              setSelectedSection(page.settings.sections[0]);
            }
          } else if (page.sections && page.sections.length > 0) {
            // Use sections directly from the page
            setSections(page.sections);
            setSelectedSection(page.sections[0]);
          } else {
            // No sections or elements found, use default
            const defaultSection = {
              id: 'section-1',
              title: 'Default Section',
              description: 'This is the default section of your page.',
              elements: []
            };
            setSections([defaultSection]);
            setSelectedSection(defaultSection);
          }
          
          // Merge default settings with loaded settings
          setPageSettings({
            ...pageSettings,
            ...page.settings,
            // Ensure visibility settings have defaults if not present
            showSectionWrappers: page.settings?.showSectionWrappers !== undefined ? page.settings.showSectionWrappers : true,
            showSectionTitles: page.settings?.showSectionTitles !== undefined ? page.settings.showSectionTitles : true,
            showSectionText: page.settings?.showSectionText !== undefined ? page.settings.showSectionText : true,
            showElementWrappers: page.settings?.showElementWrappers !== undefined ? page.settings.showElementWrappers : true,
            showElementTitles: page.settings?.showElementTitles !== undefined ? page.settings.showElementTitles : true,
            showElementDescriptions: page.settings?.showElementDescriptions !== undefined ? page.settings.showElementDescriptions : true
          });
          
          // Load appearance settings if they exist
          if (page.appearance) {
            // Ensure all appearance properties have default values if not present
            const appearance: PageAppearance = {
              ...pageAppearance,
              ...page.appearance,
              width: page.appearance.width || '800px',
              sectionTitleColor: page.appearance.sectionTitleColor || '#343a40',
              sectionDividerColor: page.appearance.sectionDividerColor || '#dee2e6',
              elementSpacing: page.appearance.elementSpacing || '15px',
              // Phone silhouette properties with defaults
              usePhoneSilhouette: page.appearance.usePhoneSilhouette !== undefined ? page.appearance.usePhoneSilhouette : true,
              phoneModel: (page.appearance.phoneModel as 'iphone14' | 'iphone13' | 'pixel7' | 'galaxy') || 'iphone14',
              phoneColor: page.appearance.phoneColor || '#1a1a1a',
              showButtons: page.appearance.showButtons !== undefined ? page.appearance.showButtons : true,
              showHomeIndicator: page.appearance.showHomeIndicator !== undefined ? page.appearance.showHomeIndicator : true
            };
            setPageAppearance(appearance);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading page:', error);
          setError('Failed to load page data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchPageData();
    }
  }, [pageId]);

  const handleAddElement = (type: string) => {
    if (!selectedSection) return;

    const newElement: PageElement = {
      id: `element-${Date.now()}`,
      type,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      placeholder: 'Enter value',
      required: false,
      options: type === 'radio' || type === 'select' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined
    };

    const updatedSection = {
      ...selectedSection,
      elements: [...selectedSection.elements, newElement]
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
    setSelectedElement(newElement);
  };

  const handleAddSection = () => {
    const newSection: PageSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      elements: []
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection);
    setSelectedElement(null);
  };

  const handleSectionSelect = (section: PageSection) => {
    setSelectedSection(section);
    setSelectedElement(null);
  };

  const handleElementSelect = (element: PageElement) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedElement) return;

    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    // Handle special case for the entire element update
    if (name === 'element' && typeof value === 'object') {
      console.log('PageDesigner: Updating entire element:', value);
      
      // Use the provided element object directly
      const updatedElement = value as PageElement;
      
      setSelectedElement(updatedElement);
      
      const updatedSection = {
        ...selectedSection,
        elements: selectedSection.elements.map(el => el.id === updatedElement.id ? updatedElement : el)
      };

      setSections(sections.map(section => 
        section.id === selectedSection.id ? updatedSection : section
      ));
      setSelectedSection(updatedSection);
      
      // Force a re-render to ensure UI updates
      setTimeout(() => {
        console.log('Element update in PageDesigner should be complete now');
      }, 0);
      
      return;
    }
    
    // Handle normal property updates
    const updatedElement = {
      ...selectedElement,
      [name]: type === 'checkbox' ? checked : value
    };

    setSelectedElement(updatedElement);
    
    const updatedSection = {
      ...selectedSection,
      elements: selectedSection.elements.map(el => el.id === updatedElement.id ? updatedElement : el)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleSectionUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedSection) return;

    const { name, value } = e.target;
    
    const updatedSection = {
      ...selectedSection,
      [name]: value
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleOptionChange = (index: number, value: string) => {
    if (!selectedElement || !selectedElement.options) return;

    const newOptions = [...selectedElement.options];
    newOptions[index] = value;

    const updatedElement = {
      ...selectedElement,
      options: newOptions
    };

    setSelectedElement(updatedElement);
    
    const updatedSection = {
      ...selectedSection,
      elements: selectedSection.elements.map(el => el.id === updatedElement.id ? updatedElement : el)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleAddOption = () => {
    if (!selectedElement || !selectedElement.options) return;

    const updatedElement = {
      ...selectedElement,
      options: [...selectedElement.options, `Option ${selectedElement.options.length + 1}`]
    };

    setSelectedElement(updatedElement);
    
    const updatedSection = {
      ...selectedSection,
      elements: selectedSection.elements.map(el => el.id === updatedElement.id ? updatedElement : el)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleRemoveOption = (index: number) => {
    if (!selectedElement || !selectedElement.options) return;

    const newOptions = [...selectedElement.options];
    newOptions.splice(index, 1);

    const updatedElement = {
      ...selectedElement,
      options: newOptions
    };

    setSelectedElement(updatedElement);
    
    const updatedSection = {
      ...selectedSection,
      elements: selectedSection.elements.map(el => el.id === updatedElement.id ? updatedElement : el)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleDeleteElement = () => {
    if (!selectedElement) return;

    const updatedSection = {
      ...selectedSection,
      elements: selectedSection.elements.filter(el => el.id !== selectedElement.id)
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
    setSelectedElement(null);
  };

  const handleDeleteSection = () => {
    if (sections.length <= 1) return; // Don't delete the last section

    const sectionIndex = sections.findIndex(s => s.id === selectedSection.id);
    const newSections = sections.filter(s => s.id !== selectedSection.id);
    
    setSections(newSections);
    setSelectedSection(newSections[Math.min(sectionIndex, newSections.length - 1)]);
    setSelectedElement(null);
  };

  const handleMoveElement = (direction: 'up' | 'down') => {
    if (!selectedElement) return;

    const currentIndex = selectedSection.elements.findIndex(el => el.id === selectedElement.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === selectedSection.elements.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newElements = [...selectedSection.elements];
    const [removed] = newElements.splice(currentIndex, 1);
    newElements.splice(newIndex, 0, removed);

    const updatedSection = {
      ...selectedSection,
      elements: newElements
    };

    setSections(sections.map(section => 
      section.id === selectedSection.id ? updatedSection : section
    ));
    setSelectedSection(updatedSection);
  };

  const handleMoveSection = (direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === selectedSection.id);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...sections];
    const [removed] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, removed);

    setSections(newSections);
  };

  // New function to handle element movement by ID
  const handleMoveElementById = (elementId: string, direction: 'up' | 'down') => {
    // Find the section that contains the element
    const sectionWithElement = sections.find(section => 
      section.elements.some(el => el.id === elementId)
    );
    
    if (!sectionWithElement) return;
    
    const currentIndex = sectionWithElement.elements.findIndex(el => el.id === elementId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sectionWithElement.elements.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newElements = [...sectionWithElement.elements];
    const [removed] = newElements.splice(currentIndex, 1);
    newElements.splice(newIndex, 0, removed);

    const updatedSection = {
      ...sectionWithElement,
      elements: newElements
    };

    setSections(sections.map(section => 
      section.id === sectionWithElement.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithElement.id) {
      setSelectedSection(updatedSection);
    }
  };

  // New function to handle section movement by ID
  const handleMoveSectionById = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newSections = [...sections];
    const [removed] = newSections.splice(currentIndex, 1);
    newSections.splice(newIndex, 0, removed);

    setSections(newSections);
    
    // Update selectedSection if it's the one being moved
    if (selectedSection.id === sectionId) {
      setSelectedSection(newSections[newIndex]);
    }
  };

  // New function to clone an element
  const handleCloneElement = (elementId: string) => {
    // Find the section that contains the element
    const sectionWithElement = sections.find(section => 
      section.elements.some(el => el.id === elementId)
    );
    
    if (!sectionWithElement) return;
    
    const elementToClone = sectionWithElement.elements.find(el => el.id === elementId);
    if (!elementToClone) return;

    // Create a deep copy of the element
    const clonedElement: PageElement = {
      ...JSON.parse(JSON.stringify(elementToClone)),
      id: `element-${Date.now()}`, // Generate new unique ID
      label: `${elementToClone.label} (Copy)` // Append (Copy) to the label
    };

    // Find the index of the original element
    const elementIndex = sectionWithElement.elements.findIndex(el => el.id === elementId);
    
    // Insert the cloned element after the original
    const newElements = [...sectionWithElement.elements];
    newElements.splice(elementIndex + 1, 0, clonedElement);
    
    const updatedSection = {
      ...sectionWithElement,
      elements: newElements
    };

    setSections(sections.map(section => 
      section.id === sectionWithElement.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithElement.id) {
      setSelectedSection(updatedSection);
    }
    
    // Select the new element
    setSelectedElement(clonedElement);
  };

  // New function to clone a section
  const handleCloneSection = (sectionId: string) => {
    const sectionToClone = sections.find(s => s.id === sectionId);
    if (!sectionToClone) return;

    // Create a deep copy of the section
    const clonedSection: PageSection = {
      ...JSON.parse(JSON.stringify(sectionToClone)),
      id: `section-${Date.now()}`, // Generate new unique ID
      title: `${sectionToClone.title} (Copy)`, // Append (Copy) to the title
      elements: sectionToClone.elements.map(el => ({
        ...el,
        id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` // Generate new unique IDs for all elements
      }))
    };

    // Find the index of the original section
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    
    // Insert the cloned section after the original
    const newSections = [...sections];
    newSections.splice(sectionIndex + 1, 0, clonedSection);
    
    setSections(newSections);
    setSelectedSection(clonedSection); // Select the new section
    setSelectedElement(null);
  };

  // New function to delete an element by ID
  const handleDeleteElementById = (elementId: string) => {
    // Find the section that contains the element
    const sectionWithElement = sections.find(section => 
      section.elements.some(el => el.id === elementId)
    );
    
    if (!sectionWithElement) return;
    
    const updatedSection = {
      ...sectionWithElement,
      elements: sectionWithElement.elements.filter(el => el.id !== elementId)
    };

    setSections(sections.map(section => 
      section.id === sectionWithElement.id ? updatedSection : section
    ));
    
    // Update selectedSection if it's the one being modified
    if (selectedSection.id === sectionWithElement.id) {
      setSelectedSection(updatedSection);
    }
    
    // Clear selectedElement if it's the one being deleted
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  };

  // New function to delete a section by ID
  const handleDeleteSectionById = (sectionId: string) => {
    if (sections.length <= 1) return; // Don't delete the last section

    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    const newSections = sections.filter(s => s.id !== sectionId);
    
    setSections(newSections);
    
    // Update selectedSection if it's the one being deleted
    if (selectedSection.id === sectionId) {
      setSelectedSection(newSections[Math.min(sectionIndex, newSections.length - 1)]);
      setSelectedElement(null);
    }
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    
    setPageSettings({
      ...pageSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handler for appearance changes
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setPageAppearance({
      ...pageAppearance,
      [name]: value
    });
  };

  // Handler for visibility toggle changes
  const handleToggleVisibility = (setting: string, value: boolean) => {
    setPageSettings({
      ...pageSettings,
      [setting]: value
    });
  };
  
  // Toggle clean view (hide/show all structure elements)
  const toggleCleanView = () => {
    if (!pageSettings.cleanView) {
      // Save current visibility settings before enabling clean view
      setOriginalVisibilitySettings({
        showSectionWrappers: pageSettings.showSectionWrappers,
        showSectionTitles: pageSettings.showSectionTitles,
        showSectionText: pageSettings.showSectionText,
        showElementWrappers: pageSettings.showElementWrappers,
        showElementTitles: pageSettings.showElementTitles,
        showElementDescriptions: pageSettings.showElementDescriptions
      });
      
      // Hide all structure elements
      setPageSettings({
        ...pageSettings,
        showSectionWrappers: false,
        showSectionTitles: false,
        showSectionText: false,
        showElementWrappers: false,
        showElementTitles: false,
        showElementDescriptions: false,
        cleanView: true
      });
    } else {
      // Restore original visibility settings
      setPageSettings({
        ...pageSettings,
        ...originalVisibilitySettings,
        cleanView: false
      });
    }
  };

  const handleSavePage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure section titles and descriptions are properly set
      const processedSections = sections.map(section => ({
        ...section,
        title: section.title || 'Untitled Section',
        description: section.description || '',
        elements: section.elements.map(el => ({
          ...el,
          label: el.label || 'Untitled Element',
          description: el.description || ''
        }))
      }));
      
      // Convert sections format to elements format for backward compatibility
      // This is needed because the backend expects 'elements' but we're using 'sections'
      const elements = processedSections.length === 1 
        ? processedSections[0].elements 
        : processedSections.flatMap(section => section.elements);
      
      // Store sections in settings
      const updatedSettings = {
        ...pageSettings,
        sections: processedSections
      };
      
      const pageData: any = {
        title: pageTitle,
        sections: processedSections, // Include sections directly in the pageData
        settings: updatedSettings,
        appearance: pageAppearance // Include appearance settings
      };
      
      console.log('Saving page data:', JSON.stringify(pageData, null, 2));
      
      if (pageId && pageId !== 'new') {
        // Update existing page
        await PagesService.updatePage(pageId, pageData);
      } else {
        // Create new page
        const newPage = await PagesService.createPage(pageData);
        // Optionally redirect to the edit page for the new page
        navigate(`/engage/pages/designer/${newPage.id}`);
        return; // Return early to prevent the navigate below
      }
      
      setLoading(false);
      navigate('/engage/pages');
    } catch (error) {
      console.error('Error saving page:', error);
      setError('Failed to save page. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/engage/pages');
  };

  // Function to get element style
  const getElementStyle = () => {
    return {
      marginBottom: pageAppearance.elementSpacing || '15px'
    };
  };

  // Function to render element preview for the canvas
  const renderElementPreview = (element: PageElement) => {
    const renderElementHeader = () => {
      // Don't render element header in clean view mode
      if (pageSettings.cleanView) return null;
      
      return (
        <>
          <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
          {element.description && <div className="form-text mb-1">{element.description}</div>}
        </>
      );
    };

    switch (element.type) {
      case 'text':
        const textElement = element as unknown as import('../../../../components/engage/elements').TextElementData;
        
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
            fontSize: textElement.fontSize || textElement.headingSize || '1.75rem',
            fontWeight: textElement.headingWeight || 'bold',
            textTransform: textElement.headingTransform || 'none',
            fontStyle: textElement.headingStyle || 'normal',
            textDecoration: textElement.headingDecoration || 'none',
            lineHeight: textElement.headingLineHeight || '1.5',
            letterSpacing: textElement.headingLetterSpacing || 'normal',
            
            // Text shadow
            textShadow: textElement.headingTextShadow !== 'none' ? 
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
            <div className="mb-3">
              {renderElementHeader()}
              <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
                <HeadingTag style={headingStyle}>
                  {textElement.content || `Heading ${textElement.headingLevel || 2}`}
                </HeadingTag>
              </div>
            </div>
          );
        } else if (textElement.textType === 'list') {
          const listStyle = {
            // Basic properties
            color: textElement.listColor || '#212529',
            fontFamily: textElement.fontFamily || 'inherit',
            margin: textElement.margin || '0 0 1rem 0',
            padding: textElement.padding || '0',
            backgroundColor: textElement.backgroundColor || 'transparent',
            borderRadius: textElement.borderRadius || '0',
            
            // Typography properties
            fontSize: textElement.fontSize || textElement.listSize || '1rem',
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
            textShadow: textElement.listTextShadow !== 'none' ? 
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
            <div className="mb-3">
              {renderElementHeader()}
              <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
                <ListTag style={listStyle}>
                  {(textElement.listItems || ['Item 1', 'Item 2', 'Item 3']).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ListTag>
              </div>
            </div>
          );
        } else { // Default to paragraph
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
            fontSize: textElement.fontSize || textElement.paragraphSize || '1rem',
            fontWeight: textElement.paragraphWeight || 'normal',
            textTransform: textElement.paragraphTransform || 'none',
            fontStyle: textElement.paragraphStyle || 'normal',
            textDecoration: textElement.paragraphDecoration || 'none',
            letterSpacing: textElement.paragraphLetterSpacing || 'normal',
            textIndent: textElement.paragraphIndent || '0',
            
            // Text shadow
            textShadow: textElement.paragraphTextShadow !== 'none' ? 
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
            <div className="mb-3">
              {renderElementHeader()}
              <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
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
          <div className="mb-3">
            {renderElementHeader()}
            {(imageElement.src || imageElement.imageUrl || imageElement.thumbnailUrl) ? (
              <div className={pageSettings.cleanView ? 'text-center' : 'border p-2 rounded text-center'}>
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
              <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
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
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
              <div className="py-3">
                <i className="fa fa-video fa-2x"></i>
                <p className="mb-0">Embedded Video</p>
              </div>
            </div>
          </div>
        );
      case 'button':
        const buttonElement = element as import('../../../../components/engage/elements').ButtonElementData;
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
              {renderButtonJSX(buttonElement, previewHover)}
            </div>
          </div>
        );
      case 'form':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light' : 'border p-2 rounded bg-light'}>
              <p className="mb-0">Embedded Form</p>
              <button className="btn btn-sm btn-outline-secondary mt-1">Select Form</button>
            </div>
          </div>
        );
      case 'survey':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light' : 'border p-2 rounded bg-light'}>
              <p className="mb-0">Embedded Survey</p>
              <button className="btn btn-sm btn-outline-secondary mt-1">Select Survey</button>
            </div>
          </div>
        );
      case 'carousel':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
              <div className="py-3">
                <i className="fa fa-images fa-2x"></i>
                <p className="mb-0">Image/Video Carousel</p>
              </div>
            </div>
          </div>
        );
      case 'wysiwyg':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light' : 'border p-2 rounded bg-light'}>
              <p className="mb-0">WYSIWYG Editor</p>
              <div className="btn-toolbar mt-1">
                <button className="btn btn-sm btn-outline-secondary me-1">B</button>
                <button className="btn btn-sm btn-outline-secondary me-1">I</button>
                <button className="btn btn-sm btn-outline-secondary">U</button>
              </div>
            </div>
          </div>
        );
      case 'profile':
        const profileElement = element as import('../../../../components/engage/elements').ProfileElementData;
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
              {renderProfileJSX(profileElement)}
            </div>
          </div>
        );
      case 'social':
        const socialElement = element as import('../../../../components/engage/elements').SocialElementData;
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? '' : 'border p-2 rounded'}>
              {renderSocialJSX(socialElement)}
            </div>
          </div>
        );
      case 'instagram':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
              <div className="py-2">
                <i className="fa fa-instagram fa-2x"></i>
                <p className="mb-0">Instagram Embed</p>
              </div>
            </div>
          </div>
        );
      case 'facebook':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
              <div className="py-2">
                <i className="fa fa-facebook fa-2x"></i>
                <p className="mb-0">Facebook Embed</p>
              </div>
            </div>
          </div>
        );
      case 'youtube':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light text-center' : 'border p-2 rounded bg-light text-center'}>
              <div className="py-2">
                <i className="fa fa-youtube fa-2x"></i>
                <p className="mb-0">YouTube Embed</p>
              </div>
            </div>
          </div>
        );
      case 'product':
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <div className={pageSettings.cleanView ? 'bg-light' : 'border p-2 rounded bg-light'}>
              <p className="mb-0">Product Data</p>
              <button className="btn btn-sm btn-outline-secondary mt-1">Select Product</button>
            </div>
          </div>
        );
      default:
        return (
          <div className="mb-3">
            {renderElementHeader()}
            <p className="text-muted">[{element.type} element]</p>
          </div>
        );
    }
  };

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center">
          <Button 
            variant="outline-secondary" 
            className="me-3"
            onClick={handleBack}
            disabled={loading}
          >
            <FaArrowLeft className="me-2" />
            Back to Pages
          </Button>
          <div>
            <h1 className="h3 mb-0">Page Designer: {pageTitle}</h1>
            <p className="text-muted mb-0">Design your page by adding sections and elements</p>
          </div>
        </div>
        <div>
          <Button 
            variant={pageSettings.cleanView ? "outline-success" : "outline-secondary"} 
            className="me-2"
            onClick={toggleCleanView}
            disabled={loading}
            title={pageSettings.cleanView ? "Show structure elements" : "Hide structure elements"}
          >
            <FaEye className="me-1" /> {pageSettings.cleanView ? "Structure View" : "Clean View"}
          </Button>
          <Button 
            variant={previewHover ? "outline-info" : "outline-secondary"} 
            className="me-2"
            onClick={() => setPreviewHover(!previewHover)}
            disabled={loading}
            title={previewHover ? "Hide hover effects" : "Show hover effects"}
          >
            <FaMousePointer className="me-1" /> {previewHover ? "Hide Hover" : "Show Hover"}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSavePage} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="me-1" /> Save Page
              </>
            )}
          </Button>
        </div>
      </div>

      <Row>
        {/* Left Panel - Elements */}
        <PageElementsPanel 
          sections={sections}
          selectedSection={selectedSection}
          selectedElement={selectedElement}
          onAddElement={handleAddElement}
          onSectionSelect={handleSectionSelect}
          onElementSelect={handleElementSelect}
          onMoveSection={handleMoveSectionById}
          onMoveElement={handleMoveElementById}
          onCloneSection={handleCloneSection}
          onCloneElement={handleCloneElement}
          onDeleteSection={handleDeleteSectionById}
          onDeleteElement={handleDeleteElementById}
        />

        {/* Main Content Area - Canvas */}
        <PageCanvas 
          sections={sections}
          selectedSection={selectedSection}
          selectedElement={selectedElement}
          pageAppearance={pageAppearance}
          pageSettings={pageSettings}
          onSectionSelect={handleSectionSelect}
          onElementSelect={handleElementSelect}
          onAddSection={handleAddSection}
          onAddElement={handleAddElement}
          renderElementPreview={renderElementPreview}
        />

        {/* Right Panel - Properties */}
        <Col md={3}>
          <div>
            {/* Element Properties Panel */}
            {selectedElement && (
              <ElementPropertiesPanel
                selectedElement={selectedElement}
                selectedSection={selectedSection}
                onElementUpdate={handleElementUpdate}
                onOptionChange={handleOptionChange}
                onAddOption={handleAddOption}
                onRemoveOption={handleRemoveOption}
                onDeleteElement={handleDeleteElement}
                onMoveElement={handleMoveElement}
              />
            )}
            
            {/* Section Properties Accordion */}
            <Accordion className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="d-flex align-items-center">
                    <FaPlus className="me-2" />
                    <span>Section Properties</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Section Title</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="title"
                        value={selectedSection.title}
                        onChange={handleSectionUpdate}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Section Description</Form.Label>
                      <Form.Control 
                        as="textarea"
                        rows={2}
                        name="description"
                        value={selectedSection.description || ''}
                        onChange={handleSectionUpdate}
                        placeholder="Optional section description"
                      />
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <div>
                        <Button 
                          variant="outline-danger" 
                          onClick={handleDeleteSection}
                          disabled={sections.length <= 1}
                          size="sm"
                        >
                          <FaTrash className="me-1" /> Delete
                        </Button>
                      </div>
                      <div>
                        <Button 
                          variant="outline-secondary" 
                          className="me-2"
                          onClick={() => handleMoveSection('up')}
                          disabled={sections.indexOf(selectedSection) === 0}
                          size="sm"
                        >
                          <FaArrowUp />
                        </Button>
                        <Button 
                          variant="outline-secondary"
                          onClick={() => handleMoveSection('down')}
                          disabled={sections.indexOf(selectedSection) === sections.length - 1}
                          size="sm"
                        >
                          <FaArrowDown />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline-primary" 
                        onClick={handleAddSection}
                        className="w-100"
                        size="sm"
                      >
                        <FaPlus className="me-1" /> Add New Section
                      </Button>
                    </div>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            
            {/* Page Settings Accordion */}
            <Accordion className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="d-flex align-items-center">
                    <FaSlidersH className="me-2" />
                    <span>Page Settings</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Footer Text</Form.Label>
                      <Form.Control 
                        as="textarea"
                        rows={2}
                        name="footerText"
                        value={pageSettings.footerText}
                        onChange={handleSettingsChange}
                        placeholder="Optional footer text"
                      />
                    </Form.Group>
                  </Form>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
            
            {/* Page Appearance Accordion */}
            <Accordion className="mb-3">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <div className="d-flex align-items-center">
                    <FaPalette className="me-2" />
                    <span>Page Appearance</span>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <PageAppearanceSettings 
                    appearance={pageAppearance}
                    onChange={handleAppearanceChange}
                  />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PageDesigner;
