// Common Types
export type Status = 'Active' | 'Inactive';
export type Theme = 'Light' | 'Dark' | 'System';
export type Language = 'English' | 'Spanish' | 'French' | 'German';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'INR';
export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
export type TimeFormat = '12h' | '24h';

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

// Organization Interfaces
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Organization {
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
  fiscalYearEnd: string;
  currency: Currency;
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

// Billing Interfaces
export interface Subscription {
  id: string;
  plan: string;
  status: 'active' | 'cancelled' | 'past_due';
  startDate: string;
  endDate?: string;
  billingCycle: 'monthly' | 'annual';
  amount: number;
  currency: Currency;
  autoRenew: boolean;
  features: string[];
}

export interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: Currency;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  invoice?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank' | 'paypal';
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
  status: Status;
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
