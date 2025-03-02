import api from '../api';
import type { User } from './types';

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  department?: string;
  jobTitle?: string;
  roles: { id: string }[];
  status?: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
}

export interface InviteUserDto {
  email: string;
  roleId: string;
  department?: string;
  jobTitle?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  department?: string;
  jobTitle?: string;
  roles?: { id: string }[];
  status?: 'Active' | 'Pending' | 'Suspended' | 'Inactive';
}

// Get all users
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/settings/users', {
    params: {
      include: 'roles,plan,billingCompany'
    }
  });
  return response.data;
};

// Get user by ID
export const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/settings/users/${id}`, {
    params: {
      include: 'roles,plan,billingCompany'
    }
  });
  return response.data;
};

// Create new user
export const createUser = async (data: CreateUserDto): Promise<User> => {
  const response = await api.post('/settings/users/create', data);
  return response.data;
};

// Invite user
export const inviteUser = async (data: InviteUserDto): Promise<User> => {
  const response = await api.post('/settings/users/invite', data);
  return response.data;
};

// Update user
export const updateUser = async (id: string, data: UpdateUserDto): Promise<User> => {
  const response = await api.put(`/settings/users/${id}`, data);
  return response.data;
};

// Delete user
export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/settings/users/${id}`);
};

// Resend invite
export const resendInvite = async (id: string): Promise<void> => {
  await api.post(`/settings/users/${id}/resend-invite`);
};

// Suspend user
export const suspendUser = async (id: string): Promise<User> => {
  const response = await api.post(`/settings/users/${id}/suspend`);
  return response.data;
};

// Activate user
export const activateUser = async (id: string): Promise<User> => {
  const response = await api.post(`/settings/users/${id}/activate`);
  return response.data;
};

// Helper function to format user display name
export const formatUserName = (user: User): string => {
  const parts = [user.title, user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : user.email;
};

// Helper function to get user status badge color
export const getUserStatusColor = (status: User['status']): string => {
  switch (status) {
    case 'Active':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Suspended':
      return 'danger';
    case 'Inactive':
      return 'secondary';
    default:
      return 'secondary';
  }
};

// Helper function to get user role badge color
export const getUserRoleBadgeColor = (roleName: string): string => {
  switch (roleName) {
    case 'Super Administrator':
      return 'danger';
    case 'Administrator':
      return 'primary';
    case 'Billing Administrator':
      return 'success';
    case 'User Manager':
      return 'info';
    default:
      return 'secondary';
  }
};

// Helper function to check if user has specific role
export const hasRole = (user: User, roleName: string): boolean => {
  return user.roles.some(role => role.name === roleName);
};

// Helper function to check if user is admin
export const isAdmin = (user: User): boolean => {
  return hasRole(user, 'Super Administrator') || hasRole(user, 'Administrator');
};

// Helper function to check if user can manage users
export const canManageUsers = (user: User): boolean => {
  return isAdmin(user) || hasRole(user, 'User Manager');
};

// Helper function to check if user can manage billing
export const canManageBilling = (user: User): boolean => {
  return isAdmin(user) || hasRole(user, 'Billing Administrator');
};
