// Re-export all engage services
export * as FormsService from './forms';
export * as CategoriesService from './categories';
export * as PagesService from './pages';

// Re-export types with namespaces to avoid conflicts
import * as EngageTypes from './types';
export { EngageTypes };

// Common helper functions
export const formatDate = (date: string | Date | null): string => {
  if (!date) return 'Never';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
};

export const formatDateTime = (date: string | Date | null): string => {
  if (!date) return 'Never';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d);
};

export const formatTimeAgo = (date: string | Date): string => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);

  if (diffSec < 60) return `${diffSec} seconds ago`;
  if (diffMin < 60) return `${diffMin} minutes ago`;
  if (diffHr < 24) return `${diffHr} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays} days ago`;
  return formatDate(d);
};

// Common error handling
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.error || error.response.data?.message;
    if (message) return message;
    return `Server error: ${error.response.status}`;
  }
  if (error.request) {
    // Request made but no response
    return 'No response from server';
  }
  // Request setup error
  return error.message || 'An unexpected error occurred';
};

// Helper function to get current company ID
export const getCurrentCompanyId = (): string => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.companyId) {
      throw new Error('Company ID not found');
    }
    return user.companyId;
  } catch (error) {
    throw new Error('Failed to get company ID. Please log in again.');
  }
};

// Helper function to get engage item status badge color
export const getEngageStatusColor = (status: EngageTypes.EngageStatus): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'warning';
    case 'Draft':
      return 'info';
    case 'Archived':
      return 'secondary';
    default:
      return 'secondary';
  }
};

// Helper function to build a form embed URL
export const buildFormEmbedUrl = (slug: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/forms/${slug}`;
};


// Helper function to build a page embed URL
export const buildPageEmbedUrl = (slug: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/p/${slug}`;
};
