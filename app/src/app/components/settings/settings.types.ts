// Common Types
export type Status = 'Active' | 'Inactive';
export type Theme = 'Light' | 'Dark' | 'System';
export type Language = 'English' | 'Spanish' | 'French' | 'German';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

// Role Types
export type RoleScope = 'Global' | 'Company' | 'Team';
export type RoleStatus = 'Active' | 'Inactive' | 'Deprecated';
export type AccessLevel = 'None' | 'Read' | 'Write' | 'Admin';

// Plan Types
export type PlanStatus = 'Active' | 'Inactive' | 'Deprecated';
export type BillingCycle = 'Monthly' | 'Yearly' | 'Quarterly';

// Billing Types
export type InvoiceStatus = 'Draft' | 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';

// Role Interfaces
export interface Permission {
  id: string;
  name: string;
  code: string;
  description: string;
  module: string;
  accessLevel: AccessLevel;
}

export interface RoleTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Permission[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  scope: RoleScope;
  permissions: Permission[];
  status: RoleStatus;
  isCustom: boolean;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  users?: User[];
  userCount?: number;
  metadata?: {
    allowedModules?: string[];
    maxUsers?: number;
    restrictions?: string[];
  };
}

// Plan Interface
export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: BillingCycle;
  features: string[];
  maxUsers: number;
  maxCompanies: number;
  status: PlanStatus;
  isCustom: boolean;
  metadata?: {
    allowedModules?: string[];
    restrictions?: string[];
    customFeatures?: string[];
  };
  createdAt: string;
  updatedAt: string;
  users?: User[]; // Users on this plan
  userCount?: number; // Count of users on this plan
}

// Billing Interfaces
export interface BillingDetails {
  id: string;
  companyId: string;
  company?: Company;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  taxId?: string;
  currency: Currency;
  paymentTerms: number;
  paymentMethods: PaymentMethod[];
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  billingDetailsId: string;
  type: 'card' | 'bank';
  provider: 'stripe' | 'paypal';
  lastFour?: string;
  expiryDate?: string;
  isDefault: boolean;
  status: Status;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  company?: Company;
  amount: number;
  currency: Currency;
  status: InvoiceStatus;
  dueDate: string;
  paidDate?: string;
  items: {
    items: {
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }[];
    subtotal: number;
    tax: number;
    total: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  payments?: Payment[];
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: Invoice;
  companyId: string;
  company?: Company;
  amount: number;
  currency: Currency;
  method: string;
  status: PaymentStatus;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

// User Types
export type UserStatus = 'Active' | 'Inactive' | 'Pending' | 'Suspended';

// Company Types
export type CompanyType = 'Primary' | 'Client' | 'Subsidiary' | 'Partner' | 'Other';
export type CompanyStatus = 'Active' | 'Inactive' | 'Pending' | 'Archived';
export type CompanyTag = 'Primary Organization' | 'My Organization' | 'Client' | 'Partner' | 'Subsidiary';

// User Interface
export interface User {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  lastLogin?: string;
  invitedBy?: string;
  invitedAt?: string;
  joinedAt?: string;
  status: UserStatus;
  planId?: string; // Selected plan ID
  plan?: Plan; // Selected plan
  billingCompanyId?: string; // Selected billing company ID
  billingCompany?: Company; // Selected billing company
  createdAt: string;
  updatedAt: string;
  roles: Role[];
}

// Company Interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Company {
  id: string;
  name: string;
  legalName: string;
  registrationNumber: string;
  vatNumber?: string;
  address: Address;
  phone: string;
  email: string;
  website?: string;
  logo?: string;
  industry: string;
  size: string;
  type: CompanyType;
  tags: CompanyTag[];
  fiscalYearEnd: string;
  currency: Currency;
  status: CompanyStatus;
  createdAt: string;
  updatedAt: string;
  primaryContact?: {
    name: string;
    email: string;
    phone: string;
    role: string;
  };
  notes?: string;
  billingDetails?: BillingDetails;
  billingForUsers?: User[]; // Users who selected this company for billing
}

// Profile Interfaces
export interface Profile {
  id: string;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  jobTitle?: string;
  department?: string;
  timeZone: string;
  language: Language;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  status: Status;
}

// Security Interfaces
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: 'app' | 'sms' | 'email';
  passwordLastChanged: string;
  loginHistory: LoginActivity[];
  activeSessions: Session[];
  securityQuestions: SecurityQuestion[];
}

export interface LoginActivity {
  timestamp: string;
  ipAddress: string;
  device: string;
  browser: string;
  location: string;
  status: 'success' | 'failed';
}

export interface Session {
  id: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  status: 'active' | 'expired';
}

export interface SecurityQuestion {
  question: string;
  answer: string;
  lastUpdated: string;
}

// Preferences Interfaces
export interface Preferences {
  theme: Theme;
  language: Language;
  notifications: NotificationPreferences;
  accessibility: AccessibilitySettings;
  display: DisplaySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  emailDigest: 'none' | 'daily' | 'weekly';
  categories: {
    [key: string]: boolean;
  };
}

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

export interface DisplaySettings {
  density: 'compact' | 'comfortable' | 'spacious';
  defaultView: 'list' | 'grid' | 'table';
  showTips: boolean;
}

// Integration Interfaces
export interface Integration {
  id: string;
  name: string;
  provider: string;
  type: string;
  status: 'connected' | 'disconnected' | 'pending';
  connectedAt?: string;
  lastSync?: string;
  configuration: Record<string, any>;
  permissions: string[];
}

// Activity Interface
export interface SettingsActivity {
  id: string;
  type: 'update' | 'security' | 'billing' | 'integration';
  description: string;
  user: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Navigation Interface
export interface NavItem {
  path: string;
  title: string;
  icon: string;
  description: string;
}

// Module-specific Permissions
export const MODULE_PERMISSIONS: { [key: string]: Permission[] } = {
  users: [
    {
      id: 'users-view',
      name: 'View Users',
      code: 'users-view',
      description: 'View user list and details',
      module: 'users',
      accessLevel: 'Read'
    },
    {
      id: 'users-create',
      name: 'Create Users',
      code: 'users-create',
      description: 'Create new users',
      module: 'users',
      accessLevel: 'Write'
    },
    {
      id: 'users-edit',
      name: 'Edit Users',
      code: 'users-edit',
      description: 'Edit user details',
      module: 'users',
      accessLevel: 'Write'
    },
    {
      id: 'users-delete',
      name: 'Delete Users',
      code: 'users-delete',
      description: 'Delete users',
      module: 'users',
      accessLevel: 'Admin'
    }
  ],
  roles: [
    {
      id: 'roles-view',
      name: 'View Roles',
      code: 'roles-view',
      description: 'View roles and permissions',
      module: 'roles',
      accessLevel: 'Read'
    },
    {
      id: 'roles-create',
      name: 'Create Roles',
      code: 'roles-create',
      description: 'Create new roles',
      module: 'roles',
      accessLevel: 'Write'
    },
    {
      id: 'roles-edit',
      name: 'Edit Roles',
      code: 'roles-edit',
      description: 'Edit role details and permissions',
      module: 'roles',
      accessLevel: 'Write'
    },
    {
      id: 'roles-delete',
      name: 'Delete Roles',
      code: 'roles-delete',
      description: 'Delete custom roles',
      module: 'roles',
      accessLevel: 'Admin'
    }
  ],
  companies: [
    {
      id: 'companies-view',
      name: 'View Companies',
      code: 'companies-view',
      description: 'View company list and details',
      module: 'companies',
      accessLevel: 'Read'
    },
    {
      id: 'companies-create',
      name: 'Create Companies',
      code: 'companies-create',
      description: 'Create new companies',
      module: 'companies',
      accessLevel: 'Write'
    },
    {
      id: 'companies-edit',
      name: 'Edit Companies',
      code: 'companies-edit',
      description: 'Edit company details',
      module: 'companies',
      accessLevel: 'Write'
    },
    {
      id: 'companies-delete',
      name: 'Delete Companies',
      code: 'companies-delete',
      description: 'Delete companies',
      module: 'companies',
      accessLevel: 'Admin'
    }
  ],
  plans: [
    {
      id: 'plans-view',
      name: 'View Plans',
      code: 'plans-view',
      description: 'View subscription plans',
      module: 'plans',
      accessLevel: 'Read'
    },
    {
      id: 'plans-create',
      name: 'Create Plans',
      code: 'plans-create',
      description: 'Create new subscription plans',
      module: 'plans',
      accessLevel: 'Admin'
    },
    {
      id: 'plans-edit',
      name: 'Edit Plans',
      code: 'plans-edit',
      description: 'Edit subscription plans',
      module: 'plans',
      accessLevel: 'Admin'
    },
    {
      id: 'plans-delete',
      name: 'Delete Plans',
      code: 'plans-delete',
      description: 'Delete subscription plans',
      module: 'plans',
      accessLevel: 'Admin'
    }
  ],
  billing: [
    {
      id: 'billing-view',
      name: 'View Billing',
      code: 'billing-view',
      description: 'View billing and subscription details',
      module: 'billing',
      accessLevel: 'Read'
    },
    {
      id: 'billing-manage',
      name: 'Manage Billing',
      code: 'billing-manage',
      description: 'Manage billing and subscriptions',
      module: 'billing',
      accessLevel: 'Write'
    },
    {
      id: 'billing-admin',
      name: 'Billing Admin',
      code: 'billing-admin',
      description: 'Full billing administration',
      module: 'billing',
      accessLevel: 'Admin'
    }
  ],
  settings: [
    {
      id: 'settings-view',
      name: 'View Settings',
      code: 'settings-view',
      description: 'View system settings',
      module: 'settings',
      accessLevel: 'Read'
    },
    {
      id: 'settings-edit',
      name: 'Edit Settings',
      code: 'settings-edit',
      description: 'Edit system settings',
      module: 'settings',
      accessLevel: 'Write'
    },
    {
      id: 'settings-admin',
      name: 'Settings Admin',
      code: 'settings-admin',
      description: 'Full settings administration',
      module: 'settings',
      accessLevel: 'Admin'
    }
  ]
};

// Predefined Role Templates
export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    id: 'super-admin',
    name: 'Super Administrator',
    description: 'Full system access with all permissions',
    isDefault: false,
    permissions: []  // Will be populated with all permissions
  },
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Company-wide administrative access',
    isDefault: false,
    permissions: []
  },
  {
    id: 'billing-admin',
    name: 'Billing Administrator',
    description: 'Manage billing, subscriptions, and payments',
    isDefault: false,
    permissions: []
  },
  {
    id: 'compliance-manager',
    name: 'Compliance Manager',
    description: 'Manage compliance, audits, and regulatory requirements',
    isDefault: false,
    permissions: []
  },
  {
    id: 'accountant',
    name: 'Accountant',
    description: 'Access to accounting and financial features',
    isDefault: false,
    permissions: []
  },
  {
    id: 'tax-specialist',
    name: 'Tax Specialist',
    description: 'Manage tax-related operations and filings',
    isDefault: false,
    permissions: []
  },
  {
    id: 'team-manager',
    name: 'Team Manager',
    description: 'Manage team members and their work',
    isDefault: false,
    permissions: []
  },
  {
    id: 'user-manager',
    name: 'User Manager',
    description: 'Manage user accounts and permissions',
    isDefault: false,
    permissions: []
  },
  {
    id: 'report-viewer',
    name: 'Report Viewer',
    description: 'View reports and analytics',
    isDefault: true,
    permissions: []
  },
  {
    id: 'basic-user',
    name: 'Basic User',
    description: 'Standard user access',
    isDefault: true,
    permissions: []
  }
];
