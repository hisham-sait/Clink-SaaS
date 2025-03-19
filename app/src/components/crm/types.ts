export type Status = 'Active' | 'Inactive' | 'Archived';
export type ActivityType = 'added' | 'updated' | 'removed' | 'status_changed';

export interface Organisation {
  id?: string;
  name: string;
  industry?: string;
  subIndustry?: string;
  website?: string;
  email?: string;
  phone?: string;
  fax?: string;
  billingAddress?: string;
  shippingAddress?: string;
  type: string[];
  status: Status;
  ownership?: string;
  lastContact?: string;
  nextFollowUp?: string;
  annualRevenue?: number;
  employeeCount?: number;
  rating?: number;
  parentCompany?: string;
  subsidiaries: string[];
  timezone?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  tags: string[];
  notes?: string;
  assignedTo?: string;
  companyId?: string;
}

export interface Client {
  id?: string;
  name: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  type: string[];
  status: Status;
  lastContact: string;
  revenue?: string;
  employeeCount?: number;
  notes?: string;
  companyId?: string;
}

export interface Activity {
  id: string;
  type: ActivityType;
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
  companyId: string;
}

export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
export type PlanType = 'BASIC' | 'STANDARD' | 'PREMIUM';

export interface ProductTier {
  id?: string;
  type: PlanType;
  price: number;
  features: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  type: ProductType;
  category: string;
  unit?: string;
  sku?: string;
  tiers: ProductTier[];
  status: Status;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  mobile?: string;
  department?: string;
  position: string;
  type: string[];
  source?: string;
  status: Status;
  lastContact: string;
  nextFollowUp?: string;
  socialProfiles?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
  mailingAddress?: string;
  otherAddress?: string;
  timezone?: string;
  preferredTime?: string;
  tags: string[];
  notes?: string;
  companyId: string;
  assignedTo?: string;
  estimatedValue?: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColumnPreference {
  id: string;
  visible: boolean;
  order: number;
  width?: number;
}

export interface UserColumnPreferences {
  [key: string]: ColumnPreference[]; // pageId -> column preferences
}

export interface Deal {
  id: string;
  name: string;
  amount: number;
  probability: number;
  expectedCloseDate: Date;
  status: string;
}

export interface Proposal {
  id: string;
  name: string;
  template?: string;
  content: any;
  variables?: any;
  status: Status;
  validUntil?: Date;
  contactId?: string;
  dealId?: string;
  companyId?: string;
  products: ProposalProduct[];
  contact?: Contact;
  deal?: Deal;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProposalProduct {
  id: string;
  proposalId: string;
  productId: string;
  planType: PlanType;
  tierId: string; // Reference to the selected tier (required)
  quantity: number;
  price: number;
  features: any[];
  product?: Product; // Make product optional for API requests
  showIndividualPricing?: boolean; // Flag to control individual pricing display
}

export interface ProposalTemplate {
  id: string;
  name: string;
  description?: string;
  content: any;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SectionTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  type: string;
  icon?: string;
  isDefault?: boolean;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}
