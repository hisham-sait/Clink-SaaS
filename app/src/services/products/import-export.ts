import api from '../api';
import { ImportResult } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Import products from CSV file
 */
export const importProducts = async (file: File): Promise<ImportResult> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/products/import-export/${companyId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing products:', error);
    throw error;
  }
};

/**
 * Export products to CSV
 */
export const exportProducts = async (
  categoryId?: string,
  familyId?: string,
  format: 'csv' | 'excel' = 'csv'
): Promise<Blob> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    if (familyId) params.append('familyId', familyId);
    params.append('format', format);
    
    const response = await api.get(`/products/import-export/${companyId}/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting products:', error);
    throw error;
  }
};

/**
 * Download import template
 */
export const downloadImportTemplate = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const companyId = getCurrentCompanyId();
    
    const response = await api.get(`/products/import-export/${companyId}/import-template?format=${format}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error downloading import template:', error);
    throw error;
  }
};

/**
 * Get import history
 */
export const getImportHistory = async (): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/import-export/${companyId}/history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching import history:', error);
    throw error;
  }
};

/**
 * Get import details
 */
export const getImportDetails = async (importId: string): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/import-export/${companyId}/history/${importId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching import details for ${importId}:`, error);
    throw error;
  }
};

/**
 * Export categories to CSV
 */
export const exportCategories = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const companyId = getCurrentCompanyId();
    
    const response = await api.get(`/products/import-export/${companyId}/export-categories?format=${format}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting categories:', error);
    throw error;
  }
};

/**
 * Import categories from CSV file
 */
export const importCategories = async (file: File): Promise<ImportResult> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/products/import-export/${companyId}/import-categories`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing categories:', error);
    throw error;
  }
};

/**
 * Export families to CSV
 */
export const exportFamilies = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const companyId = getCurrentCompanyId();
    
    const response = await api.get(`/products/import-export/${companyId}/export-families?format=${format}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting families:', error);
    throw error;
  }
};

/**
 * Import families from CSV file
 */
export const importFamilies = async (file: File): Promise<ImportResult> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/products/import-export/${companyId}/import-families`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing families:', error);
    throw error;
  }
};

/**
 * Export attributes to CSV
 */
export const exportAttributes = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const companyId = getCurrentCompanyId();
    
    const response = await api.get(`/products/import-export/${companyId}/export-attributes?format=${format}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting attributes:', error);
    throw error;
  }
};

/**
 * Import attributes from CSV file
 */
export const importAttributes = async (file: File): Promise<ImportResult> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post(`/products/import-export/${companyId}/import-attributes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing attributes:', error);
    throw error;
  }
};

/**
 * Download a file
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  URL.revokeObjectURL(url);
};
