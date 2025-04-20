import api from '../api';
import { FormData, FormSubmission } from './types';

const API_URL = '/engage';

/**
 * Get all forms
 */
export const getAllForms = async () => {
  try {
    const response = await api.get(`${API_URL}/forms`);
    return response.data;
  } catch (error) {
    console.error('Error fetching forms:', error);
    throw error;
  }
};

/**
 * Get form by ID
 */
export const getFormById = async (id: string) => {
  try {
    const response = await api.get(`${API_URL}/forms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching form ${id}:`, error);
    throw error;
  }
};

/**
 * Create new form
 */
export const createForm = async (formData: FormData) => {
  try {
    const response = await api.post(`${API_URL}/forms`, formData);
    return response.data;
  } catch (error) {
    console.error('Error creating form:', error);
    throw error;
  }
};

/**
 * Update form
 */
export const updateForm = async (id: string, formData: FormData) => {
  try {
    const response = await api.put(`${API_URL}/forms/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error(`Error updating form ${id}:`, error);
    throw error;
  }
};

/**
 * Delete form
 */
export const deleteForm = async (id: string) => {
  try {
    const response = await api.delete(`${API_URL}/forms/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting form ${id}:`, error);
    throw error;
  }
};

/**
 * Get form submissions
 */
export const getFormSubmissions = async (formId: string) => {
  try {
    const response = await api.get(`${API_URL}/forms/${formId}/submissions`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching submissions for form ${formId}:`, error);
    throw error;
  }
};

/**
 * Submit form (public)
 */
export const submitForm = async (slug: string, formData: any) => {
  try {
    // Use regular axios for public endpoints that don't require authentication
    const response = await api.post(`${API_URL}/forms/submit/${slug}`, formData);
    return response.data;
  } catch (error) {
    console.error(`Error submitting form ${slug}:`, error);
    throw error;
  }
};
