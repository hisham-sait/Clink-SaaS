import api from '../api';

/**
 * Get page analytics
 * @param {string} pageId - Page ID
 * @param {Object} dateRange - Date range
 * @returns {Promise<any>} Analytics data
 */
export const getPageAnalytics = async (pageId: string, dateRange?: { startDate: string; endDate: string }): Promise<any> => {
  try {
    let url = `/engage/analytics/pages/${pageId}/analytics`;
    
    if (dateRange) {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.data.analytics;
  } catch (error) {
    console.error('Error fetching page analytics:', error);
    throw error;
  }
};

/**
 * Get form analytics
 * @param {string} formId - Form ID
 * @param {Object} dateRange - Date range
 * @returns {Promise<any>} Analytics data
 */
export const getFormAnalytics = async (formId: string, dateRange?: { startDate: string; endDate: string }): Promise<any> => {
  try {
    let url = `/engage/analytics/forms/${formId}/analytics`;
    
    if (dateRange) {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.data.analytics;
  } catch (error) {
    console.error('Error fetching form analytics:', error);
    throw error;
  }
};

/**
 * Get survey analytics
 * @param {string} surveyId - Survey ID
 * @param {Object} dateRange - Date range
 * @returns {Promise<any>} Analytics data
 */
export const getSurveyAnalytics = async (surveyId: string, dateRange?: { startDate: string; endDate: string }): Promise<any> => {
  try {
    let url = `/engage/analytics/surveys/${surveyId}/analytics`;
    
    if (dateRange) {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.startDate);
      params.append('endDate', dateRange.endDate);
      url += `?${params.toString()}`;
    }
    
    const response = await api.get(url);
    return response.data.data.analytics;
  } catch (error) {
    console.error('Error fetching survey analytics:', error);
    throw error;
  }
};

/**
 * Get form submissions
 * @param {string} formId - Form ID
 * @returns {Promise<any[]>} Form submissions
 */
export const getFormSubmissions = async (formId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/engage/forms/${formId}/submissions`);
    return response.data.data.submissions || [];
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    throw error;
  }
};

/**
 * Get survey responses
 * @param {string} surveyId - Survey ID
 * @returns {Promise<any[]>} Survey responses
 */
export const getSurveyResponses = async (surveyId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/engage/surveys/${surveyId}/responses`);
    return response.data.data.responses || [];
  } catch (error) {
    console.error('Error fetching survey responses:', error);
    throw error;
  }
};

/**
 * Update page analytics settings
 * @param {string} pageId - Page ID
 * @param {Object} settings - Analytics settings
 * @returns {Promise<any>} Updated page
 */
export const updatePageAnalyticsSettings = async (pageId: string, settings: { enableAnalytics: boolean }): Promise<any> => {
  try {
    const response = await api.patch(`/engage/pages/${pageId}/settings`, {
      settings: {
        enableAnalytics: settings.enableAnalytics
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating page analytics settings:', error);
    throw error;
  }
};

/**
 * Update form analytics settings
 * @param {string} formId - Form ID
 * @param {Object} settings - Analytics settings
 * @returns {Promise<any>} Updated form
 */
export const updateFormAnalyticsSettings = async (formId: string, settings: { enableAnalytics: boolean }): Promise<any> => {
  try {
    const response = await api.patch(`/engage/forms/${formId}/settings`, {
      settings: {
        enableAnalytics: settings.enableAnalytics
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating form analytics settings:', error);
    throw error;
  }
};

/**
 * Update survey analytics settings
 * @param {string} surveyId - Survey ID
 * @param {Object} settings - Analytics settings
 * @returns {Promise<any>} Updated survey
 */
export const updateSurveyAnalyticsSettings = async (surveyId: string, settings: { enableAnalytics: boolean }): Promise<any> => {
  try {
    const response = await api.patch(`/engage/surveys/${surveyId}/settings`, {
      settings: {
        enableAnalytics: settings.enableAnalytics
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating survey analytics settings:', error);
    throw error;
  }
};
