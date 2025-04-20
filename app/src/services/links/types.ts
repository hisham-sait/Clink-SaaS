// Common Types
export type LinkStatus = 'Active' | 'Inactive' | 'Expired' | 'Archived';
export type LinkType = 'ShortLink' | 'DigitalLink' | 'QRCode';
export type DigitalLinkType = 'ProductInfo' | 'Marketing' | 'Support' | 'Warranty' | 'Instructions' | 'Other';
export type QRCodeContentType = 'url' | 'text' | 'vcard' | 'email' | 'sms' | 'wifi' | 'location' | 'phone';

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

// QR Code Interfaces
export interface QRCode extends BaseEntity {
  title: string;
  content: string;
  contentType: QRCodeContentType;
  config: QRCodeConfig;
  status: LinkStatus;
  expiresAt: string | null;
  categoryId: string | null;
  category?: Category;
  clicks: number;
}

export interface QRCodeConfig {
  foreground?: string;
  background?: string;
  margin?: number;
  size?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  logo?: string | null;
  logoSize?: number;
  // dotsOptions
  body?: 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded' | 'square' | 
         'dots' | 'rounded' | 'extra-rounded' | 'classy' | 'classy-rounded';
  // cornersSquareOptions
  eye?: 'square' | 'dot' | 'extra-rounded' | 'square' | 'dot' | 'extra-rounded';
  // cornersDotOptions
  eyeBall?: 'square' | 'dot' | 'square' | 'dot';
  cornerSquareColor?: string;
  cornerDotColor?: string;
  gradient?: boolean;
  gradientColors?: string[];
  gradientType?: 'linear' | 'radial';
  // Border options
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderColor?: string;
  borderRadius?: number;
  borderMargin?: number;
  borderGradient?: boolean;
  borderGradientColors?: string[];
  borderGradientType?: 'linear' | 'radial';
  dataUrl?: string;
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

export interface QRCodesResponse {
  qrCodes: QRCode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
