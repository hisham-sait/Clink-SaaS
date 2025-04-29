// Common Types
export type LinkStatus = 'Active' | 'Inactive' | 'Expired' | 'Archived';
export type LinkType = 'ShortLink' | 'DigitalLink';
export type DigitalLinkType = 'ProductInfo' | 'Marketing' | 'Support' | 'Warranty' | 'Instructions' | 'Other';

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

// ShortLink Interfaces
export interface ShortLink extends BaseEntity {
  title: string;
  shortCode: string;
  originalUrl: string;
  status: LinkStatus;
  expiresAt: string | null;
  password: string | null;
  categoryId: string | null;
  category?: Category;
  clicks: number;
}

// DigitalLink Interfaces
export interface DigitalLink extends BaseEntity {
  title: string;
  linkCode: string;
  type: DigitalLinkType;
  gs1Key: string;
  gs1KeyType: string;
  gs1Url?: string;
  redirectType: 'standard' | 'custom';
  customUrl?: string | null;
  productId?: string | null;
  productSku?: string | null;
  productName?: string | null;
  description?: string | null;
  tags?: string[];
  status: LinkStatus;
  expiresAt: string | null;
  password: string | null;
  categoryId: string | null;
  category?: Category;
  metadata?: { [key: string]: any };
  clicks: number;
}


export interface Category extends BaseEntity {
  name: string;
  description: string;
  color?: string;
  icon?: string;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  status: LinkStatus;
  linkCount?: number;
}


// Query Parameters
export interface LinkQueryParams {
  search?: string;
  categoryId?: string;
  status?: LinkStatus;
  type?: LinkType;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}


// Response Interfaces
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShortLinksResponse {
  shortLinks: ShortLink[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DigitalLinksResponse {
  digitalLinks: DigitalLink[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface QRCodeOptions {
  size?: number;
  color?: string;
  backgroundColor?: string;
  margin?: number;
  format?: 'png' | 'svg' | 'pdf';
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logo?: string;
}

export interface QRCodeResponse {
  url: string;
  dataUrl?: string;
}
