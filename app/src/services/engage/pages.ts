import api from '../api';
import { PageData } from './types';
import { getCurrentCompanyId } from './index';

const API_URL = '/engage';

/**
 * Get all pages
 * @param {Object} options - Query options
 * @returns {Promise<PageData[]>} List of pages
 */
export const getAllPages = async (options: any = {}): Promise<PageData[]> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (options.status) queryParams.append('status', options.status);
    if (options.categoryId) queryParams.append('categoryId', options.categoryId);
    if (options.search) queryParams.append('search', options.search);
    if (options.limit) queryParams.append('limit', options.limit.toString());
    if (options.offset) queryParams.append('offset', options.offset.toString());
    if (options.sort) queryParams.append('sort', options.sort);
    if (options.order) queryParams.append('order', options.order);
    
    const url = queryParams.toString() ? `${API_URL}/pages?${queryParams.toString()}` : `${API_URL}/pages`;
    try {
      const response = await api.get(url);
      
      // Standardized response handling that ensures we return an array
      const pagesData = response.data.data || response.data;
      
      // Ensure we return an array even if the response is not an array
      return Array.isArray(pagesData) ? pagesData : [];
    } catch (err: any) {
      // If we get a 401 or 404, return an empty array
      // This can happen if the Page model doesn't exist yet in the database
      if (err.response && (err.response.status === 401 || err.response.status === 404)) {
        console.warn('Pages API not available yet, returning empty array');
        return [];
      }
      throw err;
    }
  } catch (error) {
    console.error('Error fetching pages:', error);
    throw error;
  }
};

/**
 * Get a page by ID
 * @param {string} id - The page ID
 * @returns {Promise<PageData>} The page data
 */
export const getPageById = async (id: string): Promise<PageData> => {
  try {
    const response = await api.get(`${API_URL}/pages/${id}`);
    
    // Standardized response handling
    const pageData = response.data.data || response.data;
    return pageData;
  } catch (error) {
    console.error(`Error fetching page with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new page
 * @param {Partial<PageData>} pageData - The page data
 * @returns {Promise<PageData>} The created page
 */
export const createPage = async (pageData: Partial<PageData>): Promise<PageData> => {
  try {
    // Ensure pageData has the required properties
    const pageDataWithDefaults = {
      ...pageData,
      sections: pageData.sections || [],
      settings: pageData.settings || {},
      appearance: pageData.appearance || {}
    };
    
    const response = await api.post(`${API_URL}/pages`, pageDataWithDefaults);
    
    // Standardized response handling
    const createdPage = response.data.data || response.data;
    return createdPage;
  } catch (error) {
    console.error('Error creating page:', error);
    throw error;
  }
};

/**
 * Update a page
 * @param {string} id - The page ID
 * @param {Partial<PageData>} pageData - The page data to update
 * @returns {Promise<PageData>} The updated page
 */
export const updatePage = async (id: string, pageData: Partial<PageData>): Promise<PageData> => {
  try {
    const response = await api.put(`${API_URL}/pages/${id}`, pageData);
    
    // Standardized response handling
    const updatedPage = response.data.data || response.data;
    return updatedPage;
  } catch (error) {
    console.error(`Error updating page with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a page
 * @param {string} id - The page ID
 * @returns {Promise<void>}
 */
export const deletePage = async (id: string): Promise<void> => {
  try {
    await api.delete(`${API_URL}/pages/${id}`);
  } catch (error) {
    console.error(`Error deleting page with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Record a page view
 * @param {string} id - The page ID
 * @param {Object} metadata - Optional metadata about the view
 * @returns {Promise<void>}
 */
export const recordPageView = async (id: string, metadata: any = {}): Promise<void> => {
  try {
    await api.post(`${API_URL}/pages/${id}/view`, { metadata });
  } catch (error) {
    console.error(`Error recording view for page with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get page views
 * @param {string} id - The page ID
 * @returns {Promise<any[]>} The page views
 */
export const getPageViews = async (id: string): Promise<any[]> => {
  try {
    const response = await api.get(`${API_URL}/pages/${id}/views`);
    
    // Standardized response handling that ensures we return an array
    const views = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(views) ? views : [];
  } catch (error) {
    console.error(`Error fetching views for page with ID ${id}:`, error);
    throw error;
  }
};
