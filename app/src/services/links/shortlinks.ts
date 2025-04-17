import api from '../api';
import { ShortLink, ShortLinksResponse, LinkQueryParams } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all short links with optional filtering
 */
export const getShortLinks = async (params?: LinkQueryParams): Promise<ShortLinksResponse> => {
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
    
    const response = await api.get(`/links/shortlinks?${queryParams.toString()}`);
    
    // Transform the response to match the expected format
    if (response.data && response.data.data) {
      return {
        shortLinks: response.data.data,
        total: response.data.total || response.data.data.length,
        page: response.data.page || 1,
        limit: response.data.limit || 10,
        totalPages: response.data.totalPages || Math.ceil((response.data.total || response.data.data.length) / (response.data.limit || 10))
      };
    }
    
    return {
      shortLinks: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  } catch (error) {
    console.error('Error fetching short links:', error);
    throw error;
  }
};

/**
 * Get a single short link by ID
 */
export const getShortLink = async (id: string): Promise<ShortLink> => {
  try {
    const response = await api.get(`/links/shortlinks/${id}`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching short link with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new short link
 */
export const createShortLink = async (shortLink: Omit<ShortLink, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clicks'>): Promise<ShortLink> => {
  try {
    // Map frontend fields to backend expected fields if needed
    const payload = {
      originalUrl: shortLink.originalUrl,
      shortCode: shortLink.shortCode || undefined,
      title: shortLink.title,
      status: shortLink.status,
      expiresAt: shortLink.expiresAt,
      password: shortLink.password || undefined,
      categoryId: shortLink.categoryId || undefined // Convert empty string to undefined
    };
    
    const response = await api.post('/links/shortlinks', payload);
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error creating short link:', error);
    throw error;
  }
};

/**
 * Update an existing short link
 */
export const updateShortLink = async (id: string, shortLink: Partial<ShortLink>): Promise<ShortLink> => {
  try {
    const response = await api.put(`/links/shortlinks/${id}`, shortLink);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error updating short link with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a short link
 */
export const deleteShortLink = async (id: string): Promise<void> => {
  try {
    await api.delete(`/links/shortlinks/${id}`);
  } catch (error) {
    console.error(`Error deleting short link with ID ${id}:`, error);
    throw error;
  }
};


/**
 * Generate QR code for short link
 */
export const generateShortLinkQRCode = async (
  id: string,
  options?: {
    size?: number;
    color?: string;
    backgroundColor?: string;
    format?: 'png' | 'svg' | 'pdf';
  }
): Promise<Blob> => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (options?.size) queryParams.append('size', options.size.toString());
    if (options?.color) queryParams.append('color', options.color);
    if (options?.backgroundColor) queryParams.append('backgroundColor', options.backgroundColor);
    if (options?.format) queryParams.append('format', options.format);
    
    const response = await api.get(`/links/shortlinks/${id}/qrcode?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error generating QR code for short link ${id}:`, error);
    throw error;
  }
};

/**
 * Bulk create short links
 */
export const bulkCreateShortLinks = async (
  shortLinks: Array<Omit<ShortLink, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'clicks'>>
): Promise<ShortLink[]> => {
  try {
    const response = await api.post('/links/shortlinks/bulk-create', { shortLinks });
    return response.data.data || response.data;
  } catch (error) {
    console.error('Error bulk creating short links:', error);
    throw error;
  }
};

/**
 * Bulk update short links
 */
export const bulkUpdateShortLinks = async (
  shortLinks: Array<{ id: string } & Partial<ShortLink>>
): Promise<void> => {
  try {
    await api.post('/links/shortlinks/bulk-update', { shortLinks });
  } catch (error) {
    console.error('Error bulk updating short links:', error);
    throw error;
  }
};

/**
 * Bulk delete short links
 */
export const bulkDeleteShortLinks = async (ids: string[]): Promise<void> => {
  try {
    await api.post('/links/shortlinks/bulk-delete', { ids });
  } catch (error) {
    console.error('Error bulk deleting short links:', error);
    throw error;
  }
};

/**
 * Export short links to CSV
 */
export const exportShortLinks = async (
  categoryId?: string,
  format: 'csv' | 'excel' = 'csv'
): Promise<Blob> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (categoryId) params.append('categoryId', categoryId);
    params.append('format', format);
    
    const response = await api.get(`/links/shortlinks/export?${params.toString()}`, {
      responseType: 'blob'
    });
    
    return response.data;
  } catch (error) {
    console.error('Error exporting short links:', error);
    throw error;
  }
};

/**
 * Import short links from CSV file
 */
export const importShortLinks = async (file: File): Promise<any> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/links/shortlinks/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error importing short links:', error);
    throw error;
  }
};

/**
 * Get short link by short code
 */
export const getShortLinkByCode = async (shortCode: string): Promise<ShortLink> => {
  try {
    const response = await api.get(`/links/resolver/s/${shortCode}/info`);
    return response.data.data || response.data;
  } catch (error) {
    console.error(`Error fetching short link with code ${shortCode}:`, error);
    throw error;
  }
};

/**
 * Helper function to build a short link URL
 */
export const buildShortLinkUrl = (shortCode: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/s/${shortCode}`;
};

/**
 * Helper function to generate a QR code URL for a short link
 */
export const generateQRCodeUrl = (url: string, options: any = {}): string => {
  const {
    size = 200,
    color = '000000',
    backgroundColor = 'FFFFFF',
    margin = 1,
    errorCorrectionLevel = 'M'
  } = options;

  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(url)}&size=${size}x${size}&color=${color}&bgcolor=${backgroundColor}&margin=${margin}&ecc=${errorCorrectionLevel}`;
};
