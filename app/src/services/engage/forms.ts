import api from '../api';
import { FormData, FormSubmission } from './types';
import { getCurrentCompanyId } from './index';

const API_URL = '/engage';

/**
 * Get all forms
 */
export const getAllForms = async (): Promise<FormData[]> => {
  try {
    const response = await api.get(`${API_URL}/forms`);
    
    // Standardized response handling that ensures we return an array
    const formsData = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(formsData) ? formsData : [];
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
};

/**
 * Get form by ID
 */
export const getFormById = async (id: string): Promise<FormData> => {
  try {
    const response = await api.get(`${API_URL}/forms/${id}`);
    
    // Standardized response handling
    const formData = response.data.data || response.data;
    return formData;
  } catch (error) {
    console.error(`Error fetching form ${id}:`, error);
    throw error;
  }
};

/**
 * Create new form
 */
export const createForm = async (formData: FormData): Promise<FormData> => {
  try {
    // Ensure formData has the required properties and match the Prisma schema
    const formDataWithDefaults = {
      ...formData,
      settings: formData.settings || {},
      appearance: formData.appearance || {},
      sections: formData.sections || []
    };
    
    // Remove elements field as it's not in the Prisma schema
    if ('elements' in formDataWithDefaults) {
      // Store elements in settings if needed
      if (!formDataWithDefaults.settings.elements && formDataWithDefaults.elements) {
        formDataWithDefaults.settings.elements = formDataWithDefaults.elements;
      }
      delete formDataWithDefaults.elements;
    }
    
    const response = await api.post(`${API_URL}/forms`, formDataWithDefaults);
    
    // Standardized response handling
    const createdForm = response.data.data || response.data;
    return createdForm;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
};

/**
 * Update form
 */
export const updateForm = async (id: string, formData: FormData): Promise<FormData> => {
  try {
    const response = await api.put(`${API_URL}/forms/${id}`, formData);
    
    // Standardized response handling
    const updatedForm = response.data.data || response.data;
    return updatedForm;
  } catch (error) {
    console.error(`Error updating form ${id}:`, error);
    throw error;
  }
};

/**
 * Delete form
 */
export const deleteForm = async (id: string): Promise<any> => {
  try {
    const response = await api.delete(`${API_URL}/forms/${id}`);
    
    // Standardized response handling
    const result = response.data.data || response.data;
    return result;
  } catch (error) {
    console.error(`Error deleting form ${id}:`, error);
    throw error;
  }
};

/**
 * Get form submissions
 */
export const getFormSubmissions = async (formId: string): Promise<FormSubmission[]> => {
  try {
    const response = await api.get(`${API_URL}/forms/${formId}/submissions`);
    
    // Standardized response handling that ensures we return an array
    const submissions = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(submissions) ? submissions : [];
  } catch (error) {
    console.error(`Error fetching submissions for form ${formId}:`, error);
    throw error;
  }
};

/**
 * Submit form (public)
 */
export const submitForm = async (slug: string, formData: any): Promise<any> => {
  try {
    // Use regular axios for public endpoints that don't require authentication
    const response = await api.post(`${API_URL}/forms/submit/${slug}`, formData);
    return response.data;
  } catch (error) {
    console.error(`Error submitting form ${slug}:`, error);
    throw error;
  }
};
