import api from '../api';
import { SurveyData, SurveyResponse } from './types';

const API_URL = '/engage';

/**
 * Get all surveys
 */
export const getAllSurveys = async () => {
  try {
    const response = await api.get(`${API_URL}/surveys`);
    return response.data;
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

/**
 * Get survey by ID
 */
export const getSurveyById = async (id: string) => {
  try {
    const response = await api.get(`${API_URL}/surveys/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching survey ${id}:`, error);
    throw error;
  }
};

/**
 * Create new survey
 */
export const createSurvey = async (surveyData: SurveyData) => {
  try {
    const response = await api.post(`${API_URL}/surveys`, surveyData);
    return response.data;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

/**
 * Update survey
 */
export const updateSurvey = async (id: string, surveyData: SurveyData) => {
  try {
    const response = await api.put(`${API_URL}/surveys/${id}`, surveyData);
    return response.data;
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    throw error;
  }
};

/**
 * Delete survey
 */
export const deleteSurvey = async (id: string) => {
  try {
    const response = await api.delete(`${API_URL}/surveys/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    throw error;
  }
};

/**
 * Get survey responses
 */
export const getSurveyResponses = async (surveyId: string) => {
  try {
    const response = await api.get(`${API_URL}/surveys/${surveyId}/responses`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching responses for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Submit survey response (public)
 */
export const submitSurveyResponse = async (slug: string, responseData: any) => {
  try {
    // Use regular axios for public endpoints that don't require authentication
    const response = await api.post(`${API_URL}/surveys/submit/${slug}`, responseData);
    return response.data;
  } catch (error) {
    console.error(`Error submitting response to survey ${slug}:`, error);
    throw error;
  }
};
