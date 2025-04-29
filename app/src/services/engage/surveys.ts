import api from '../api';
import { SurveyData, SurveyResponse } from './types';
import { getCurrentCompanyId } from './index';

const API_URL = '/engage';

/**
 * Get all surveys
 */
export const getAllSurveys = async (): Promise<SurveyData[]> => {
  try {
    const response = await api.get(`${API_URL}/surveys`);
    
    // Standardized response handling that ensures we return an array
    const surveysData = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(surveysData) ? surveysData : [];
  } catch (error) {
    console.error('Error fetching surveys:', error);
    throw error;
  }
};

/**
 * Get survey by ID
 */
export const getSurveyById = async (id: string): Promise<SurveyData> => {
  try {
    const response = await api.get(`${API_URL}/surveys/${id}`);
    
    // Standardized response handling
    const surveyData = response.data.data || response.data;
    return surveyData;
  } catch (error) {
    console.error(`Error fetching survey ${id}:`, error);
    throw error;
  }
};

/**
 * Create new survey
 */
export const createSurvey = async (surveyData: SurveyData): Promise<SurveyData> => {
  try {
    // Ensure surveyData has the required properties
    const surveyDataWithDefaults = {
      ...surveyData,
      sections: surveyData.sections || [],
      settings: surveyData.settings || {},
      appearance: surveyData.appearance || {}
    };
    
    const response = await api.post(`${API_URL}/surveys`, surveyDataWithDefaults);
    
    // Standardized response handling
    const createdSurvey = response.data.data || response.data;
    return createdSurvey;
  } catch (error) {
    console.error('Error creating survey:', error);
    throw error;
  }
};

/**
 * Update survey
 */
export const updateSurvey = async (id: string, surveyData: SurveyData): Promise<SurveyData> => {
  try {
    const response = await api.put(`${API_URL}/surveys/${id}`, surveyData);
    
    // Standardized response handling
    const updatedSurvey = response.data.data || response.data;
    return updatedSurvey;
  } catch (error) {
    console.error(`Error updating survey ${id}:`, error);
    throw error;
  }
};

/**
 * Delete survey
 */
export const deleteSurvey = async (id: string): Promise<any> => {
  try {
    const response = await api.delete(`${API_URL}/surveys/${id}`);
    
    // Standardized response handling
    const result = response.data.data || response.data;
    return result;
  } catch (error) {
    console.error(`Error deleting survey ${id}:`, error);
    throw error;
  }
};

/**
 * Get survey responses
 */
export const getSurveyResponses = async (surveyId: string): Promise<SurveyResponse[]> => {
  try {
    const response = await api.get(`${API_URL}/surveys/${surveyId}/responses`);
    
    // Standardized response handling that ensures we return an array
    const responses = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(responses) ? responses : [];
  } catch (error) {
    console.error(`Error fetching responses for survey ${surveyId}:`, error);
    throw error;
  }
};

/**
 * Submit survey response (public)
 */
export const submitSurveyResponse = async (slug: string, responseData: any): Promise<any> => {
  try {
    // Use regular axios for public endpoints that don't require authentication
    const response = await api.post(`${API_URL}/surveys/submit/${slug}`, responseData);
    return response.data;
  } catch (error) {
    console.error(`Error submitting response to survey ${slug}:`, error);
    throw error;
  }
};
