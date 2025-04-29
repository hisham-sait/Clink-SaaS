import api from '../api';
import { DatasetData, DataRecord, PaginationResponse } from './types';
import { getCurrentCompanyId } from './index';

const API_URL = '/engage';

/**
 * Get all datasets
 * @returns Promise<DatasetData[]>
 */
export const getAllDatasets = async (): Promise<DatasetData[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`${API_URL}/data/${companyId}`);
    
    // Standardized response handling
    const datasets = response.data.data || response.data;
    return datasets;
  } catch (error) {
    console.error('Error fetching datasets:', error);
    return [];
  }
};

/**
 * Get a dataset by ID
 * @param id Dataset ID
 * @returns Promise<DatasetData>
 */
export const getDatasetById = async (id: string): Promise<DatasetData> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`${API_URL}/data/${companyId}/${id}`);
    
    // Standardized response handling
    const dataset = response.data.data || response.data;
    return dataset;
  } catch (error) {
    console.error(`Error fetching dataset ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new dataset
 * @param data Dataset data
 * @returns Promise<DatasetData>
 */
export const createDataset = async (data: Partial<DatasetData>): Promise<DatasetData> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`${API_URL}/data/${companyId}`, data);
    
    // Standardized response handling
    const createdDataset = response.data.data || response.data;
    return createdDataset;
  } catch (error) {
    console.error('Error creating dataset:', error);
    throw error;
  }
};

/**
 * Update a dataset
 * @param id Dataset ID
 * @param data Dataset data
 * @returns Promise<DatasetData>
 */
export const updateDataset = async (id: string, data: Partial<DatasetData>): Promise<DatasetData> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`${API_URL}/data/${companyId}/${id}`, data);
    
    // Standardized response handling
    const updatedDataset = response.data.data || response.data;
    return updatedDataset;
  } catch (error) {
    console.error(`Error updating dataset ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a dataset
 * @param id Dataset ID
 * @returns Promise<void>
 */
export const deleteDataset = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`${API_URL}/data/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting dataset ${id}:`, error);
    throw error;
  }
};

/**
 * Regenerate webhook secret
 * @param id Dataset ID
 * @returns Promise<DatasetData>
 */
export const regenerateWebhookSecret = async (id: string): Promise<DatasetData> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`${API_URL}/data/${companyId}/${id}/regenerate-webhook-secret`);
    
    // Standardized response handling
    const dataset = response.data.data || response.data;
    return dataset;
  } catch (error) {
    console.error(`Error regenerating webhook secret for dataset ${id}:`, error);
    throw error;
  }
};

/**
 * Get records for a dataset
 * @param datasetId Dataset ID
 * @param options Query options
 * @returns Promise<PaginationResponse<DataRecord>>
 */
export const getDatasetRecords = async (
  datasetId: string,
  options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<PaginationResponse<DataRecord>> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`${API_URL}/data/${companyId}/${datasetId}/records`, {
      params: options
    });
    
    // Standardized response handling
    const paginatedResponse = response.data.data || response.data;
    return paginatedResponse;
  } catch (error) {
    console.error(`Error fetching records for dataset ${datasetId}:`, error);
    throw error;
  }
};

/**
 * Add a record to a dataset
 * @param datasetId Dataset ID
 * @param data Record data
 * @returns Promise<DataRecord>
 */
export const addRecord = async (datasetId: string, data: any): Promise<DataRecord> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`${API_URL}/data/${companyId}/${datasetId}/records`, data);
    
    // Standardized response handling
    const record = response.data.data || response.data;
    return record;
  } catch (error) {
    console.error(`Error adding record to dataset ${datasetId}:`, error);
    throw error;
  }
};

/**
 * Upload and import data
 * @param file File to upload
 * @param options Import options
 * @returns Promise<any>
 */
export const importData = async (
  file: File,
  options: {
    datasetId?: string;
    name?: string;
    description?: string;
  } = {}
): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const formData = new FormData();
    formData.append('file', file);
    
    if (options.datasetId) {
      formData.append('datasetId', options.datasetId);
    }
    
    if (options.name) {
      formData.append('name', options.name);
    }
    
    if (options.description) {
      formData.append('description', options.description);
    }
    
    const response = await api.post(`${API_URL}/data/${companyId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    // Standardized response handling
    const result = response.data.data || response.data;
    return result;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};
