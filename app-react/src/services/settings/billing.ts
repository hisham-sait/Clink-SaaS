import api from '../api';

export interface BillingDetails {
  id: string;
  companyId: string;
  company: {
    id: string;
    name: string;
    legalName: string;
  };
  taxId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currency: string;
  paymentTerms: number;
  paymentMethods: PaymentMethod[];
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  lastFour: string;
  expiryDate?: string;
  isDefault: boolean;
  status: 'Active' | 'Inactive';
  billingDetailsId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  createdById: string;
  createdBy: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  dueDate: string;
  paidDate?: string;
  items: {
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
  };
  payments: Payment[];
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice: Invoice;
  companyId: string;
  company: {
    id: string;
    name: string;
  };
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: string;
  completedAt?: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  status: 'Active' | 'Inactive';
}

// Billing Details
export const getBillingDetails = async (companyId: string): Promise<BillingDetails> => {
  const response = await api.get(`/settings/billing/${companyId}`);
  return response.data;
};

export const updateBillingDetails = async (companyId: string, data: Partial<BillingDetails>): Promise<BillingDetails> => {
  const response = await api.put(`/settings/billing/${companyId}`, data);
  return response.data;
};

// Payment Methods
export const getPaymentMethods = async (companyId: string): Promise<PaymentMethod[]> => {
  const response = await api.get(`/settings/billing/${companyId}/payment-methods`);
  return response.data;
};

export const addPaymentMethod = async (companyId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const response = await api.post(`/settings/billing/${companyId}/payment-methods`, data);
  return response.data;
};

export const updatePaymentMethod = async (companyId: string, methodId: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
  const response = await api.put(`/settings/billing/${companyId}/payment-methods/${methodId}`, data);
  return response.data;
};

export const deletePaymentMethod = async (companyId: string, methodId: string): Promise<void> => {
  await api.delete(`/settings/billing/${companyId}/payment-methods/${methodId}`);
};

export const setDefaultPaymentMethod = async (companyId: string, methodId: string): Promise<PaymentMethod> => {
  const response = await api.put(`/settings/billing/${companyId}/payment-methods/${methodId}/default`, {});
  return response.data;
};

// Invoices
export const getInvoices = async (companyId: string): Promise<Invoice[]> => {
  const response = await api.get(`/settings/billing/${companyId}/invoices`);
  return response.data;
};

export const getInvoice = async (companyId: string, invoiceId: string): Promise<Invoice> => {
  const response = await api.get(`/settings/billing/${companyId}/invoices/${invoiceId}`);
  return response.data;
};

export const createInvoice = async (companyId: string, data: Partial<Invoice>): Promise<Invoice> => {
  const response = await api.post(`/settings/billing/${companyId}/invoices`, data);
  return response.data;
};

export const updateInvoice = async (companyId: string, invoiceId: string, data: Partial<Invoice>): Promise<Invoice> => {
  const response = await api.put(`/settings/billing/${companyId}/invoices/${invoiceId}`, data);
  return response.data;
};

export const deleteInvoice = async (companyId: string, invoiceId: string): Promise<void> => {
  await api.delete(`/settings/billing/${companyId}/invoices/${invoiceId}`);
};

// Payments
export const getPayments = async (companyId: string): Promise<Payment[]> => {
  const response = await api.get(`/settings/billing/${companyId}/payments`);
  return response.data;
};

export const getPayment = async (companyId: string, paymentId: string): Promise<Payment> => {
  const response = await api.get(`/settings/billing/${companyId}/payments/${paymentId}`);
  return response.data;
};

export const createPayment = async (companyId: string, invoiceId: string, data: Partial<Payment>): Promise<Payment> => {
  const response = await api.post(`/settings/billing/${companyId}/invoices/${invoiceId}/payments`, data);
  return response.data;
};

// Platform Admin Operations
export const getAllInvoices = async (): Promise<Invoice[]> => {
  const response = await api.get('/settings/billing/invoices');
  return response.data;
};

export const getAllPayments = async (): Promise<Payment[]> => {
  const response = await api.get('/settings/billing/payments');
  return response.data;
};

export const generateInvoiceNumber = async (): Promise<string> => {
  const response = await api.get('/settings/billing/generate-invoice-number');
  return response.data;
};

// Plan Operations
export const getCurrentPlan = async (companyId: string): Promise<Plan> => {
  const response = await api.get(`/settings/billing/${companyId}/plan`);
  return response.data;
};

export const changePlan = async (companyId: string, planId: string): Promise<Plan> => {
  const response = await api.post(`/settings/billing/${companyId}/plan`, { planId });
  return response.data;
};

// Helper function to format currency
export const formatCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Helper function to get payment method display text
export const formatPaymentMethod = (method: PaymentMethod): string => {
  if (method.type === 'card') {
    return `Card ending in ${method.lastFour}`;
  }
  return `Bank account ending in ${method.lastFour}`;
};

// Helper function to get invoice status badge color
export const getInvoiceStatusColor = (status: Invoice['status']): string => {
  switch (status) {
    case 'Paid':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Overdue':
      return 'danger';
    default:
      return 'secondary';
  }
};

// Helper function to get payment status badge color
export const getPaymentStatusColor = (status: Payment['status']): string => {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'Pending':
      return 'warning';
    case 'Failed':
      return 'danger';
    default:
      return 'secondary';
  }
};
