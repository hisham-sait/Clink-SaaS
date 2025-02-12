export interface Company {
  id: string;
  name: string;
  legalName: string;
}

export interface BillingDetails {
  company?: Company;
  taxId: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  currency: string;
  paymentTerms: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  lastFour: string;
  expiryDate: string;
  isDefault: boolean;
}

export interface Invoice {
  id: string;
  companyId: string;
  number: string;
  createdAt: string;
  dueDate: string;
  amount: number;
  currency: string;
  status: 'Draft' | 'Pending' | 'Paid' | 'Overdue';
  description: string;
}

export interface PaymentMethodFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  nameOnCard: string;
  setDefault: boolean;
}

export interface InvoiceFormData {
  companyId: string;
  amount: number;
  dueDate: string;
  description: string;
}
