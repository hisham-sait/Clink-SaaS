import api from '../api';
import { Contact, Activity, Organisation, Proposal, ProposalTemplate, Product, Deal } from '../../components/crm/types';

const API_BASE_URL = '/crm';

// Contacts
export const getContacts = async (companyId: string): Promise<Contact[]> => {
  const response = await api.get(`${API_BASE_URL}/contacts/${companyId}`);
  return response.data;
};

// Activities
export const getActivities = async (companyId: string, entityType?: string): Promise<Activity[]> => {
  const response = await api.get(`${API_BASE_URL}/activities`, {
    params: { companyId, entityType }
  });
  return response.data;
};

// Organisations
export const getOrganisations = async (companyId: string): Promise<Organisation[]> => {
  const response = await api.get(`${API_BASE_URL}/organisations/${companyId}`);
  return response.data;
};

// Products
export const getProducts = async (companyId: string): Promise<Product[]> => {
  const response = await api.get(`${API_BASE_URL}/products/${companyId}`);
  return response.data;
};

export const getProduct = async (companyId: string, id: string): Promise<Product> => {
  const response = await api.get(`${API_BASE_URL}/products/${companyId}/${id}`);
  return response.data;
};

export const createProduct = async (companyId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const response = await api.post(`${API_BASE_URL}/products/${companyId}`, product);
  return response.data;
};

export const updateProduct = async (companyId: string, id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`${API_BASE_URL}/products/${companyId}/${id}`, product);
  return response.data;
};

export const deleteProduct = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/products/${companyId}/${id}`);
};

// Services
export const getServices = async (companyId: string): Promise<Product[]> => {
  const response = await api.get(`${API_BASE_URL}/services/${companyId}`);
  return response.data;
};

export const getService = async (companyId: string, id: string): Promise<Product> => {
  const response = await api.get(`${API_BASE_URL}/services/${companyId}/${id}`);
  return response.data;
};

export const createService = async (companyId: string, service: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const response = await api.post(`${API_BASE_URL}/services/${companyId}`, service);
  return response.data;
};

export const updateService = async (companyId: string, id: string, service: Partial<Product>): Promise<Product> => {
  const response = await api.put(`${API_BASE_URL}/services/${companyId}/${id}`, service);
  return response.data;
};

export const deleteService = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/services/${companyId}/${id}`);
};

// Export services as PDF or Excel
export const exportServicesToPdf = async (companyId: string): Promise<Blob> => {
  const response = await api.get(`${API_BASE_URL}/services/${companyId}/export/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};

export const exportServicesToExcel = async (companyId: string): Promise<Blob> => {
  const response = await api.get(`${API_BASE_URL}/services/${companyId}/export/excel`, {
    responseType: 'blob'
  });
  return response.data;
};

// Deals
export const getDeals = async (companyId: string): Promise<Deal[]> => {
  const response = await api.get(`${API_BASE_URL}/deals/${companyId}`);
  return response.data;
};

// Proposals
export const getProposals = async (companyId: string): Promise<Proposal[]> => {
  const response = await api.get(`${API_BASE_URL}/proposals/${companyId}`);
  return response.data;
};

export const getProposal = async (companyId: string, id: string): Promise<Proposal> => {
  const response = await api.get(`${API_BASE_URL}/proposals/${companyId}/${id}`);
  return response.data;
};

export const createProposal = async (companyId: string, proposal: Partial<Proposal>): Promise<Proposal> => {
  const response = await api.post(`${API_BASE_URL}/proposals/${companyId}`, proposal);
  return response.data;
};

export const updateProposal = async (companyId: string, id: string, proposal: Partial<Proposal>): Promise<Proposal> => {
  const response = await api.put(`${API_BASE_URL}/proposals/${companyId}/${id}`, proposal);
  return response.data;
};

export const deleteProposal = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/proposals/${companyId}/${id}`);
};

// Proposal Templates
export const getProposalTemplates = async (companyId: string): Promise<ProposalTemplate[]> => {
  const response = await api.get(`${API_BASE_URL}/proposals/templates/${companyId}`);
  return response.data;
};

export const createProposalTemplate = async (companyId: string, template: Partial<ProposalTemplate>): Promise<ProposalTemplate> => {
  const response = await api.post(`${API_BASE_URL}/proposals/templates/${companyId}`, template);
  return response.data;
};

export const updateProposalTemplate = async (companyId: string, id: string, template: Partial<ProposalTemplate>): Promise<ProposalTemplate> => {
  const response = await api.put(`${API_BASE_URL}/proposals/templates/${companyId}/${id}`, template);
  return response.data;
};

export const deleteProposalTemplate = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`${API_BASE_URL}/proposals/templates/${companyId}/${id}`);
};

// PDF Export
export const exportProposalToPdf = async (companyId: string, id: string): Promise<Blob> => {
  const response = await api.get(`${API_BASE_URL}/proposals/${companyId}/${id}/export/pdf`, {
    responseType: 'blob'
  });
  return response.data;
};
