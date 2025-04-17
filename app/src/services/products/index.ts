// Re-export all products services
export * as ProductsService from './products';
export * as CategoriesService from './categories';
export * as FamiliesService from './families';
export * as AttributesService from './attributes';
export * as SectionsService from './sections';
export * as ImportExportService from './import-export';
export * as ActivityService from './activity';

// Re-export types with namespaces to avoid conflicts
import * as ProductsTypes from './types';
export { ProductsTypes };

// Common helper functions
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
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

// Helper function to get product status badge color
export const getProductStatusColor = (status: ProductsTypes.ProductStatus): string => {
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

// Helper function to calculate product completeness
export const calculateCompleteness = (
  product: ProductsTypes.Product,
  requiredAttributes: string[] = []
): number => {
  const fields = [
    'name',
    'sku',
    'description',
    'categoryId',
    'familyId'
  ];
  
  let completed = 0;
  let total = fields.length;
  
  // Check basic fields
  fields.forEach(field => {
    if (product[field as keyof ProductsTypes.Product]) {
      completed++;
    }
  });
  
  // Check required attributes
  if (product.attributes && requiredAttributes.length > 0) {
    total += requiredAttributes.length;
    product.attributes.forEach(attr => {
      if (requiredAttributes.includes(attr.attributeId) && attr.value) {
        completed++;
      }
    });
  }
  
  return Math.round((completed / total) * 100);
};
