import api from '../api';
import { AxiosResponse } from 'axios';

export interface InsightReport {
  id: string;
  title: string;
  description?: string;
  dashboardId: string;
  status: string;
  companyId: string;
  createdById?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsightReportView {
  id: string;
  reportId: string;
  visitorId?: string;
  device?: string;
  browser?: string;
  location?: string;
  referrer?: string;
  timeOnPage?: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportData {
  title: string;
  description?: string;
  dashboardId: string;
  status?: string;
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  dashboardId?: string;
  status?: string;
}

export interface RecordViewData {
  visitorId?: string;
  device?: string;
  browser?: string;
  location?: string;
  referrer?: string;
  timeOnPage?: number;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Get all reports
 */
export const getAllReports = async (): Promise<InsightReport[]> => {
  try {
    const response: AxiosResponse<InsightReport[]> = await api.get('/insights/reports');
    return response.data;
  } catch (error) {
    console.error('Error fetching reports:', error);
    throw error;
  }
};

/**
 * Get a report by ID
 */
export const getReportById = async (id: string): Promise<InsightReport> => {
  try {
    const response: AxiosResponse<InsightReport> = await api.get(`/insights/reports/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching report ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new report
 */
export const createReport = async (data: CreateReportData): Promise<InsightReport> => {
  try {
    const response: AxiosResponse<InsightReport> = await api.post('/insights/reports', data);
    return response.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

/**
 * Update a report
 */
export const updateReport = async (id: string, data: UpdateReportData): Promise<InsightReport> => {
  try {
    const response: AxiosResponse<InsightReport> = await api.put(`/insights/reports/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating report ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a report
 */
export const deleteReport = async (id: string): Promise<void> => {
  try {
    await api.delete(`/insights/reports/${id}`);
  } catch (error) {
    console.error(`Error deleting report ${id}:`, error);
    throw error;
  }
};

/**
 * Record a view for a report
 */
export const recordReportView = async (id: string, data: RecordViewData): Promise<InsightReportView> => {
  try {
    const response: AxiosResponse<InsightReportView> = await api.post(`/insights/reports/${id}/view`, data);
    return response.data;
  } catch (error) {
    console.error(`Error recording view for report ${id}:`, error);
    throw error;
  }
};

/**
 * Get views for a report
 */
export const getReportViews = async (id: string): Promise<InsightReportView[]> => {
  try {
    const response: AxiosResponse<InsightReportView[]> = await api.get(`/insights/reports/${id}/views`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching views for report ${id}:`, error);
    throw error;
  }
};

/**
 * Get a guest token for a dashboard
 */
export const getSupersetGuestToken = async (dashboardId: string): Promise<string> => {
  try {
    const response = await api.post('/insights/superset/guest-token', { dashboardId });
    return response.data.token;
  } catch (error) {
    console.error(`Error getting access token for dashboard ${dashboardId}:`, error);
    throw new Error('Unable to access dashboard service. Please try again later.');
  }
};

/**
 * Get all available dashboards from Superset
 */
export interface SupersetDashboard {
  id: string;
  title: string;
  url?: string;
  status?: string;
}

export const getAvailableDashboards = async (): Promise<SupersetDashboard[]> => {
  try {
    const response = await api.get('/insights/superset/dashboards');
    return response.data;
  } catch (error) {
    console.error('Error fetching available dashboards:', error);
    throw new Error('Unable to fetch dashboards. Please try again later.');
  }
};

// Export all functions as a service
const InsightsService = {
  getAllReports,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
  recordReportView,
  getReportViews,
  getSupersetGuestToken,
  getAvailableDashboards
};

export default InsightsService;
