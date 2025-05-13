// Type definitions for engage services

// Page Types
export interface PageData {
  id?: string;
  title: string;
  description?: string;
  categoryId?: string;
  sections?: any[];
  settings?: any;
  appearance?: any;
  status?: string;
  slug?: string;
  views?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  companyId?: string;
  pagesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PageCategoriesResponse {
  categories: PageCategory[];
  total?: number;
}

export interface PageView {
  id: string;
  pageId: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Form Types
export interface FormData {
  id?: string;
  title: string;
  description?: string;
  categoryId?: string;
  elements?: any[];
  sections?: any[];
  settings?: any;
  appearance?: any;
  status?: string;
  type?: string;
  submissions?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormCategory {
  id: string;
  name: string;
  companyId?: string;
  formsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FormCategoriesResponse {
  categories: FormCategory[];
  total?: number;
}

export interface FormSubmission {
  id: string;
  formId: string;
  data: any;
  metadata?: any;
  createdAt: string;
}


// Data Types
export interface DatasetData {
  id?: string;
  name: string;
  description?: string;
  type: 'form' | 'upload' | 'webhook';
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
