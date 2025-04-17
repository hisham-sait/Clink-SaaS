import api from '../api';
import { Category, CategoriesResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/categories/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategory = async (id: string): Promise<Category> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/categories/${companyId}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Category> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/categories/${companyId}`, category);
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, category: Partial<Category>): Promise<Category> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/categories/${companyId}/${id}`, category);
    return response.data;
  } catch (error) {
    console.error(`Error updating category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/categories/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products in a category
 */
export const getCategoryProducts = async (categoryId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/categories/${companyId}/${categoryId}/products`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/categories/${companyId}/reorder`, { categoryIds });
  } catch (error) {
    console.error('Error reordering categories:', error);
    throw error;
  }
};

/**
 * Move category to a new parent
 */
export const moveCategory = async (categoryId: string, newParentId: string | null): Promise<Category> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/categories/${companyId}/${categoryId}/move`, { 
      parentId: newParentId 
    });
    return response.data;
  } catch (error) {
    console.error(`Error moving category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Get category tree (hierarchical structure)
 */
export const getCategoryTree = async (): Promise<Category[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/categories/${companyId}/tree`);
    return response.data;
  } catch (error) {
    console.error('Error fetching category tree:', error);
    throw error;
  }
};

/**
 * Bulk update categories
 */
export const bulkUpdateCategories = async (categories: Array<{ id: string } & Partial<Category>>): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/categories/${companyId}/bulk-update`, { categories });
  } catch (error) {
    console.error('Error bulk updating categories:', error);
    throw error;
  }
};

/**
 * Bulk delete categories
 */
export const bulkDeleteCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/categories/${companyId}/bulk-delete`, { categoryIds });
  } catch (error) {
    console.error('Error bulk deleting categories:', error);
    throw error;
  }
};
