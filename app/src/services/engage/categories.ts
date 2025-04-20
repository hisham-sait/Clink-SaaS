import api from '../api';
import { FormCategory, SurveyCategory } from './types';

const API_URL = '/engage';

/**
 * Get form categories
 */
export const getFormCategories = async () => {
  try {
    const response = await api.get(`${API_URL}/forms/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching form categories:', error);
    throw error;
  }
};

/**
 * Get survey categories
 */
export const getSurveyCategories = async () => {
  try {
    const response = await api.get(`${API_URL}/surveys/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching survey categories:', error);
    throw error;
  }
};

/**
 * Create form category
 */
export const createFormCategory = async (name: string) => {
  try {
    const response = await api.post(`${API_URL}/forms/categories`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating form category:', error);
    throw error;
  }
};

/**
 * Create survey category
 */
export const createSurveyCategory = async (name: string) => {
  try {
    const response = await api.post(`${API_URL}/surveys/categories`, { name });
    return response.data;
  } catch (error) {
    console.error('Error creating survey category:', error);
    throw error;
  }
};

/**
 * Update form category
 */
export const updateFormCategory = async (id: string, name: string) => {
  try {
    const response = await api.put(`${API_URL}/forms/categories/${id}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error updating form category ${id}:`, error);
    throw error;
  }
};

/**
 * Update survey category
 */
export const updateSurveyCategory = async (id: string, name: string) => {
  try {
    const response = await api.put(`${API_URL}/surveys/categories/${id}`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error updating survey category ${id}:`, error);
    throw error;
  }
};

/**
 * Delete form category
 */
export const deleteFormCategory = async (id: string) => {
  try {
    await api.delete(`${API_URL}/forms/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting form category ${id}:`, error);
    throw error;
  }
};

/**
 * Delete survey category
 */
export const deleteSurveyCategory = async (id: string) => {
  try {
    await api.delete(`${API_URL}/surveys/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting survey category ${id}:`, error);
    throw error;
  }
};
