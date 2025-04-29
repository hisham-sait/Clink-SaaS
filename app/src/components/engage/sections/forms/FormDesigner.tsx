import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Row, Alert, Button, Spinner } from 'react-bootstrap';
import { FaSave, FaEye, FaArrowLeft } from 'react-icons/fa';
import { FormsService } from '../../../../services/engage';

// Import panel components
import FormElementsPanel from './panels/FormElementsPanel';
import FormCanvas from './panels/FormCanvas';
import FormPropertiesPanel from './panels/FormPropertiesPanel';
import FormPreview from './panels/FormPreview';

interface FormElement {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  elements: FormElement[];
}

const FormDesigner: React.FC = () => {
  const navigate = useNavigate();
  const { formId } = useParams<{ formId: string }>();
  const [formTitle, setFormTitle] = useState('New Form');
  const [sections, setSections] = useState<FormSection[]>([
    {
      id: 'section-1',
      title: 'Default Section',
      description: 'This is the default section of your form.',
      elements: []
    }
  ]);
  const [selectedSection, setSelectedSection] = useState<FormSection>(sections[0]);
  const [selectedElement, setSelectedElement] = useState<FormElement | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formSettings, setFormSettings] = useState({
    showSubmitButton: true,
    submitButtonText: 'Submit',
    showResetButton: false,
    resetButtonText: 'Reset',
    redirectAfterSubmit: false,
    redirectUrl: '',
    emailNotification: false,
    notificationEmail: ''
  });
  
  // Form appearance state
  const [formAppearance, setFormAppearance] = useState({
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
    sectionTitleColor: '#343a40',
    sectionDividerColor: '#dee2e6',
    elementSpacing: '15px'
  });

  // Load form data if editing an existing form
  useEffect(() => {
    if (formId && formId !== 'new') {
      const fetchFormData = async () => {
        try {
          setLoading(true);
          setError(null);
          
          const form = await FormsService.getFormById(formId);
          
          setFormTitle(form.title);
          
          // Handle sections if they exist in settings, otherwise convert elements to a single section
          if (form.settings && form.settings.sections) {
            setSections(form.settings.sections);
            if (form.settings.sections.length > 0) {
              setSelectedSection(form.settings.sections[0]);
            }
          } else if (form.elements) {
            // Convert old format (flat elements array) to new sections format
            const defaultSection = {
              id: 'section-1',
              title: 'Default Section',
              description: 'This is the default section of your form.',
              elements: form.elements || []
            };
            setSections([defaultSection]);
            setSelectedSection(defaultSection);
          } else {
            // No sections or elements found, use default
            const defaultSection = {
              id: 'section-1',
              title: 'Default Section',
              description: 'This is the default section of your form.',
              elements: []
            };
            setSections([defaultSection]);
            setSelectedSection(defaultSection);
          }
          
          setFormSettings(form.settings || {
            showSubmitButton: true,
            submitButtonText: 'Submit',
            showResetButton: false,
            resetButtonText: 'Reset',
            redirectAfterSubmit: false,
            redirectUrl: '',
            emailNotification: false,
            notificationEmail: ''
          });
          
          // Load appearance settings if they exist
          if (form.appearance) {
            // Ensure all appearance properties have default values if not present
            const appearance = {
              ...formAppearance,
              ...form.appearance,
              width: form.appearance.width || '800px',
              sectionTitleColor: form.appearance.sectionTitleColor || '#343a40',
              sectionDividerColor: form.appearance.sectionDividerColor || '#dee2e6',
              elementSpacing: form.appearance.elementSpacing || '15px'
            };
            setFormAppearance(appearance);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error loading form:', error);
          setError('Failed to load form data. Please try again.');
          setLoading(false);
        }
      };
      
      fetchFormData();
    }
  }, [formId]);

  const handleAddElement = (type: string) => {
    if (!selectedSection) return;

    const newElement: FormElement = {
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
    const newSection: FormSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: '',
      elements: []
    };

    setSections([...sections, newSection]);
    setSelectedSection(newSection);
    setSelectedElement(null);
  };

  const handleSectionSelect = (section: FormSection) => {
    setSelectedSection(section);
    setSelectedElement(null);
  };

  const handleElementSelect = (element: FormElement) => {
    setSelectedElement(element);
  };

  const handleElementUpdate = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (!selectedElement) return;

    const { name, value, type, checked } = e.target as HTMLInputElement;
    
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
    const clonedElement: FormElement = {
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
    const clonedSection: FormSection = {
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
    
    setFormSettings({
      ...formSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Handler for appearance changes
  const handleAppearanceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormAppearance({
      ...formAppearance,
      [name]: value
    });
  };

  const handleSaveForm = async () => {
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
        ...formSettings,
        sections: processedSections
      };
      
      const formData = {
        title: formTitle,
        elements: elements, // Include elements for backward compatibility
        sections: processedSections, // Include sections directly in the formData
        settings: updatedSettings,
        appearance: formAppearance // Include appearance settings
      };
      
      console.log('Saving form data:', JSON.stringify(formData, null, 2));
      
      if (formId && formId !== 'new') {
        // Update existing form
        await FormsService.updateForm(formId, formData);
      } else {
        // Create new form
        const newForm = await FormsService.createForm(formData);
        // Optionally redirect to the edit page for the new form
        navigate(`/engage/forms/designer/${newForm.id}`);
        return; // Return early to prevent the navigate below
      }
      
      setLoading(false);
      navigate('/engage/forms');
    } catch (error) {
      console.error('Error saving form:', error);
      setError('Failed to save form. Please try again.');
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/engage/forms');
  };

  // Function to render element preview for the canvas
  const renderElementPreview = (element: FormElement) => {
    switch (element.type) {
      case 'text':
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            <input type="text" className="form-control" placeholder={element.placeholder} />
          </div>
        );
      case 'textarea':
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            <textarea className="form-control" rows={3} placeholder={element.placeholder}></textarea>
          </div>
        );
      case 'checkbox':
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            {element.options?.map((option, index) => (
              <div key={index} className="form-check">
                <input className="form-check-input" type="checkbox" id={`${element.id}-option-${index}`} />
                <label className="form-check-label" htmlFor={`${element.id}-option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'radio':
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            {element.options?.map((option, index) => (
              <div key={index} className="form-check">
                <input className="form-check-input" type="radio" name={element.id} id={`${element.id}-option-${index}`} />
                <label className="form-check-label" htmlFor={`${element.id}-option-${index}`}>{option}</label>
              </div>
            ))}
          </div>
        );
      case 'select':
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            <select className="form-select">
              <option value="">Select an option</option>
              {element.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      default:
        return (
          <div className="mb-3">
            <label className="form-label">{element.label}{element.required && <span className="text-danger">*</span>}</label>
            {element.description && <div className="form-text mb-1">{element.description}</div>}
            <p className="text-muted">[{element.type} field]</p>
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
            Back to Forms
          </Button>
          <div>
            <h1 className="h3 mb-0">Form Designer: {formTitle}</h1>
            <p className="text-muted mb-0">Design your form by adding sections and elements</p>
          </div>
        </div>
        <div>
          <Button 
            variant={previewMode ? "outline-primary" : "outline-secondary"} 
            className="me-2"
            onClick={() => setPreviewMode(!previewMode)}
            disabled={loading}
          >
            <FaEye className="me-1" /> Preview
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveForm} 
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
                <FaSave className="me-1" /> Save Form
              </>
            )}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <FormPreview 
          formTitle={formTitle}
          sections={sections}
          formSettings={formSettings}
          formAppearance={formAppearance}
        />
      ) : (
        <Row>
          {/* Left Panel - Elements */}
          <FormElementsPanel 
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
          <FormCanvas 
            sections={sections}
            selectedSection={selectedSection}
            selectedElement={selectedElement}
            formAppearance={formAppearance}
            onSectionSelect={handleSectionSelect}
            onElementSelect={handleElementSelect}
            onAddSection={handleAddSection}
            onAddElement={handleAddElement}
            renderElementPreview={renderElementPreview}
          />

          {/* Right Panel - Properties */}
          <FormPropertiesPanel 
            selectedElement={selectedElement}
            selectedSection={selectedSection}
            sections={sections}
            formSettings={formSettings}
            formAppearance={formAppearance}
            onElementUpdate={handleElementUpdate}
            onSectionUpdate={handleSectionUpdate}
            onSettingsChange={handleSettingsChange}
            onAppearanceChange={handleAppearanceChange}
            onOptionChange={handleOptionChange}
            onAddOption={handleAddOption}
            onRemoveOption={handleRemoveOption}
            onDeleteElement={handleDeleteElement}
            onDeleteSection={handleDeleteSection}
            onMoveElement={handleMoveElement}
            onMoveSection={handleMoveSection}
            onAddSection={handleAddSection}
          />
        </Row>
      )}
    </div>
  );
};

export default FormDesigner;
