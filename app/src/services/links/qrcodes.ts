import axios from 'axios';
import { LinksTypes } from '.';
import { handleApiError } from '.';

const API_URL = 'http://localhost:3000/api/links/qrcodes';

/**
 * Get QR codes with optional filtering
 */
export const getQRCodes = async (params?: LinksTypes.LinkQueryParams): Promise<LinksTypes.QRCodesResponse> => {
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
      return {
        qrCodes: response.data.data,
        total: response.data.pagination.totalCount,
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        totalPages: response.data.pagination.totalPages
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch QR codes');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get a QR code by ID
 */
export const getQRCode = async (id: string): Promise<LinksTypes.QRCode> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.get(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch QR code');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Create a new QR code
 */
export const createQRCode = async (qrCode: Partial<LinksTypes.QRCode>): Promise<LinksTypes.QRCode> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.post(API_URL, qrCode, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to create QR code');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Update an existing QR code
 */
export const updateQRCode = async (id: string, qrCode: Partial<LinksTypes.QRCode>): Promise<LinksTypes.QRCode> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.put(`${API_URL}/${id}`, qrCode, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to update QR code');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Delete a QR code
 */
export const deleteQRCode = async (id: string): Promise<void> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await axios.delete(`${API_URL}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete QR code');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Get analytics for a QR code
 */
export const getQRCodeAnalytics = async (id: string, params?: { startDate?: string; endDate?: string; }): Promise<any> => {
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

    const response = await axios.get(`${API_URL}/${id}/analytics?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch QR code analytics');
    }
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

/**
 * Generate a QR code image
 */
export const generateQRCode = async (content: string, options?: LinksTypes.QRCodeOptions): Promise<LinksTypes.QRCodeResponse> => {
  try {
    // Use the QR_monkey library to generate a QR code
    // This is a placeholder for the actual implementation
    // In a real implementation, we would use the QR_monkey library to generate the QR code
    
    // For now, we'll use a simple API to generate a QR code
    const size = options?.size || 200;
    const color = options?.color || '000000';
    const backgroundColor = options?.backgroundColor || 'FFFFFF';
    const margin = options?.margin || 1;
    const errorCorrectionLevel = options?.errorCorrectionLevel || 'M';
    
    const url = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(content)}&size=${size}x${size}&color=${color}&bgcolor=${backgroundColor}&margin=${margin}&ecc=${errorCorrectionLevel}`;
    
    return {
      url,
      dataUrl: url // In a real implementation, we would convert the image to a data URL
    };
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
};
