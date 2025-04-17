import api from '../api';
import { Activity, ActivitiesResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all activities
 */
export const getActivities = async (
  entityType?: string,
  entityId?: string,
  limit?: number
): Promise<ActivitiesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {};
    if (entityType) params.entityType = entityType;
    if (entityId) params.entityId = entityId;
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
};

/**
 * Get activities for a specific product
 */
export const getProductActivities = async (productId: string, limit?: number): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      entityType: 'product',
      entityId: productId
    };
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data.activities;
  } catch (error) {
    console.error(`Error fetching activities for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get activities for a specific category
 */
export const getCategoryActivities = async (categoryId: string, limit?: number): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      entityType: 'category',
      entityId: categoryId
    };
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data.activities;
  } catch (error) {
    console.error(`Error fetching activities for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Get activities for a specific family
 */
export const getFamilyActivities = async (familyId: string, limit?: number): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      entityType: 'family',
      entityId: familyId
    };
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data.activities;
  } catch (error) {
    console.error(`Error fetching activities for family ${familyId}:`, error);
    throw error;
  }
};

/**
 * Get activities for a specific attribute
 */
export const getAttributeActivities = async (attributeId: string, limit?: number): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      entityType: 'attribute',
      entityId: attributeId
    };
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data.activities;
  } catch (error) {
    console.error(`Error fetching activities for attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Get activities for a specific section
 */
export const getSectionActivities = async (sectionId: string, limit?: number): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      entityType: 'section',
      entityId: sectionId
    };
    if (limit) params.limit = limit;
    
    const response = await api.get(`/products/activity/${companyId}`, { params });
    return response.data.activities;
  } catch (error) {
    console.error(`Error fetching activities for section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Get activity statistics
 */
export const getActivityStatistics = async (): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/activity/${companyId}/statistics`);
    return response.data;
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    throw error;
  }
};

/**
 * Create a custom activity
 */
export const createActivity = async (activity: Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Activity> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/activity/${companyId}`, activity);
    return response.data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

/**
 * Get recent activities dashboard
 */
export const getRecentActivities = async (limit: number = 10): Promise<Activity[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/activity/${companyId}/recent`, {
      params: { limit }
    });
    return response.data.activities;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
};

/**
 * Get activity feed for dashboard
 */
export const getActivityFeed = async (
  page: number = 1,
  limit: number = 20,
  entityType?: string
): Promise<ActivitiesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params: Record<string, string | number> = {
      page,
      limit
    };
    if (entityType) params.entityType = entityType;
    
    const response = await api.get(`/products/activity/${companyId}/feed`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    throw error;
  }
};
