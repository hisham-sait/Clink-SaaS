import api from '../api';
import { Category, CategoriesResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get('/links/categories');
    
    // Transform the response to match the expected format
    // The backend returns { success: true, data: [...] }
    // But the frontend expects { categories: [...], total: number }
    if (response.data && response.data.success && response.data.data) {
      const categories = response.data.data.map((category: any) => ({
        ...category,
        status: category.status || 'Active'
      }));
      
      return {
        categories,
        total: categories.length
      };
    }
    
    // Fallback in case the response format is different
    if (response.data && response.data.categories) {
      response.data.categories = response.data.categories.map((category: any) => ({
        ...category,
        status: category.status || 'Active'
      }));
      
      return response.data;
    }
    
    // If we can't find categories in the expected places, return an empty result
    console.warn('Unexpected response format from categories API:', response.data);
    return {
      categories: [],
      total: 0
    };
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
    const response = await api.get(`/links/categories/${id}`);
    
    // Add status field if it doesn't exist
    if (response.data && response.data.data) {
      response.data.data.status = response.data.data.status || 'Active';
    }
    
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new category
 */
export const createCategory = async (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'linkCount'>): Promise<Category> => {
  try {
    // Remove status field as it's not in the database schema
    const { status, ...categoryData } = category;
    
    const response = await api.post('/links/categories', categoryData);
    
    // Add status field to the response
    if (response.data && response.data.data) {
      response.data.data.status = 'Active';
    }
    
    return response.data.data;
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
    // Remove status field as it's not in the database schema
    const { status, ...categoryData } = category;
    
    const response = await api.put(`/links/categories/${id}`, categoryData);
    
    // Add status field to the response
    if (response.data && response.data.data) {
      response.data.data.status = 'Active';
    }
    
    return response.data.data;
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
    await api.delete(`/links/categories/${id}`);
  } catch (error) {
    console.error(`Error deleting category with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get links in a category
 */
export const getCategoryLinks = async (categoryId: string, type?: 'ShortLink' | 'DigitalLink'): Promise<any[]> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    
    const response = await api.get(`/links/categories/${categoryId}/links?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching links for category ${categoryId}:`, error);
    throw error;
  }
};

/**
 * Reorder categories
 */
export const reorderCategories = async (categoryIds: string[]): Promise<void> => {
  try {
    await api.post('/links/categories/reorder', { categoryIds });
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
    const response = await api.put(`/links/categories/${categoryId}/move`, { 
      parentId: newParentId 
    });
    
    // Add status field to the response
    if (response.data && response.data.data) {
      response.data.data.status = 'Active';
    }
    
    return response.data.data;
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
    const response = await api.get('/links/categories/tree');
    
    // Add status field to each category
    if (response.data) {
      const addStatusToTree = (categories: any[]): any[] => {
        return categories.map(category => ({
          ...category,
          status: category.status || 'Active',
          children: category.children ? addStatusToTree(category.children) : []
        }));
      };
      
      response.data = addStatusToTree(response.data);
    }
    
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
    // Remove status field from each category
    const categoriesData = categories.map(({ status, ...category }) => category);
    
    await api.post('/links/categories/bulk-update', { categories: categoriesData });
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
    await api.post('/links/categories/bulk-delete', { categoryIds });
  } catch (error) {
    console.error('Error bulk deleting categories:', error);
    throw error;
  }
};

/**
 * Get category statistics
 */
export const getCategoryStatistics = async (): Promise<any> => {
  try {
    const response = await api.get('/links/categories/statistics');
    return response.data;
  } catch (error) {
    console.error('Error fetching category statistics:', error);
    throw error;
  }
};

/**
 * Export categories to CSV
 */
export const exportCategories = async (format: 'csv' | 'excel' = 'csv'): Promise<Blob> => {
  try {
    const response = await api.get(`/links/categories/export?format=${format}`, {
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
export const importCategories = async (file: File): Promise<any> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/links/categories/import', formData, {
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
