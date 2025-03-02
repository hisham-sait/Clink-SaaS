import api from './api';
import { Product, Proposal, ProductType, PlanType, Status, Contact, Activity, Organisation, Client } from '../components/crm/types';

// Organisation API calls
export const getOrganisations = async (companyId: string, status?: string): Promise<Organisation[]> => {
  const response = await api.get(`/crm/organisations/${companyId}`, {
    params: status && status !== 'All' ? { status } : undefined
  });
  return response.data.map((org: Organisation) => ({
    ...org,
    subsidiaries: org.subsidiaries || [],
    tags: org.tags || []
  }));
};

export const createOrganisation = async (companyId: string, organisation: Omit<Organisation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Organisation> => {
  const response = await api.post(`/crm/organisations/${companyId}`, organisation);
  return response.data;
};

export const updateOrganisation = async (companyId: string, id: string, organisation: Partial<Organisation>): Promise<Organisation> => {
  const response = await api.put(`/crm/organisations/${companyId}/${id}`, organisation);
  return response.data;
};

export const deleteOrganisation = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/organisations/${companyId}/${id}`);
};

// Client API calls
export const getClients = async (companyId: string, status?: string): Promise<Client[]> => {
  const response = await api.get(`/crm/clients/${companyId}`, {
    params: status && status !== 'All' ? { status } : undefined
  });
  return response.data;
};

// Contact API calls
export const getContacts = async (companyId: string, status?: string): Promise<Contact[]> => {
  const response = await api.get(`/crm/contacts/${companyId}`, {
    params: status && status !== 'All' ? { status } : undefined
  });
  return response.data;
};

export const createContact = async (companyId: string, contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
  const response = await api.post(`/crm/contacts/${companyId}`, contact);
  return response.data;
};

export const updateContact = async (companyId: string, id: string, contact: Partial<Contact>): Promise<Contact> => {
  const response = await api.put(`/crm/contacts/${companyId}/${id}`, contact);
  return response.data;
};

export const deleteContact = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/contacts/${companyId}/${id}`);
};

// Activity API calls
export const getActivities = async (companyId: string, entityType?: string, limit: number = 5): Promise<Activity[]> => {
  const response = await api.get(`/crm/activities/${companyId}`, {
    params: {
      entityType,
      limit
    }
  });
  return response.data.activities;
};

// Product API calls
export const getProducts = async (companyId: string): Promise<Product[]> => {
  const response = await api.get(`/crm/products/${companyId}`);
  return response.data;
};

export const getProduct = async (companyId: string, id: string): Promise<Product> => {
  const response = await api.get(`/crm/products/${companyId}/${id}`);
  return response.data;
};

export const createProduct = async (companyId: string, product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  const response = await api.post(`/crm/products/${companyId}`, product);
  return response.data;
};

export const updateProduct = async (companyId: string, id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/crm/products/${companyId}/${id}`, product);
  return response.data;
};

export const deleteProduct = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/products/${companyId}/${id}`);
};

// Proposal API calls
export const getProposals = async (companyId: string): Promise<Proposal[]> => {
  const response = await api.get(`/crm/proposals/${companyId}`);
  return response.data;
};

export const getProposal = async (companyId: string, id: string): Promise<Proposal> => {
  const response = await api.get(`/crm/proposals/${companyId}/${id}`);
  return response.data;
};

export const createProposal = async (companyId: string, proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Proposal> => {
  const response = await api.post(`/crm/proposals/${companyId}`, proposal);
  return response.data;
};

export const updateProposal = async (companyId: string, id: string, proposal: Partial<Proposal>): Promise<Proposal> => {
  const response = await api.put(`/crm/proposals/${companyId}/${id}`, proposal);
  return response.data;
};

export const deleteProposal = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/proposals/${companyId}/${id}`);
};

// Helper functions for proposal creation
export const calculatePlanPrice = (basePrice: number, planType: PlanType): number => {
  switch (planType) {
    case 'BASIC':
      return basePrice * 0.8; // 20% discount
    case 'PREMIUM':
      return basePrice * 1.2; // 20% premium
    default:
      return basePrice;
  }
};

export const getPlanFeatures = (features: string[], planType: PlanType): string[] => {
  switch (planType) {
    case 'BASIC':
      return features.slice(0, 3); // First 3 features
    case 'STANDARD':
      return features.slice(0, 5); // First 5 features
    case 'PREMIUM':
      return features; // All features
    default:
      return features;
  }
};

// Pipeline API calls
export const getPipelines = async (companyId: string): Promise<any[]> => {
  const response = await api.get(`/crm/pipelines/${companyId}`);
  return response.data;
};

export const createPipeline = async (companyId: string, pipeline: any): Promise<any> => {
  const response = await api.post(`/crm/pipelines/${companyId}`, pipeline);
  return response.data;
};

export const updatePipeline = async (companyId: string, id: string, pipeline: any): Promise<any> => {
  const response = await api.put(`/crm/pipelines/${companyId}/${id}`, pipeline);
  return response.data;
};

export const deletePipeline = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/pipelines/${companyId}/${id}`);
};

// Deal API calls
export const getDeals = async (companyId: string): Promise<any[]> => {
  const response = await api.get(`/crm/deals/${companyId}`);
  return response.data;
};

export const updateDeal = async (companyId: string, id: string, deal: any): Promise<any> => {
  const response = await api.put(`/crm/deals/${companyId}/${id}`, deal);
  return response.data;
};

export const deleteDeal = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/deals/${companyId}/${id}`);
};

export const moveDeal = async (companyId: string, dealId: string, moveData: {
  sourceStageId: string;
  destinationStageId: string;
  newIndex: number;
}): Promise<void> => {
  await api.put(`/crm/deals/${companyId}/${dealId}/move`, moveData);
};

// Pipeline Stage API calls
export const getPipelineStages = async (companyId: string, pipelineId: string): Promise<any[]> => {
  const response = await api.get(`/crm/pipelines/${companyId}/${pipelineId}/stages`);
  return response.data;
};

// Deal API calls
export const createDeal = async (companyId: string, deal: {
  name: string;
  amount: number;
  probability: number;
  expectedCloseDate: string;
  notes: string;
  contactId: string;
  organisationId: string | null;
  stageId: string;
  pipelineId: string;
}): Promise<any> => {
  const response = await api.post(`/crm/deals/${companyId}`, deal);
  return response.data;
};

// Automation API calls
export const getAutomations = async (companyId: string, pipelineId: string): Promise<any[]> => {
  const response = await api.get(`/crm/pipelines/${companyId}/${pipelineId}/automations`);
  return response.data;
};

export const createAutomation = async (companyId: string, automation: {
  name: string;
  description: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  pipelineId: string;
}): Promise<any> => {
  const response = await api.post(`/crm/automations/${companyId}`, automation);
  return response.data;
};

export const updateAutomation = async (companyId: string, id: string, automation: {
  name: string;
  description: string;
  trigger: string;
  conditions: any[];
  actions: any[];
  pipelineId: string;
}): Promise<any> => {
  const response = await api.put(`/crm/automations/${companyId}/${id}`, automation);
  return response.data;
};

export const deleteAutomation = async (companyId: string, id: string): Promise<void> => {
  await api.delete(`/crm/automations/${companyId}/${id}`);
};
