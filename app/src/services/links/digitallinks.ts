import api from '../api';
import { DigitalLink, DigitalLinksResponse, LinkQueryParams } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all digital links with optional filtering
 */
export const getDigitalLinks = async (params?: LinkQueryParams): Promise<DigitalLinksResponse> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const response = await api.get(`/links/digitallinks?${queryParams.toString()}`);
    
    // Standardized response handling
    if (response.data && response.data.data) {
      // Backend returns { data: [...], total: number, page: number, ... }
      return {
        digitalLinks: response.data.data,
        total: response.data.total || response.data.data.length,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.data.length) / (response.data.limit || 10))
      };
    } else if (response.data && Array.isArray(response.data)) {
      // Backend returns array directly
      return {
        digitalLinks: response.data,
        total: response.data.length,
        page: 1,
        limit: response.data.length,
        totalPages: 1
      };
    } else {
      // Fallback for unexpected response format
      console.warn('Unexpected response format from digital links API:', response.data);
      return {
        digitalLinks: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      };
    }
  } catch (error) {
    console.error('Error fetching digital links:', error);
    throw error;
  }
};

/**
 * Get a single digital link by ID
 */
export const getDigitalLink = async (id: string): Promise<DigitalLink> => {
  try {
    const response = await api.get(`/links/digitallinks/${id}`);
    // Standardized response handling
    const digitalLink = response.data.data || response.data;
    return digitalLink;
  } catch (error) {
    console.error(`Error fetching digital link with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new digital link
 */
export const createDigitalLink = async (digitalLink: Partial<Omit<DigitalLink, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clicks'>>): Promise<DigitalLink> => {
  try {
    // Generate a random link code if not provided
    const linkCode = digitalLink.linkCode || Math.random().toString(36).substring(2, 10);
    
    // Map frontend fields to backend expected fields if needed
    const payload = {
      gs1Key: digitalLink.gs1Key || '',
      gs1KeyType: digitalLink.gs1KeyType || '',
      redirectType: digitalLink.redirectType || 'custom',
      customUrl: digitalLink.redirectType === 'custom' ? digitalLink.customUrl : undefined,
      productId: digitalLink.redirectType === 'standard' ? digitalLink.productId : undefined,
      title: digitalLink.title || 'Untitled',
      description: digitalLink.description,
      tags: digitalLink.tags || [],
      status: digitalLink.status || 'Active',
      expiresAt: digitalLink.expiresAt || null,
      password: digitalLink.password || null,
      categoryId: digitalLink.categoryId || undefined,
      linkCode: linkCode,
      type: digitalLink.type || 'Other'
    };
    
    const response = await api.post('/links/digitallinks', payload);
    // Standardized response handling
    const createdLink = response.data.data || response.data;
    return createdLink;
  } catch (error) {
    console.error('Error creating digital link:', error);
    throw error;
  }
};

/**
 * Update an existing digital link
 */
export const updateDigitalLink = async (id: string, digitalLink: Partial<DigitalLink>): Promise<DigitalLink> => {
  try {
    const response = await api.put(`/links/digitallinks/${id}`, digitalLink);
    // Standardized response handling
    const updatedLink = response.data.data || response.data;
    return updatedLink;
  } catch (error) {
    console.error(`Error updating digital link with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a digital link
 */
export const deleteDigitalLink = async (id: string): Promise<void> => {
  try {
    await api.delete(`/links/digitallinks/${id}`);
  } catch (error) {
    console.error(`Error deleting digital link with ID ${id}:`, error);
    throw error;
  }
};


/**
 * Generate QR code for digital link
 */
export const generateDigitalLinkQRCode = async (
  id: string,
  options?: {
    size?: number;
    color?: string;
    backgroundColor?: string;
    format?: 'png' | 'svg' | 'pdf';
    logo?: string;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  }
): Promise<Blob> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options?.size) queryParams.append('size', options.size.toString());
    if (options?.color) queryParams.append('color', options.color);
    if (options?.backgroundColor) queryParams.append('backgroundColor', options.backgroundColor);
    if (options?.format) queryParams.append('format', options.format);
    if (options?.logo) queryParams.append('logo', options.logo);
    if (options?.errorCorrectionLevel) queryParams.append('errorCorrectionLevel', options.errorCorrectionLevel);
    
    const response = await api.get(`/links/digitallinks/${id}/qrcode?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error generating QR code for digital link ${id}:`, error);
    throw error;
  }
};

/**
 * Bulk create digital links
 */
export const bulkCreateDigitalLinks = async (
  digitalLinks: Array<Omit<DigitalLink, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clicks'>>
): Promise<DigitalLink[]> => {
  try {
    const response = await api.post('/links/digitallinks/bulk-create', { digitalLinks });
    // Standardized response handling
    const links = response.data.data || response.data;
    return links;
  } catch (error) {
    console.error('Error bulk creating digital links:', error);
    throw error;
  }
};

/**
 * Bulk update digital links
 */
export const bulkUpdateDigitalLinks = async (
  digitalLinks: Array<{ id: string } & Partial<DigitalLink>>
): Promise<void> => {
  try {
    await api.post('/links/digitallinks/bulk-update', { digitalLinks });
  } catch (error) {
    console.error('Error bulk updating digital links:', error);
    throw error;
  }
};

/**
 * Bulk delete digital links
 */
export const bulkDeleteDigitalLinks = async (ids: string[]): Promise<void> => {
  try {
    await api.post('/links/digitallinks/bulk-delete', { ids });
  } catch (error) {
    console.error('Error bulk deleting digital links:', error);
    throw error;
  }
};

/**
 * Export digital links to CSV
 */
export const exportDigitalLinks = async (
  categoryId?: string,
  format: 'csv' | 'excel' = 'csv'
): Promise<Blob> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    params.append('format', format);
    
    const response = await api.get(`/links/digitallinks/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting digital links:', error);
    throw error;
  }
};

/**
 * Import digital links from CSV file
 */
export const importDigitalLinks = async (file: File): Promise<any> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/links/digitallinks/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing digital links:', error);
    throw error;
  }
};

/**
 * Get digital link by link code
 */
export const getDigitalLinkByCode = async (linkCode: string): Promise<DigitalLink> => {
  try {
    const response = await api.get(`/links/resolver/d/${linkCode}/info`);
    // Standardized response handling
    const link = response.data.data || response.data;
    return link;
  } catch (error) {
    console.error(`Error fetching digital link with code ${linkCode}:`, error);
    throw error;
  }
};

/**
 * Get digital links for product
 */
export const getDigitalLinksForProduct = async (productId: string): Promise<DigitalLink[]> => {
  try {
    const response = await api.get(`/links/digitallinks/product/${productId}`);
    // Standardized response handling
    const links = response.data.data || response.data;
    return links;
  } catch (error) {
    console.error(`Error fetching digital links for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Generate batch of digital links for products
 */
export const generateBatchDigitalLinks = async (
  productIds: string[],
  type: string,
  categoryId?: string
): Promise<DigitalLink[]> => {
  try {
    const response = await api.post('/links/digitallinks/batch-generate', {
      productIds,
      type,
      categoryId
    });
    // Standardized response handling
    const links = response.data.data || response.data;
    return links;
  } catch (error) {
    console.error('Error generating batch digital links:', error);
    throw error;
  }
};
