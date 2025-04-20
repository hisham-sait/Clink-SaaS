import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { SurveysService } from '../../../../services/engage';

interface SurveyEmbedProps {
  surveyId: string;
}

const SurveyEmbed: React.FC<SurveyEmbedProps> = ({ surveyId }) => {
  const [survey, setSurvey] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        // For public surveys, we need to use the public endpoint
        const response = await fetch(`/api/engage/public/surveys/${surveyId}`);
        if (!response.ok) {
          throw new Error('Failed to load survey');
        }
        const surveyData = await response.json();
        setSurvey(surveyData);
      } catch (err: any) {
        setError(err.message || 'Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [surveyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setResponses({
        ...responses,
        [name]: checkbox.checked
      });
    } else if (type === 'radio') {
      setResponses({
        ...responses,
        [name]: value
      });
    } else {
      setResponses({
        ...responses,
        [name]: value
      });
    }
  };

  const handleNext = () => {
    if (survey && survey.sections && currentSection < survey.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!survey) return;
    
    setSubmitting(true);
    
    try {
      await SurveysService.submitSurveyResponse(survey.slug, responses);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" className="text-primary" />
        <p className="mt-3">Loading survey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  if (!survey) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Survey Not Found</Alert.Heading>
        <p>The requested survey could not be found or is no longer available.</p>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
          <h3>Thank You!</h3>
          <p className="mb-4">Your survey response has been submitted successfully.</p>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setResponses({});
              setCurrentSection(0);
              setSubmitted(false);
            }}
          >
            Submit Another Response
          </Button>
        </Card.Body>
      </Card>
    );
  }

  // Get current section
  const section = survey.sections && survey.sections.length > 0 ? survey.sections[currentSection] : null;
  const totalSections = survey.sections ? survey.sections.length : 0;
  const progress = totalSections > 0 ? ((currentSection + 1) / totalSections) * 100 : 0;

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h3 className="mb-0">{survey.title}</h3>
        {survey.description && <p className="mb-0 mt-2">{survey.description}</p>}
      </Card.Header>
      <Card.Body>
        {totalSections > 1 && (
          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <small>Section {currentSection + 1} of {totalSections}</small>
              <small>{Math.round(progress)}% Complete</small>
            </div>
            <ProgressBar now={progress} />
          </div>
        )}

        {section ? (
          <Form onSubmit={handleSubmit}>
            <h4 className="mb-3">{section.title}</h4>
            {section.description && <p className="text-muted mb-4">{section.description}</p>}

            {section.questions && section.questions.map((question: any, index: number) => {
              switch (question.type) {
                case 'text':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{question.label}</Form.Label>
                      <Form.Control
                        type="text"
                        name={question.name}
                        placeholder={question.placeholder}
                        value={responses[question.name] || ''}
                        onChange={handleInputChange}
                        required={question.required}
                      />
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                case 'textarea':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{question.label}</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name={question.name}
                        placeholder={question.placeholder}
                        value={responses[question.name] || ''}
                        onChange={handleInputChange}
                        required={question.required}
                      />
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                case 'select':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{question.label}</Form.Label>
                      <Form.Select
                        name={question.name}
                        value={responses[question.name] || ''}
                        onChange={handleInputChange}
                        required={question.required}
                      >
                        <option value="">{question.placeholder || 'Select an option'}</option>
                        {question.options && question.options.map((option: any, optIndex: number) => (
                          <option key={optIndex} value={option.value}>{option.label}</option>
                        ))}
                      </Form.Select>
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                case 'radio':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{question.label}</Form.Label>
                      {question.options && question.options.map((option: any, optIndex: number) => (
                        <Form.Check
                          key={optIndex}
                          type="radio"
                          id={`radio-${index}-${optIndex}`}
                          name={question.name}
                          value={option.value}
                          label={option.label}
                          checked={responses[question.name] === option.value}
                          onChange={handleInputChange}
                          required={question.required}
                        />
                      ))}
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                case 'checkbox':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Check
                        type="checkbox"
                        id={`checkbox-${index}`}
                        name={question.name}
                        label={question.label}
                        checked={responses[question.name] || false}
                        onChange={handleInputChange}
                        required={question.required}
                      />
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                case 'scale':
                  return (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{question.label}</Form.Label>
                      <div className="d-flex justify-content-between mb-2">
                        <small>{question.minLabel || 'Low'}</small>
                        <small>{question.maxLabel || 'High'}</small>
                      </div>
                      <div className="d-flex justify-content-between">
                        {Array.from({ length: question.max - question.min + 1 }, (_, i) => i + question.min).map((value) => (
                          <div key={value} className="text-center mx-2">
                            <Form.Check
                              type="radio"
                              id={`scale-${index}-${value}`}
                              name={question.name}
                              value={value.toString()}
                              checked={responses[question.name] === value.toString()}
                              onChange={handleInputChange}
                              required={question.required}
                              label={value.toString()}
                              className="mb-0"
                            />
                          </div>
                        ))}
                      </div>
                      {question.helpText && <Form.Text className="text-muted">{question.helpText}</Form.Text>}
                    </Form.Group>
                  );
                default:
                  return null;
              }
            })}
            
            <div className="d-flex justify-content-between mt-4">
              {currentSection > 0 ? (
                <Button 
                  variant="outline-secondary" 
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              ) : <div></div>}
              
              {currentSection < totalSections - 1 ? (
                <Button 
                  variant="primary" 
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Submitting...
                    </>
                  ) : 'Submit'}
                </Button>
              )}
            </div>
          </Form>
        ) : (
          <Alert variant="warning">
            <Alert.Heading>No Questions</Alert.Heading>
            <p>This survey does not contain any questions.</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default SurveyEmbed;
