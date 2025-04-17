import api from '../api';
import { Attribute, AttributesResponse, AttributeOption } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all attributes
 */
export const getAttributes = async (sectionId?: string): Promise<AttributesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const url = `/products/attributes/${companyId}`;
    const params = sectionId ? { sectionId } : undefined;
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching attributes:', error);
    throw error;
  }
};

/**
 * Get a single attribute by ID
 */
export const getAttribute = async (id: string): Promise<Attribute> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/attributes/${companyId}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attribute with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new attribute
 */
export const createAttribute = async (attribute: Omit<Attribute, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Attribute> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/attributes/${companyId}`, attribute);
    return response.data;
  } catch (error) {
    console.error('Error creating attribute:', error);
    throw error;
  }
};

/**
 * Update an existing attribute
 */
export const updateAttribute = async (id: string, attribute: Partial<Attribute>): Promise<Attribute> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/attributes/${companyId}/${id}`, attribute);
    return response.data;
  } catch (error) {
    console.error(`Error updating attribute with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete an attribute
 */
export const deleteAttribute = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/attributes/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting attribute with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get attribute options
 */
export const getAttributeOptions = async (attributeId: string): Promise<AttributeOption[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/attributes/${companyId}/${attributeId}/options`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching options for attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Add option to attribute
 */
export const addAttributeOption = async (
  attributeId: string,
  option: Omit<AttributeOption, 'id'>
): Promise<AttributeOption> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(
      `/products/attributes/${companyId}/${attributeId}/options`,
      option
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding option to attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Update attribute option
 */
export const updateAttributeOption = async (
  attributeId: string,
  optionId: string,
  option: Partial<AttributeOption>
): Promise<AttributeOption> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(
      `/products/attributes/${companyId}/${attributeId}/options/${optionId}`,
      option
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating option ${optionId} for attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Delete attribute option
 */
export const deleteAttributeOption = async (attributeId: string, optionId: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/attributes/${companyId}/${attributeId}/options/${optionId}`);
  } catch (error) {
    console.error(`Error deleting option ${optionId} for attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Reorder attribute options
 */
export const reorderAttributeOptions = async (attributeId: string, optionIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(
      `/products/attributes/${companyId}/${attributeId}/options/reorder`,
      { optionIds }
    );
  } catch (error) {
    console.error(`Error reordering options for attribute ${attributeId}:`, error);
    throw error;
  }
};

/**
 * Bulk create attributes
 */
export const bulkCreateAttributes = async (attributes: Array<Omit<Attribute, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>>): Promise<Attribute[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/attributes/${companyId}/bulk-create`, { attributes });
    return response.data;
  } catch (error) {
    console.error('Error bulk creating attributes:', error);
    throw error;
  }
};

/**
 * Bulk update attributes
 */
export const bulkUpdateAttributes = async (attributes: Array<{ id: string } & Partial<Attribute>>): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/attributes/${companyId}/bulk-update`, { attributes });
  } catch (error) {
    console.error('Error bulk updating attributes:', error);
    throw error;
  }
};

/**
 * Bulk delete attributes
 */
export const bulkDeleteAttributes = async (attributeIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(`/products/attributes/${companyId}/bulk-delete`, { attributeIds });
  } catch (error) {
    console.error('Error bulk deleting attributes:', error);
    throw error;
  }
};

/**
 * Get attributes by section
 */
export const getAttributesBySection = async (sectionId: string): Promise<Attribute[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/sections/${companyId}/${sectionId}/attributes`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attributes for section ${sectionId}:`, error);
    throw error;
  }
};
