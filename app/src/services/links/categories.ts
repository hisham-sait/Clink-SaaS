import api from '../api';
import { Category, CategoriesResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<CategoriesResponse> => {
  try {
    const response = await api.get('/links/categories');
    
    // Standardized response handling
    if (response.data && response.data.data) {
      // Backend returns { success: true, data: [...] }
      const categories = response.data.data.map((category: any) => ({
        ...category,
        status: category.status || 'Active'
      }));
      
      return {
        categories,
        total: categories.length
      };
    } else if (response.data && response.data.categories) {
      // Backend returns { categories: [...], total: number }
      const categories = response.data.categories.map((category: any) => ({
        ...category,
        status: category.status || 'Active'
      }));
      
      return {
        categories,
        total: response.data.total || categories.length
      };
    } else {
      // Fallback for unexpected response format
      console.warn('Unexpected response format from categories API:', response.data);
      return {
        categories: [],
        total: 0
      };
    }
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
    
    // Standardized response handling
    const category = response.data.data || response.data;
    
    // Add status field if it doesn't exist
    if (category) {
      category.status = category.status || 'Active';
    }
    
    return category;
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
    
    // Standardized response handling
    const createdCategory = response.data.data || response.data;
    
    // Add status field
    if (createdCategory) {
      createdCategory.status = 'Active';
    }
    
    return createdCategory;
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
    
    // Standardized response handling
    const updatedCategory = response.data.data || response.data;
    
    // Add status field
    if (updatedCategory) {
      updatedCategory.status = 'Active';
    }
    
    return updatedCategory;
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
    
    // Standardized response handling
    const movedCategory = response.data.data || response.data;
    
    // Add status field
    if (movedCategory) {
      movedCategory.status = 'Active';
    }
    
    return movedCategory;
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
    
    // Standardized response handling
    const categories = response.data.data || response.data;
    
    // Add status field to each category in the tree
    if (categories) {
      const addStatusToTree = (items: any[]): any[] => {
        return items.map(category => ({
          ...category,
          status: category.status || 'Active',
          children: category.children ? addStatusToTree(category.children) : []
        }));
      };
      
      return addStatusToTree(categories);
    }
    
    return [];
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
