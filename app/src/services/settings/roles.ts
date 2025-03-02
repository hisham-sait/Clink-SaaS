import api from '../api';
import { MODULE_PERMISSIONS } from './types';
import type { Role, Permission, RoleTemplate } from './types';

// Re-export types that other components need
export type { Role, Permission, RoleTemplate };

export interface CreateRoleDto {
  name: string;
  description?: string;
  scope?: string;
  permissions: { id: string }[];
  status?: Role['status'];
  isCustom?: boolean;
  isSystem?: boolean;
  metadata?: {
    allowedModules?: string[];
    maxUsers?: number;
    restrictions?: string[];
  };
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  scope?: string;
  permissions?: { id: string }[];
  status?: Role['status'];
  isCustom?: boolean;
  metadata?: {
    allowedModules?: string[];
    maxUsers?: number;
    restrictions?: string[];
  };
}

export interface RoleStats {
  totalUsers: number;
  activeUsers: number;
  lastAssigned?: string;
}

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  const response = await api.get('/settings/roles');
  return response.data;
};

// Get role by ID
export const getRole = async (id: string): Promise<Role> => {
  const response = await api.get(`/settings/roles/${id}`);
  return response.data;
};

// Create new role
export const createRole = async (data: CreateRoleDto): Promise<Role> => {
  const response = await api.post('/settings/roles/create', data);
  return response.data;
};

// Update role
export const updateRole = async (id: string, data: UpdateRoleDto): Promise<Role> => {
  const response = await api.put(`/settings/roles/${id}`, data);
  return response.data;
};

// Delete role
export const deleteRole = async (id: string): Promise<void> => {
  await api.delete(`/settings/roles/${id}`);
};

// Get role usage statistics
export const getRoleStats = async (id: string): Promise<RoleStats> => {
  const response = await api.get(`/settings/roles/${id}/stats`);
  return response.data;
};

// Assign role to user
export const assignRole = async (userId: string, roleId: string): Promise<void> => {
  await api.post('/settings/roles/assign', { userId, roleId });
};

// Remove role from user
export const removeRole = async (userId: string, roleId: string): Promise<void> => {
  await api.delete(`/settings/roles/assign/${userId}/${roleId}`);
};

// Validate role permissions
export const validateRolePermissions = async (id: string, permissions: string[]): Promise<boolean> => {
  const response = await api.post(`/settings/roles/${id}/validate`, { permissions });
  return response.data;
};

// Get role templates
export const getRoleTemplates = async (): Promise<RoleTemplate[]> => {
  // Instead of using hardcoded templates, fetch from API and transform into templates
  const roles = await getRoles();
  return roles
    .filter(role => role.isSystem)
    .map(role => ({
      id: role.id,
      name: role.name,
      description: role.description,
      isDefault: false,
      permissions: role.permissions
    }));
};

// Create role from template
export const createRoleFromTemplate = async (templateId: string): Promise<Role> => {
  const template = await getRole(templateId);
  return createRole({
    name: template.name,
    description: template.description,
    permissions: template.permissions.map(p => ({ id: p.id })),
    scope: 'Company',
    status: 'Active',
    isCustom: true,
    isSystem: false
  });
};

// Get all permissions
export const getAllPermissions = async (): Promise<Permission[]> => {
  const response = await api.get('/settings/roles/permissions');
  return response.data;
};

// Get module permissions
export const getModulePermissions = async (module: string): Promise<Permission[]> => {
  const permissions = await getAllPermissions();
  return permissions.filter(p => p.module === module);
};

// Helper function to format role display name
export const formatRoleName = (role: Role): string => {
  if (role.isSystem) {
    return `${role.name} (System)`;
  }
  return role.name;
};

// Helper function to get role badge color
export const getRoleBadgeColor = (role: Role): string => {
  if (role.isSystem) {
    return 'primary';
  }
  if (!role.isCustom) {
    return 'info';
  }
  switch (role.status) {
    case 'Active':
      return 'success';
    case 'Deprecated':
      return 'danger';
    case 'Inactive':
      return 'warning';
    default:
      return 'secondary';
  }
};

// Helper function to get role scope display text
export const formatRoleScope = (scope?: string): string => {
  if (!scope) return 'Global';
  return scope.charAt(0).toUpperCase() + scope.slice(1);
};

// Helper function to check if role can be modified
export const canModifyRole = (role: Role): boolean => {
  return !role.isSystem;
};

// Helper function to check if role can be deleted
export const canDeleteRole = (role: Role): boolean => {
  return !role.isSystem && (role.userCount || 0) === 0;
};

// Helper function to get role status badge color
export const getRoleStatusBadgeColor = (status: Role['status']): string => {
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

// Helper function to get permission access level badge color
export const getAccessLevelBadgeColor = (accessLevel: Permission['accessLevel']): string => {
  switch (accessLevel) {
    case 'Admin':
      return 'danger';
    case 'Write':
      return 'success';
    case 'Read':
      return 'info';
    default:
      return 'secondary';
  }
};

// Helper function to check if role has specific permission
export const hasPermission = (role: Role, permissionCode: string): boolean => {
  return role.permissions.some(p => p.code === permissionCode);
};

// Helper function to check if role has admin access to module
export const hasModuleAdminAccess = (role: Role, module: string): boolean => {
  return role.permissions.some(p => p.module === module && p.accessLevel === 'Admin');
};

// Helper function to get role's highest access level for module
export const getModuleAccessLevel = (role: Role, module: string): Permission['accessLevel'] => {
  const modulePermissions = role.permissions.filter(p => p.module === module);
  if (modulePermissions.some(p => p.accessLevel === 'Admin')) return 'Admin';
  if (modulePermissions.some(p => p.accessLevel === 'Write')) return 'Write';
  if (modulePermissions.some(p => p.accessLevel === 'Read')) return 'Read';
  return 'None';
};
