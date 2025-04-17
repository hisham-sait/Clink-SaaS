import api from '../api';
import { Section, SectionsResponse } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all sections
 */
export const getSections = async (): Promise<SectionsResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/sections/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching sections:', error);
    throw error;
  }
};

/**
 * Get a single section by ID
 */
export const getSection = async (id: string): Promise<Section> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/sections/${companyId}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching section with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new section
 */
export const createSection = async (section: Omit<Section, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Section> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/sections/${companyId}`, section);
    return response.data;
  } catch (error) {
    console.error('Error creating section:', error);
    throw error;
  }
};

/**
 * Update an existing section
 */
export const updateSection = async (id: string, section: Partial<Section>): Promise<Section> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/sections/${companyId}/${id}`, section);
    return response.data;
  } catch (error) {
    console.error(`Error updating section with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a section
 */
export const deleteSection = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/sections/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting section with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get section attributes
 */
export const getSectionAttributes = async (sectionId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/sections/${companyId}/${sectionId}/attributes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attributes for section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Add attribute to section
 */
export const addAttributeToSection = async (sectionId: string, attributeId: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/sections/${companyId}/${sectionId}/attributes`, { attributeId });
  } catch (error) {
    console.error(`Error adding attribute to section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Remove attribute from section
 */
export const removeAttributeFromSection = async (sectionId: string, attributeId: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/sections/${companyId}/${sectionId}/attributes/${attributeId}`);
  } catch (error) {
    console.error(`Error removing attribute from section ${sectionId}:`, error);
    throw error;
  }
};

/**
 * Reorder sections
 */
export const reorderSections = async (sectionIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/sections/${companyId}/reorder`, { sectionIds });
  } catch (error) {
    console.error('Error reordering sections:', error);
    throw error;
  }
};

/**
 * Get product sections
 */
export const getProductSections = async (productId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/products/${companyId}/${productId}/sections`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching sections for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Update product section values
 */
export const updateProductSectionValues = async (
  productId: string,
  sectionId: string,
  values: { [key: string]: any }
): Promise<any> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(
      `/products/products/${companyId}/${productId}/sections/${sectionId}`,
      { values }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating section values for product ${productId}:`, error);
    throw error;
  }
};

/**
 * Bulk create sections
 */
export const bulkCreateSections = async (sections: Array<Omit<Section, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>): Promise<Section[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/sections/${companyId}/bulk-create`, { sections });
    return response.data;
  } catch (error) {
    console.error('Error bulk creating sections:', error);
    throw error;
  }
};

/**
 * Bulk update sections
 */
export const bulkUpdateSections = async (sections: Array<{ id: string } & Partial<Section>>): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/sections/${companyId}/bulk-update`, { sections });
  } catch (error) {
    console.error('Error bulk updating sections:', error);
    throw error;
  }
};

/**
 * Bulk delete sections
 */
export const bulkDeleteSections = async (sectionIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/sections/${companyId}/bulk-delete`, { sectionIds });
  } catch (error) {
    console.error('Error bulk deleting sections:', error);
    throw error;
  }
};
