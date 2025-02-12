import api from '../api';
import type { Plan, Permission, Company, User } from './types';
import { MODULE_PERMISSIONS } from './types';

// Get user's plan permissions
export const getPlanPermissions = (userRoles: string[]): Permission[] => {
  const planPermissions = MODULE_PERMISSIONS['plans'];
  return planPermissions.filter(permission => 
    userRoles.some(role => {
      // Super Admin has all permissions
      if (role === 'Super Admin') {
        return true;
      }
      // Platform Admin has all plan permissions
      if (role === 'Platform Admin' && permission.module === 'plans') {
        return true;
      }
      // Company Admin can view plans and manage billing
      if (role === 'Company Admin') {
        return ['plans-view', 'billing-manage'].includes(permission.code);
      }
      // Other roles can only view plans
      return permission.code === 'plans-view';
    })
  );
};

// Check if user has specific plan permission
export const hasPermission = (userRoles: string[], permissionCode: string): boolean => {
  return userRoles.some(role => {
    // Super Admin has all permissions
    if (role === 'Super Admin') {
      return true;
    }
    // Platform Admin has all plan permissions
    if (role === 'Platform Admin' && permissionCode.startsWith('plans-')) {
      return true;
    }
    // Company Admin can view plans and manage billing
    if (role === 'Company Admin') {
      return ['plans-view', 'billing-manage'].includes(permissionCode);
    }
    // Other roles can only view plans
    return permissionCode === 'plans-view';
  });
};

// Get all plans with role-based filtering
export const getPlans = async (): Promise<Plan[]> => {
  const response = await api.get('/settings/plans');
  return response.data;
};

// Get plan by ID
export const getPlan = async (id: string): Promise<Plan> => {
  const response = await api.get(`/settings/plans/${id}`);
  return response.data;
};

// Create new plan (requires Admin access)
export const createPlan = async (plan: Partial<Plan>): Promise<Plan> => {
  const response = await api.post('/settings/plans', plan);
  return response.data;
};

// Update plan (requires Admin access)
export const updatePlan = async (id: string, plan: Partial<Plan>): Promise<Plan> => {
  const response = await api.put(`/settings/plans/${id}`, plan);
  return response.data;
};

// Delete plan (requires Admin access)
export const deletePlan = async (id: string): Promise<void> => {
  await api.delete(`/settings/plans/${id}`);
};

// Get allowed features based on user role
export const getAllowedFeatures = (plan: Plan, userRoles: string[]): string[] => {
  const hasFullAccess = hasPermission(userRoles, 'plans-admin');
  if (hasFullAccess) {
    return plan.features;
  }
  return plan.features;
};

// Check if user can manage plans
export const canManagePlans = (userRoles: string[]): boolean => {
  return userRoles.some(role => ['Super Admin', 'Platform Admin'].includes(role));
};

// Check if user can view plans
export const canViewPlans = (userRoles: string[]): boolean => {
  return hasPermission(userRoles, 'plans-view');
};

// Check if user can select/change plans
export const canChangePlan = (userRoles: string[]): boolean => {
  return userRoles.some(role => ['Super Admin', 'Platform Admin', 'Company Admin'].includes(role));
};

// Get current user's plan
export const getCurrentUserPlan = async (): Promise<{ plan: Plan; billingCompany: Company }> => {
  const response = await api.get('/settings/plans/user/current');
  return response.data;
};

// Get available billing companies for user
export const getAvailableBillingCompanies = async (): Promise<Company[]> => {
  const response = await api.get('/settings/plans/billing-companies');
  return response.data;
};

// Select plan for user
export const selectPlan = async (planId: string, billingCompanyId: string): Promise<User> => {
  const response = await api.post('/settings/plans/select', {
    planId,
    billingCompanyId
  });
  return response.data;
};

// Get users on a specific plan
export const getPlanUsers = async (planId: string): Promise<User[]> => {
  const response = await api.get<Plan>(`/settings/plans/${planId}`);
  return response.data.users || [];
};

// Get plan usage statistics
export const getPlanUsage = async (planId: string): Promise<{
  totalUsers: number;
  maxUsers: number;
  totalCompanies: number;
  maxCompanies: number;
}> => {
  const response = await api.get<Plan>(`/settings/plans/${planId}`);
  return {
    totalUsers: response.data.userCount || 0,
    maxUsers: response.data.maxUsers,
    totalCompanies: 0, // This would need to be calculated based on users' companies
    maxCompanies: response.data.maxCompanies
  };
};

// Validate if a plan can be selected
export const validatePlanSelection = async (
  planId: string,
  billingCompanyId: string
): Promise<{
  valid: boolean;
  message?: string;
}> => {
  const response = await api.post('/settings/plans/validate', {
    planId,
    billingCompanyId
  });
  return response.data;
};

// Helper function to get status badge color
export const getStatusBadgeColor = (status: string): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Inactive':
      return 'warning';
    case 'Deprecated':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Helper function to format price with billing cycle
export const formatPrice = (price: number, billingCycle: string): string => {
  return `$${price}/${billingCycle.toLowerCase()}`;
};

// Helper function to format user/company limits
export const formatLimit = (limit: number): string => {
  return limit === -1 ? 'Unlimited' : limit.toString();
};
