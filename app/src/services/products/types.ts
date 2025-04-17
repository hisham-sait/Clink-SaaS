// Common Types
export type ProductStatus = 'Active' | 'Inactive' | 'Draft' | 'Archived';
export type ProductType = 'PHYSICAL' | 'DIGITAL' | 'SERVICE';
export type AttributeType = 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'SELECT' | 'MULTISELECT';

// Base Entity Interface
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  companyId: string;
}

// Product Interfaces
export interface Product extends BaseEntity {
  name: string;
  sku: string;
  description: string;
  type: ProductType;
  status: ProductStatus;
  categoryId: string | null;
  category?: Category;
  familyId: string | null;
  family?: Family;
  attributes?: ProductAttribute[];
  sections?: ProductSection[];
  media?: Media[];
  completeness?: number;
}

export interface Category extends BaseEntity {
  name: string;
  description: string;
  parentId: string | null;
  parent?: Category;
  children?: Category[];
  status: ProductStatus;
  productCount?: number;
}

export interface Family extends BaseEntity {
  name: string;
  description: string;
  status: ProductStatus;
  attributeGroups?: AttributeGroup[];
  productCount?: number;
}

export interface Attribute extends BaseEntity {
  name: string;
  code: string;
  type: AttributeType;
  description: string;
  isRequired: boolean;
  isUnique: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  isUsedInGrid: boolean;
  position: number;
  defaultValue?: string;
  options?: AttributeOption[];
  status: ProductStatus;
  sectionId?: string | null;
  section?: Section;
}

export interface AttributeOption {
  id: string;
  value: string;
  label: string;
  position: number;
}

export interface AttributeGroup extends BaseEntity {
  name: string;
  code: string;
  description: string;
  position: number;
  familyId: string;
  attributes: Attribute[];
}

export interface ProductAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attribute: Attribute;
  value: string;
  valueText?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueDate?: string;
  valueOptions?: string[];
}

export interface Section extends BaseEntity {
  name: string;
  code: string;
  description: string;
  position: number;
  status: ProductStatus;
  attributes?: Attribute[];
}

export interface ProductSection {
  id: string;
  productId: string;
  sectionId: string;
  section: Section;
  values: { [key: string]: any };
}

export interface Media extends BaseEntity {
  productId: string;
  type: 'image' | 'video' | 'document';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  position: number;
  isMain: boolean;
  alt?: string;
  title?: string;
}

export interface Activity extends BaseEntity {
  type: 'created' | 'updated' | 'deleted' | 'status_changed' | 'attribute_changed';
  entityType: 'product' | 'category' | 'family' | 'attribute' | 'section';
  entityId: string;
  description: string;
  user: string;
  changes?: { [key: string]: { old: any; new: any } };
}

// Import/Export Interfaces
export interface ImportResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors?: { row: number; error: string }[];
}

// Query Parameters
export interface ProductQueryParams {
  search?: string;
  categoryId?: string;
  familyId?: string;
  status?: ProductStatus;
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

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
}

export interface FamiliesResponse {
  families: Family[];
  total: number;
}

export interface AttributesResponse {
  attributes: Attribute[];
  total: number;
}

export interface SectionsResponse {
  sections: Section[];
  total: number;
}

export interface ActivitiesResponse {
  activities: Activity[];
  total: number;
}
