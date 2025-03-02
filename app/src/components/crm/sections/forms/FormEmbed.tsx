import React, { useState, useEffect } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../../../../services/api';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface LeadForm {
  id: string;
  name: string;
  fields: FormField[];
  successMessage: string;
  redirectUrl?: string;
}

interface FormEmbedProps {
  formId: string;
}

const FormEmbed: React.FC<FormEmbedProps> = ({ formId }) => {
  const [form, setForm] = useState<LeadForm | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      try {
        const response = await api.get(`/crm/forms/embed/${formId}`);
        setForm(response.data);
      } catch (err) {
        console.error('Error loading form:', err);
        setError('Failed to load form');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.post(`/crm/forms/submit/${formId}`, formData);
      setSubmitted(true);
      if (form?.redirectUrl) {
        window.location.href = form.redirectUrl;
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Failed to submit form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  if (loading) {
    return <div className="text-center p-4">Loading...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!form) {
    return <Alert variant="warning">Form not found</Alert>;
  }

  if (submitted && !form.redirectUrl) {
    return <Alert variant="success">{form.successMessage}</Alert>;
  }

  return (
    <div className="p-4">
      <h3 className="mb-4">{form.name}</h3>
      <Form onSubmit={handleSubmit}>
        {form.fields.map((field) => (
          <Form.Group key={field.id} className="mb-3">
            <Form.Label>{field.label}</Form.Label>
            {field.type === 'textarea' ? (
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            ) : field.type === 'select' ? (
              <Form.Select
                required={field.required}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              >
                <option value="">Select...</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            ) : field.type === 'checkbox' ? (
              <Form.Check
                type="checkbox"
                label={field.label}
                required={field.required}
                onChange={(e) => handleInputChange(field.id, e.target.checked.toString())}
              />
            ) : (
              <Form.Control
                type={field.type}
                placeholder={field.placeholder}
                required={field.required}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
              />
            )}
          </Form.Group>
        ))}
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </Form>
    </div>
  );
};

export default FormEmbed;
