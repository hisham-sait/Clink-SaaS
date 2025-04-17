// Common types used across the application

export interface Activity {
  id?: string;
  type: string;
  entityType?: string;
  entityId?: string;
  description: string;
  user: string;
  time: Date | string;
  companyId?: string;
}
