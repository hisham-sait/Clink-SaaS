import axios from 'axios';
import { handleApiError } from '.';

const API_URL = 'http://localhost:3000/api/links/analytics';

/**
 * Get summary analytics for dashboard
 */
export const getSummaryAnalytics = async (): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(`${API_URL}/summary`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch analytics summary');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get recent activity for dashboard
 */
export const getRecentActivity = async (limit: number = 5): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(`${API_URL}/activity?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get detailed analytics with charts and data
 */
export const getDetailedAnalytics = async (params?: { startDate?: string; endDate?: string; }): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const response = await axios.get(`${API_URL}?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch detailed analytics');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get recent clicks for all links
 */
export const getRecentClicks = async (page: number = 1, limit: number = 10): Promise<any> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(`${API_URL}/recent-clicks?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return {
        clicks: response.data.data,
        pagination: response.data.pagination
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch recent clicks');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
