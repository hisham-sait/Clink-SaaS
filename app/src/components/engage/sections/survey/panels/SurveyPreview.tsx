import React from 'react';
import { Card, Button, Form, Table } from 'react-bootstrap';

interface SurveyQuestion {
  id: string;
  type: string;
  question: string;
  description?: string;
  required: boolean;
  options?: string[];
  scale?: {
    min: number;
    max: number;
    minLabel?: string;
    maxLabel?: string;
  };
}

interface SurveySection {
  id: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
}

interface SurveySettings {
  showProgressBar: boolean;
  allowAnonymousResponses: boolean;
  requireAllQuestions: boolean;
  allowMultipleResponses: boolean;
  showThankYouPage: boolean;
  thankYouMessage: string;
}

interface SurveyAppearance {
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
  sectionTitleColor: string;
  sectionDividerColor: string;
  questionSpacing: string;
}

interface SurveyPreviewProps {
  surveyTitle: string;
  sections: SurveySection[];
  surveySettings: SurveySettings;
  surveyAppearance: SurveyAppearance;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  surveyTitle,
  sections,
  surveySettings,
  surveyAppearance
}) => {
  // Generate CSS for preview based on appearance settings
  const getPreviewStyle = () => {
    return {
      backgroundColor: surveyAppearance.backgroundColor,
      backgroundImage: surveyAppearance.backgroundImage ? `url(${surveyAppearance.backgroundImage})` : 'none',
      fontFamily: surveyAppearance.fontFamily,
      color: surveyAppearance.textColor,
      borderRadius: surveyAppearance.borderRadius,
      boxShadow: surveyAppearance.boxShadow,
      padding: '30px'
    };
  };

  const getHeaderStyle = () => {
    return {
      textAlign: surveyAppearance.headerAlignment as any,
      marginBottom: '30px'
    };
  };
  
  const getSectionTitleStyle = () => {
    return {
      color: surveyAppearance.sectionTitleColor,
      borderBottom: `1px solid ${surveyAppearance.sectionDividerColor}`,
      paddingBottom: '10px',
      marginTop: '30px',
      marginBottom: '15px'
    };
  };
  
  const getQuestionStyle = () => {
    return {
      marginBottom: surveyAppearance.questionSpacing
    };
  };

  const renderQuestionPreview = (question: SurveyQuestion) => {
    switch (question.type) {
      case 'text':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control type="text" placeholder="Your answer" />
          </Form.Group>
        );
      case 'textarea':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control as="textarea" rows={3} placeholder="Your answer" />
          </Form.Group>
        );
      case 'checkbox':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            {question.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="checkbox"
                id={`${question.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'radio':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            {question.options?.map((option, index) => (
              <Form.Check 
                key={index}
                type="radio"
                name={question.id}
                id={`${question.id}-option-${index}`}
                label={option}
              />
            ))}
          </Form.Group>
        );
      case 'select':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Select>
              <option value="">Select an option</option>
              {question.options?.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </Form.Select>
          </Form.Group>
        );
      case 'scale':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="text-muted">{question.scale?.minLabel || question.scale?.min}</span>
              <span className="text-muted">{question.scale?.maxLabel || question.scale?.max}</span>
            </div>
            <div className="d-flex justify-content-between">
              {Array.from({ length: (question.scale?.max || 5) - (question.scale?.min || 1) + 1 }).map((_, i) => (
                <div key={i} className="text-center" style={{ width: '40px' }}>
                  <Form.Check
                    type="radio"
                    name={question.id}
                    id={`${question.id}-scale-${i}`}
                    className="position-relative mx-auto"
                    style={{ height: '20px' }}
                  />
                  <div className="mt-1">{(question.scale?.min || 1) + i}</div>
                </div>
              ))}
            </div>
          </Form.Group>
        );
      case 'likert':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Table bordered hover size="sm" className="mt-2">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}></th>
                  {question.options?.map((option, i) => (
                    <th key={i} className="text-center">{option}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Your response</td>
                  {question.options?.map((_, i) => (
                    <td key={i} className="text-center">
                      <Form.Check
                        type="radio"
                        name={question.id}
                        id={`${question.id}-likert-${i}`}
                        className="d-inline-block"
                      />
                    </td>
                  ))}
                </tr>
              </tbody>
            </Table>
          </Form.Group>
        );
      case 'date':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
            <Form.Control type="date" />
          </Form.Group>
        );
      case 'file':
        return (
          <Form.Group className="mb-3" style={getQuestionStyle()}>
            <Form.Label>{question.question}{question.required && <span className="text-danger">*</span>}</Form.Label>
            {question.description && <Form.Text className="text-muted d-block mb-1">{question.description}</Form.Text>}
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
        <h3>{surveyTitle}</h3>
      </div>
      
      {surveySettings.showProgressBar && (
        <div className="progress" style={{ height: '8px', marginBottom: '20px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: '0%', backgroundColor: surveyAppearance.primaryColor }} 
            aria-valuenow={0} 
            aria-valuemin={0} 
            aria-valuemax={100}
          >
            0%
          </div>
        </div>
      )}
      
      <Form>
        {sections.map((section) => (
          <div key={section.id} className="mb-4">
            <h4 style={getSectionTitleStyle()}>{section.title}</h4>
            {section.description && <p className="text-muted">{section.description}</p>}
            {section.questions.map(question => (
              <div key={question.id}>
                {renderQuestionPreview(question)}
              </div>
            ))}
          </div>
        ))}
        <div className="mt-4" style={{ textAlign: surveyAppearance.headerAlignment as any }}>
          <Button 
            style={{ 
              backgroundColor: surveyAppearance.primaryColor, 
              borderColor: surveyAppearance.primaryColor 
            }}
          >
            Submit
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default SurveyPreview;
