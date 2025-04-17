import api from '../api';
import { Family, FamiliesResponse, Attribute, AttributeGroup } from './types';
import { getCurrentCompanyId } from './index';

/**
 * Get all product families
 */
export const getFamilies = async (): Promise<FamiliesResponse> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/families/${companyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching families:', error);
    throw error;
  }
};

/**
 * Get a single family by ID
 */
export const getFamily = async (id: string): Promise<Family> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/families/${companyId}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching family with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new family
 */
export const createFamily = async (family: Omit<Family, 'id' | 'createdAt' | 'updatedAt' | 'companyId'>): Promise<Family> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/families/${companyId}`, family);
    return response.data;
  } catch (error) {
    console.error('Error creating family:', error);
    throw error;
  }
};

/**
 * Update an existing family
 */
export const updateFamily = async (id: string, family: Partial<Family>): Promise<Family> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(`/products/families/${companyId}/${id}`, family);
    return response.data;
  } catch (error) {
    console.error(`Error updating family with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a family
 */
export const deleteFamily = async (id: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/families/${companyId}/${id}`);
  } catch (error) {
    console.error(`Error deleting family with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Get products in a family
 */
export const getFamilyProducts = async (familyId: string): Promise<any[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/families/${companyId}/${familyId}/products`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching products for family ${familyId}:`, error);
    throw error;
  }
};

/**
 * Get attribute groups for a family
 */
export const getFamilyAttributeGroups = async (familyId: string): Promise<AttributeGroup[]> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.get(`/products/families/${companyId}/${familyId}/attribute-groups`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching attribute groups for family ${familyId}:`, error);
    throw error;
  }
};

/**
 * Create attribute group for a family
 */
export const createAttributeGroup = async (
  familyId: string, 
  group: Omit<AttributeGroup, 'id' | 'createdAt' | 'updatedAt' | 'companyId' | 'familyId' | 'attributes'>
): Promise<AttributeGroup> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.post(`/products/families/${companyId}/${familyId}/attribute-groups`, group);
    return response.data;
  } catch (error) {
    console.error(`Error creating attribute group for family ${familyId}:`, error);
    throw error;
  }
};

/**
 * Update attribute group
 */
export const updateAttributeGroup = async (
  familyId: string,
  groupId: string,
  group: Partial<AttributeGroup>
): Promise<AttributeGroup> => {
  try {
    const companyId = getCurrentCompanyId();
    const response = await api.put(
      `/products/families/${companyId}/${familyId}/attribute-groups/${groupId}`, 
      group
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating attribute group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Delete attribute group
 */
export const deleteAttributeGroup = async (familyId: string, groupId: string): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(`/products/families/${companyId}/${familyId}/attribute-groups/${groupId}`);
  } catch (error) {
    console.error(`Error deleting attribute group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Add attribute to group
 */
export const addAttributeToGroup = async (
  familyId: string,
  groupId: string,
  attributeId: string
): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(
      `/products/families/${companyId}/${familyId}/attribute-groups/${groupId}/attributes`,
      { attributeId }
    );
  } catch (error) {
    console.error(`Error adding attribute to group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Remove attribute from group
 */
export const removeAttributeFromGroup = async (
  familyId: string,
  groupId: string,
  attributeId: string
): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.delete(
      `/products/families/${companyId}/${familyId}/attribute-groups/${groupId}/attributes/${attributeId}`
    );
  } catch (error) {
    console.error(`Error removing attribute from group ${groupId}:`, error);
    throw error;
  }
};

/**
 * Reorder attribute groups
 */
export const reorderAttributeGroups = async (familyId: string, groupIds: string[]): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(
      `/products/families/${companyId}/${familyId}/attribute-groups/reorder`,
      { groupIds }
    );
  } catch (error) {
    console.error(`Error reordering attribute groups for family ${familyId}:`, error);
    throw error;
  }
};

/**
 * Reorder attributes within a group
 */
export const reorderAttributes = async (
  familyId: string,
  groupId: string,
  attributeIds: string[]
): Promise<void> => {
  try {
    const companyId = getCurrentCompanyId();
    await api.post(
      `/products/families/${companyId}/${familyId}/attribute-groups/${groupId}/attributes/reorder`,
      { attributeIds }
    );
  } catch (error) {
    console.error(`Error reordering attributes in group ${groupId}:`, error);
    throw error;
  }
};
