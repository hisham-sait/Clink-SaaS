import api from '../api';
import type { Company, CompanyType, CompanyStatus, CompanyTag } from './types';

// Re-export types that other components need
export type { Company, CompanyType, CompanyStatus, CompanyTag };

export interface CreateCompanyDto {
  name: string;
  legalName: string;
  registrationNumber: string;
  vatNumber?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  industry: string;
  size: string;
  type: CompanyType;
  tags: CompanyTag[];
  fiscalYearEnd: string;
  currency: string;
  status?: CompanyStatus;
  isPrimary?: boolean;
  isMyOrg?: boolean;
  primaryContact?: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  notes?: string;
}

export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}

// Get all companies
interface Activity {
  id: string;
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export const getCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/settings/companies');
  return response.data;
};

export const getActivities = async (): Promise<ActivitiesResponse> => {
  const response = await api.get('/settings/companies/activities');
  return response.data;
};

export const exportCompanies = async (type: 'pdf' | 'excel'): Promise<Blob> => {
  const response = await api.get(`/settings/companies/export/${type}`, {
    responseType: 'blob'
  });
  return response.data;
};

export const importCompanies = async (file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  await api.post('/settings/companies/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export const downloadTemplate = async (): Promise<void> => {
  const response = await api.get('/settings/companies/template', {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'companies-template.xlsx');
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
};

// Get accessible companies
export const getAccessibleCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/settings/companies/accessible');
  return response.data;
};

// Get company by ID
export const getCompany = async (id: string): Promise<Company> => {
  const response = await api.get(`/settings/companies/${id}`);
  return response.data;
};

// Create new company
export const createCompany = async (data: CreateCompanyDto): Promise<Company> => {
  const response = await api.post('/settings/companies/create', data);
  return response.data;
};

// Update company
export const updateCompany = async (id: string, data: UpdateCompanyDto): Promise<Company> => {
  const response = await api.put(`/settings/companies/${id}`, data);
  return response.data;
};

// Delete company
export const deleteCompany = async (id: string): Promise<void> => {
  await api.delete(`/settings/companies/${id}`);
};

// Set as primary organization
export const setPrimaryOrganization = async (id: string): Promise<Company> => {
  const response = await api.post(`/settings/companies/${id}/set-primary`, {});
  return response.data;
};

// Set as my organization
export const setMyOrganization = async (id: string): Promise<Company> => {
  const response = await api.post(`/settings/companies/${id}/set-my-org`, {});
  return response.data;
};

// Add tag
export const addTag = async (id: string, tag: CompanyTag): Promise<Company> => {
  const response = await api.post(`/settings/companies/${id}/tags`, { tag });
  return response.data;
};

// Remove tag
export const removeTag = async (id: string, tag: CompanyTag): Promise<Company> => {
  const response = await api.delete(`/settings/companies/${id}/tags/${tag}`);
  return response.data;
};

// Archive company
export const archiveCompany = async (id: string): Promise<Company> => {
  const response = await api.post(`/settings/companies/${id}/archive`, {});
  return response.data;
};

// Activate company
export const activateCompany = async (id: string): Promise<Company> => {
  const response = await api.post(`/settings/companies/${id}/activate`, {});
  return response.data;
};

// Upload logo
export const uploadLogo = async (id: string, file: File): Promise<Company> => {
  const formData = new FormData();
  formData.append('logo', file);
  const response = await api.post(`/settings/companies/${id}/logo`, formData);
  return response.data;
};

// Get primary contact
export const getPrimaryContact = async (id: string): Promise<{
  name: string;
  email: string;
  phone: string;
  role: string;
}> => {
  const response = await api.get(`/settings/companies/${id}/primary-contact`);
  return response.data;
};

// Update primary contact
export const updatePrimaryContact = async (
  id: string,
  contact: {
    name: string;
    email: string;
    phone: string;
    role: string;
  }
): Promise<Company> => {
  const response = await api.put(`/settings/companies/${id}/primary-contact`, contact);
  return response.data;
};

// Helper function to get company type badge color
export const getCompanyTypeBadgeColor = (type: CompanyType): string => {
  switch (type) {
    case 'Primary':
      return 'primary';
    case 'Client':
      return 'success';
    case 'Subsidiary':
      return 'info';
    case 'Partner':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Helper function to get company status badge color
export const getCompanyStatusBadgeColor = (status: CompanyStatus): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Archived':
      return 'danger';
    case 'Inactive':
      return 'secondary';
    default:
      return 'secondary';
  }
};

// Helper function to get company tag badge color
export const getCompanyTagBadgeColor = (tag: CompanyTag): string => {
  switch (tag) {
    case 'Primary Organization':
      return 'primary';
    case 'My Organization':
      return 'success';
    case 'Client':
      return 'info';
    case 'Partner':
      return 'warning';
    case 'Subsidiary':
      return 'secondary';
    default:
      return 'light';
  }
};

// Helper function to format company display name
export const formatCompanyName = (company: Company): string => {
  if (company.legalName && company.legalName !== company.name) {
    return `${company.name} (${company.legalName})`;
  }
  return company.name;
};

// Helper function to check if company can be modified
export const canModifyCompany = (company: Company): boolean => {
  return company.status !== 'Archived';
};

// Helper function to check if company can be deleted
export const canDeleteCompany = (company: Company): boolean => {
  return !company.isPrimary && !company.isMyOrg;
};

// Helper function to check if company can be archived
export const canArchiveCompany = (company: Company): boolean => {
  return !company.isPrimary && !company.isMyOrg && company.status === 'Active';
};

// Helper function to check if company can be activated
export const canActivateCompany = (company: Company): boolean => {
  return company.status === 'Archived' || company.status === 'Inactive';
};
