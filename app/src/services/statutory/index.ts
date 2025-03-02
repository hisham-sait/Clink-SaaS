import axios from 'axios';

const API_BASE_URL = '/api/statutory';

// Get the current user's company ID from localStorage
const getCurrentCompanyId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.companyId || 'cm70wz3b70003v9d6nlw8ts7u'; // Fallback to test company ID
  } catch {
    return 'cm70wz3b70003v9d6nlw8ts7u'; // Fallback to test company ID
  }
};

// Configure axios interceptor to always use latest token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  config.headers['Content-Type'] = 'application/json';
  return config;
}, error => {
  return Promise.reject(error);
});

export interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  entity: string;
}

export interface ActivityStats {
  totalActivities: number;
  activityByType: { [key: string]: number };
  activityByEntity: { [key: string]: number };
}

export const getActivities = async (params?: { limit?: number }) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/activities`, {
      params: { companyId, ...params }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    return { activities: [], total: 0 };
  }
};

export const getActivityStatistics = async () => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/activities/statistics`, {
      params: { companyId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching activity statistics:', error);
    return { totalActivities: 0, activityByType: {}, activityByEntity: {} };
  }
};

export const getDirectors = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/directors`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching directors:', error);
    return { directors: [], count: 0 };
  }
};

export const getShareholders = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/shareholders`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shareholders:', error);
    return { shareholders: [], count: 0 };
  }
};

export const getShares = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/shares`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching shares:', error);
    return { shares: [], count: 0 };
  }
};

export const getBeneficialOwners = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/beneficial-owners`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching beneficial owners:', error);
    return { beneficialOwners: [], count: 0 };
  }
};

export const getCharges = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/charges`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching charges:', error);
    return { charges: [], count: 0 };
  }
};

export const getAllotments = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/allotments`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching allotments:', error);
    return { allotments: [], count: 0 };
  }
};

export const getMeetings = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/meetings`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return { meetings: [], count: 0 };
  }
};

export const getBoardMinutes = async (status?: string) => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/board-minutes`, {
      params: { companyId, status }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching board minutes:', error);
    return { boardMinutes: [], count: 0 };
  }
};

export const downloadSummary = async () => {
  const companyId = getCurrentCompanyId();
  try {
    const response = await axios.get(`${API_BASE_URL}/summary`, {
      params: { companyId },
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading summary:', error);
    throw error;
  }
};
