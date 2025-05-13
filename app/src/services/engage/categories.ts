import api from '../api';
import { FormCategory, PageCategory, FormCategoriesResponse, PageCategoriesResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all categories (form and page)
 */
export const getCategories = async (): Promise<{ categories: any[] }> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Get all categories
    const response = await api.get(`/engage/categories/${companyId}`);
    
    // Standardized response handling
    const data = response.data.data || response.data;
    
    // Ensure we return an object with a categories property that's an array
    if (data && Array.isArray(data)) {
      return { categories: data };
    } else if (data && data.categories && Array.isArray(data.categories)) {
      return data;
    } else {
      console.warn('Unexpected response format from categories API:', data);
      return { categories: [] };
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Create a new category (form or page)
 */
export const createCategory = async (category: { name: string, type: string }): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    
    // Create the category based on type
    const response = await api.post(`/engage/categories/${companyId}`, category);
    
    // Standardized response handling
    const createdCategory = response.data.data || response.data;
    return createdCategory;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Form Categories

/**
 * Get all form categories
 */
export const getFormCategories = async (): Promise<FormCategoriesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/categories/${companyId}`);
    
    // Standardized response handling
    const data = response.data.data || response.data;
    
    // Ensure we return an object with a categories property that's an array
    if (data && Array.isArray(data)) {
      return { categories: data, total: data.length };
    } else if (data && data.categories && Array.isArray(data.categories)) {
      return data;
    } else {
      console.warn('Unexpected response format from form categories API:', data);
      return { categories: [], total: 0 };
    }
  } catch (error) {
    console.error('Error fetching form categories:', error);
    throw error;
  }
};

/**
 * Get a single form category by ID
 */
export const getFormCategory = async (id: string): Promise<FormCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/categories/${companyId}/${id}`);
    
    // Standardized response handling
    const category = response.data.data || response.data;
    return category;
  } catch (error) {
    console.error(`Error fetching form category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new form category
 */
export const createFormCategory = async (category: Omit<FormCategory, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<FormCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/engage/forms/categories/${companyId}`, category);
    
    // Standardized response handling
    const createdCategory = response.data.data || response.data;
    return createdCategory;
  } catch (error) {
    console.error('Error creating form category:', error);
    throw error;
  }
};

/**
 * Update an existing form category
 */
export const updateFormCategory = async (id: string, category: Partial<FormCategory>): Promise<FormCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/engage/forms/categories/${companyId}/${id}`, category);
    
    // Standardized response handling
    const updatedCategory = response.data.data || response.data;
    return updatedCategory;
  } catch (error) {
    console.error(`Error updating form category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a form category
 */
export const deleteFormCategory = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/engage/forms/categories/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting form category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get forms in a category
 */
export const getFormCategoryItems = async (categoryId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/categories/${companyId}/${categoryId}/forms`);
    
    // Standardized response handling that ensures we return an array
    const forms = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(forms) ? forms : [];
  } catch (error) {
    console.error(`Error fetching forms for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Reorder form categories
 */
export const reorderFormCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/engage/forms/categories/${companyId}/reorder`, { categoryIds });
  } catch (error) {
    console.error('Error reordering form categories:', error);
    throw error;
  }
};

/**
 * Get form category tree (hierarchical structure)
 */
export const getFormCategoryTree = async (): Promise<FormCategory[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/categories/${companyId}/tree`);
    
    // Standardized response handling that ensures we return an array
    const categories = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(categories) ? categories : [];
  } catch (error) {
    console.error('Error fetching form category tree:', error);
    throw error;
  }
};

/**
 * Bulk update form categories
 */
export const bulkUpdateFormCategories = async (categories: Array<{ id: string } & Partial<FormCategory>>): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/engage/forms/categories/${companyId}/bulk-update`, { categories });
  } catch (error) {
    console.error('Error bulk updating form categories:', error);
    throw error;
  }
};

/**
 * Bulk delete form categories
 */
export const bulkDeleteFormCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/engage/forms/categories/${companyId}/bulk-delete`, { categoryIds });
  } catch (error) {
    console.error('Error bulk deleting form categories:', error);
    throw error;
  }
};


// Page Categories

/**
 * Get all page categories
 */
export const getPageCategories = async (): Promise<PageCategoriesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/pages/categories/${companyId}`);
    
    // Standardized response handling
    const data = response.data.data || response.data;
    
    // Ensure we return an object with a categories property that's an array
    if (data && Array.isArray(data)) {
      return { categories: data, total: data.length };
    } else if (data && data.categories && Array.isArray(data.categories)) {
      return data;
    } else {
      console.warn('Unexpected response format from page categories API:', data);
      return { categories: [], total: 0 };
    }
  } catch (error) {
    console.error('Error fetching page categories:', error);
    throw error;
  }
};

/**
 * Get a single page category by ID
 */
export const getPageCategory = async (id: string): Promise<PageCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/pages/categories/${companyId}/${id}`);
    
    // Standardized response handling
    const category = response.data.data || response.data;
    return category;
  } catch (error) {
    console.error(`Error fetching page category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new page category
 */
export const createPageCategory = async (category: Omit<PageCategory, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<PageCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/engage/pages/categories/${companyId}`, category);
    
    // Standardized response handling
    const createdCategory = response.data.data || response.data;
    return createdCategory;
  } catch (error) {
    console.error('Error creating page category:', error);
    throw error;
  }
};

/**
 * Update an existing page category
 */
export const updatePageCategory = async (id: string, category: Partial<PageCategory>): Promise<PageCategory> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/engage/pages/categories/${companyId}/${id}`, category);
    
    // Standardized response handling
    const updatedCategory = response.data.data || response.data;
    return updatedCategory;
  } catch (error) {
    console.error(`Error updating page category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a page category
 */
export const deletePageCategory = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/engage/pages/categories/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting page category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get pages in a category
 */
export const getPageCategoryItems = async (categoryId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/pages/${companyId}?categoryId=${categoryId}`);
    
    // Standardized response handling that ensures we return an array
    const pages = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(pages) ? pages : [];
  } catch (error) {
    console.error(`Error fetching pages for category ${categoryId}:`, error);
    throw error;
  }
};

// Form Types

/**
 * Get all form types
 */
export const getFormTypes = async (): Promise<string[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/types/${companyId}`);
    
    // Standardized response handling that ensures we return an array
    const types = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(types) ? types : [];
  } catch (error) {
    console.error('Error fetching form types:', error);
    throw error;
  }
};

/**
 * Get forms by type
 */
export const getFormsByType = async (type: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/engage/forms/types/${companyId}/${type}`);
    
    // Standardized response handling that ensures we return an array
    const forms = response.data.data || response.data;
    
    // Ensure we return an array even if the response is not an array
    return Array.isArray(forms) ? forms : [];
  } catch (error) {
    console.error(`Error fetching forms for type ${type}:`, error);
    throw error;
  }
};
