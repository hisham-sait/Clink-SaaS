import React from 'react';
import { Card, Button, Form } from 'react-bootstrap';

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

interface FormSettings {
  showSubmitButton: boolean;
  submitButtonText: string;
  showResetButton: boolean;
  resetButtonText: string;
  redirectAfterSubmit: boolean;
  redirectUrl: string;
  emailNotification: boolean;
  notificationEmail: string;
}

interface FormAppearance {
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

interface FormPreviewProps {
  formTitle: string;
  sections: FormSection[];
  formSettings: FormSettings;
  formAppearance: FormAppearance;
}

const FormPreview: React.FC<FormPreviewProps> = ({
  formTitle,
  sections,
  formSettings,
  formAppearance
}) => {
  // Generate CSS for preview based on appearance settings
  const getPreviewStyle = () => {
    return {
      backgroundColor: formAppearance.backgroundColor,
      backgroundImage: formAppearance.backgroundImage ? `url(${formAppearance.backgroundImage})` : 'none',
      fontFamily: formAppearance.fontFamily,
      color: formAppearance.textColor,
      borderRadius: formAppearance.borderRadius,
      boxShadow: formAppearance.boxShadow,
      padding: '30px'
    };
  };

  const getHeaderStyle = () => {
    return {
      textAlign: formAppearance.headerAlignment as any,
      marginBottom: '30px'
    };
  };

  const getSectionTitleStyle = () => {
    return {
      color: formAppearance.sectionTitleColor || formAppearance.textColor,
      marginTop: '20px',
      marginBottom: '10px'
    };
  };

  const getSectionDividerStyle = () => {
    return {
      borderBottom: `1px solid ${formAppearance.sectionDividerColor || '#dee2e6'}`,
      marginBottom: '15px',
      paddingBottom: '5px'
    };
  };

  const getElementStyle = () => {
    return {
      marginBottom: formAppearance.elementSpacing || '15px'
    };
  };

  const getButtonStyle = () => {
    let buttonClass = 'btn ';
    
    switch(formAppearance.buttonStyle) {
      case 'rounded':
        buttonClass += 'rounded-pill ';
        break;
      case 'square':
        buttonClass += 'rounded-0 ';
        break;
      case 'outline':
        buttonClass += 'btn-outline-';
        return buttonClass + (formSettings.showSubmitButton ? 'primary' : 'secondary');
      default:
        buttonClass += 'btn-';
        return buttonClass + (formSettings.showSubmitButton ? 'primary' : 'secondary');
    }
    
    buttonClass += 'btn-';
    return buttonClass + (formSettings.showSubmitButton ? 'primary' : 'secondary');
  };

  const renderElementPreview = (element: FormElement) => {
    switch (element.type) {
      case 'text':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="text" placeholder={element.placeholder} />
          </Form.Group>
        );
      case 'textarea':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control as="textarea" rows={3} placeholder={element.placeholder} />
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
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
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
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
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
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
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="date" />
          </Form.Group>
        );
      case 'file':
        return (
          <Form.Group className="mb-3" style={getElementStyle()}>
            <Form.Label>{element.label}{element.required && <span className="text-danger">*</span>}</Form.Label>
            {element.description && <Form.Text className="text-muted d-block mb-1">{element.description}</Form.Text>}
            <Form.Control type="file" />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="p-4" style={getPreviewStyle()}>
      <div style={getHeaderStyle()}>
        <h3>{formTitle}</h3>
      </div>
      <Form>
        {sections.map(section => (
          <div key={section.id} className="form-section mb-4">
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
        <div className="mt-4" style={{ textAlign: formAppearance.headerAlignment as any }}>
          {formSettings.showSubmitButton && (
            <Button 
              className={getButtonStyle()} 
              style={{ 
                backgroundColor: formAppearance.primaryColor, 
                borderColor: formAppearance.primaryColor 
              }}
            >
              {formSettings.submitButtonText}
            </Button>
          )}
          {formSettings.showResetButton && (
            <Button 
              variant="outline-secondary" 
              className="ms-2"
            >
              {formSettings.resetButtonText}
            </Button>
          )}
        </div>
      </Form>
    </Card>
  );
};

export default FormPreview;
