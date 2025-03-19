import api from '../api';
import { Pipeline, ContactPipelineStage, Stage, Deal, DealStatus, Priority } from '../../components/crm/types';

const API_BASE_URL = '/crm';

export interface AddContactToPipelineParams {
  contactId: string;
  pipelineId: string;
  stageId: string;
  estimatedValue?: number;
  notes?: string;
}

export interface MoveItemParams {
  sourceStageId: string;
  destinationStageId: string;
  newIndex: number;
}

export const moveContact = async (
  companyId: string,
  contactId: string,
  params: MoveItemParams
): Promise<void> => {
  await api.put(`${API_BASE_URL}/pipelines/contacts/${contactId}/move`, {
    ...params,
    companyId
  });
};

export interface MoveDealParams extends MoveItemParams {}

export interface CreateDealParams {
  name: string;
  amount: number;
  probability: number;
  expectedCloseDate: Date;
  notes?: string;
  contactId: string;
  organisationId?: string;
  stageId: string;
  pipelineId: string;
  status: DealStatus;
  priority: Priority;
}

export const getPipelines = async (companyId: string): Promise<Pipeline[]> => {
  const response = await api.get(`${API_BASE_URL}/pipelines`, {
    params: { companyId }
  });
  return response.data;
};

export const getPipelineStages = async (companyId: string, pipelineId: string): Promise<Stage[]> => {
  const response = await api.get(`${API_BASE_URL}/pipelines/${pipelineId}/stages`, {
    params: { companyId }
  });
  return response.data;
};

export const addContactToPipeline = async (
  companyId: string,
  contactId: string,
  params: AddContactToPipelineParams
): Promise<ContactPipelineStage> => {
  const response = await api.post(`${API_BASE_URL}/pipelines/contacts/${contactId}/pipeline`, {
    ...params,
    companyId
  });
  return response.data;
};

export const updateContactPipelineStage = async (
  companyId: string,
  contactId: string,
  stageId: string,
  notes?: string
): Promise<ContactPipelineStage> => {
  const response = await api.put(`${API_BASE_URL}/pipelines/contacts/${contactId}/pipeline`, {
    stageId,
    notes,
    companyId
  });
  return response.data;
};

export const removeContactFromPipeline = async (
  companyId: string,
  contactId: string
): Promise<void> => {
  await api.delete(`${API_BASE_URL}/pipelines/contacts/${contactId}/pipeline`, {
    params: { companyId }
  });
};

export const moveDeal = async (
  companyId: string,
  dealId: string,
  params: MoveDealParams
): Promise<void> => {
  await api.put(`${API_BASE_URL}/pipelines/deals/${dealId}/move`, {
    ...params,
    companyId
  });
};

export const createDeal = async (
  companyId: string,
  params: CreateDealParams
): Promise<Deal> => {
  const response = await api.post(`${API_BASE_URL}/pipelines/deals`, {
    ...params,
    companyId
  });
  return response.data;
};
