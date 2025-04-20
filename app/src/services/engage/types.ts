// Type definitions for engage services

// Form Types
export interface FormData {
  id?: string;
  title: string;
  description?: string;
  categoryId?: string;
  elements?: any[];
  settings?: any;
  status?: string;
  type?: string;
  submissions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormCategory {
  id: string;
  name: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: any;
  metadata?: any;
  createdAt: string;
}

// Survey Types
export interface SurveyData {
  id?: string;
  title: string;
  description?: string;
  categoryId?: string;
  sections?: any[];
  settings?: any;
  status?: string;
  responses?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveyCategory {
  id: string;
  name: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  data: any;
  metadata?: any;
  createdAt: string;
}

// Data Types
export interface DatasetData {
  id?: string;
  name: string;
  description?: string;
  type: 'form' | 'survey' | 'upload' | 'webhook';
  sourceId?: string;
  sourceName?: string;
  webhookId?: string;
  webhookSecret?: string;
  recordCount?: number;
  companyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DataRecord {
  id: string;
  datasetId: string;
  data: any;
  metadata?: any;
  createdAt: string;
}

// Common Types
export interface EngageQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type EngageStatus = 'Active' | 'Inactive' | 'Draft' | 'Archived';
