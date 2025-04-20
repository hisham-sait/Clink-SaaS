import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FormsService } from '../../../../services/engage';

interface FormEmbedProps {
  formId: string;
}

const FormEmbed: React.FC<FormEmbedProps> = ({ formId }) => {
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        // For public forms, we need to use the public endpoint
        const response = await fetch(`/api/engage/public/forms/${formId}`);
        if (!response.ok) {
          throw new Error('Failed to load form');
        }
        const formData = await response.json();
        setForm(formData);
      } catch (err: any) {
        setError(err.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        setFormData({
          ...formData,
          [name]: fileInput.files[0]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!form) return;
    
    setSubmitting(true);
    
    try {
      await FormsService.submitForm(form.slug, formData);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit form');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" className="text-primary" />
        <p className="mt-3">Loading form...</p>
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

  if (!form) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Form Not Found</Alert.Heading>
        <p>The requested form could not be found or is no longer available.</p>
      </Alert>
    );
  }

  if (submitted) {
    return (
      <Card className="shadow-sm">
        <Card.Body className="text-center py-5">
          <i className="bi bi-check-circle-fill text-success fs-1 mb-3"></i>
          <h3>Thank You!</h3>
          <p className="mb-4">Your form has been submitted successfully.</p>
          <Button 
            variant="outline-primary" 
            onClick={() => {
              setFormData({});
              setSubmitted(false);
            }}
          >
            Submit Another Response
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h3 className="mb-0">{form.title}</h3>
        {form.description && <p className="mb-0 mt-2">{form.description}</p>}
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          {form.elements && form.elements.map((element: any, index: number) => {
            switch (element.type) {
              case 'text':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Label>{element.label}</Form.Label>
                    <Form.Control
                      type="text"
                      name={element.name}
                      placeholder={element.placeholder}
                      value={formData[element.name] || ''}
                      onChange={handleInputChange}
                      required={element.required}
                    />
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              case 'textarea':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Label>{element.label}</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name={element.name}
                      placeholder={element.placeholder}
                      value={formData[element.name] || ''}
                      onChange={handleInputChange}
                      required={element.required}
                    />
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              case 'select':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Label>{element.label}</Form.Label>
                    <Form.Select
                      name={element.name}
                      value={formData[element.name] || ''}
                      onChange={handleInputChange}
                      required={element.required}
                    >
                      <option value="">{element.placeholder || 'Select an option'}</option>
                      {element.options && element.options.map((option: any, optIndex: number) => (
                        <option key={optIndex} value={option.value}>{option.label}</option>
                      ))}
                    </Form.Select>
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              case 'checkbox':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Check
                      type="checkbox"
                      id={`checkbox-${index}`}
                      name={element.name}
                      label={element.label}
                      checked={formData[element.name] || false}
                      onChange={handleInputChange}
                      required={element.required}
                    />
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              case 'radio':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Label>{element.label}</Form.Label>
                    {element.options && element.options.map((option: any, optIndex: number) => (
                      <Form.Check
                        key={optIndex}
                        type="radio"
                        id={`radio-${index}-${optIndex}`}
                        name={element.name}
                        value={option.value}
                        label={option.label}
                        checked={formData[element.name] === option.value}
                        onChange={handleInputChange}
                        required={element.required}
                      />
                    ))}
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              case 'file':
                return (
                  <Form.Group className="mb-3" key={index}>
                    <Form.Label>{element.label}</Form.Label>
                    <Form.Control
                      type="file"
                      name={element.name}
                      onChange={handleInputChange}
                      required={element.required}
                    />
                    {element.helpText && <Form.Text className="text-muted">{element.helpText}</Form.Text>}
                  </Form.Group>
                );
              default:
                return null;
            }
          })}
          
          <div className="d-grid gap-2 mt-4">
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
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormEmbed;
