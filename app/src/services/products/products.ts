import api from '../api';
import { Product, ProductQueryParams, ProductsResponse, PaginatedResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all products with optional filtering
 */
export const getProducts = async (params?: ProductQueryParams): Promise<ProductsResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Build query parameters
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params?.familyId) queryParams.append('familyId', params.familyId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.order) queryParams.append('order', params.order);
    
    const response = await api.get(`/products/products/${companyId}?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Get a single product by ID
 */
export const getProduct = async (id: string): Promise<Product> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/products/${companyId}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new product
 */
export const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Product> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/products/${companyId}`, product);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/products/${companyId}/${id}`, product);
    return response.data;
  } catch (error) {
    console.error(`Error updating product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/products/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting product with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Bulk edit products
 */
export const bulkEditProducts = async (ids: string[], data: Partial<Product>): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/products/${companyId}/bulk-edit`, {
      ids,
      data
    });
  } catch (error) {
    console.error('Error bulk editing products:', error);
    throw error;
  }
};

/**
 * Bulk delete products
 */
export const bulkDeleteProducts = async (ids: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/products/${companyId}/bulk-delete`, {
      ids
    });
  } catch (error) {
    console.error('Error bulk deleting products:', error);
    throw error;
  }
};

/**
 * Get product attributes
 */
export const getProductAttributes = async (productId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/products/${companyId}/${productId}/attributes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attributes for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Update product attributes
 */
export const updateProductAttributes = async (productId: string, attributes: any[]): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/products/${companyId}/${productId}/attributes`, { attributes });
    return response.data;
  } catch (error) {
    console.error(`Error updating attributes for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Get product media
 */
export const getProductMedia = async (productId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/media/${companyId}/${productId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching media for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Upload product media
 */
export const uploadProductMedia = async (productId: string, file: File, metadata?: any): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const formData = new FormData();
    formData.append('file', file);
    
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }
    
    const response = await api.post(`/products/media/${companyId}/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error uploading media for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Delete product media
 */
export const deleteProductMedia = async (productId: string, mediaId: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/media/${companyId}/${productId}/${mediaId}`);
  } catch (error) {
    console.error(`Error deleting media ${mediaId} for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Update product media metadata
 */
export const updateProductMediaMetadata = async (productId: string, mediaId: string, metadata: any): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/media/${companyId}/${productId}/${mediaId}`, metadata);
    return response.data;
  } catch (error) {
    console.error(`Error updating media metadata for product ${productId}:`, error);
    throw error;
  }
};
