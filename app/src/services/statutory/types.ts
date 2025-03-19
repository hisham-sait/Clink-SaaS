// Common Types
export type BaseStatus = 'Active' | 'Inactive' | 'Archived';
export type DirectorStatus = 'Active' | 'Resigned';
export type ShareholderStatus = 'Active' | 'Inactive';
export type ShareStatus = 'Active' | 'Inactive' | 'Archived';
export type BeneficialOwnerStatus = 'Active' | 'Inactive' | 'Archived';
export type AllotmentStatus = 'Active' | 'Cancelled';
export type ChargeStatus = 'Active' | 'Satisfied' | 'Released';
export type MeetingStatus = 'Draft' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
export type BoardMinuteStatus = 'Draft' | 'Final' | 'Signed';

// Base Entity Interface
export interface BaseEntity {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  companyId?: string;
  company?: {
    name: string;
    legalName: string;
  };
}

// Activity Types
export interface Activity {
  id: string;
  type: 'added' | 'updated' | 'removed' | 'status_changed' | 'appointment' | 'resignation' | 'deletion';
  entityType: string;
  entityId: string;
  description: string;
  user: string;
  time: string;
}

export interface ActivityStats {
  totalActivities: number;
  activityByType: { [key: string]: number };
  activityByEntity: { [key: string]: number };
}

// Director Types
export interface Director extends BaseEntity {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  appointmentDate: string;
  resignationDate?: string;
  directorType: string;
  occupation: string;
  otherDirectorships: string;
  shareholding: string;
  status: DirectorStatus;
}

// Shareholder Types
export interface Shareholder extends BaseEntity {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  ordinaryShares: number;
  preferentialShares: number;
  dateAcquired: string;
  status: ShareholderStatus;
}

// Share Types
export interface Share extends BaseEntity {
  class: string;
  type: 'Ordinary' | 'Preferential' | 'Deferred';
  nominalValue: number;
  currency: string;
  votingRights: boolean;
  dividendRights: boolean;
  transferable: boolean;
  totalIssued: number;
  status: ShareStatus;
  description?: string;
}

// Beneficial Owner Types
export interface BeneficialOwner extends BaseEntity {
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  natureOfControl: string[];
  ownershipPercentage: number;
  registrationDate: string;
  status: BeneficialOwnerStatus;
  description?: string;
}

// Allotment Types
export interface Allotment extends BaseEntity {
  allotmentId: string;
  shareClass: string;
  numberOfShares: number;
  pricePerShare: number;
  allotmentDate: string;
  allottee: string;
  paymentStatus: 'Pending' | 'Paid' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: string;
  certificateNumber?: string;
  status: AllotmentStatus;
}

// Charge Types
export interface Charge extends BaseEntity {
  chargeId: string;
  chargeType: string;
  amount: number;
  dateCreated: string;
  registrationDate: string;
  description: string;
  status: ChargeStatus;
  satisfactionDate?: string;
}

// Meeting Types
export interface Meeting extends BaseEntity {
  meetingType: 'AGM' | 'EGM' | 'Board Meeting' | 'Committee Meeting';
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  quorumRequired: number;
  quorumPresent: number;
  quorumAchieved: boolean;
  attendees: string[];
  agenda: string;
  status: MeetingStatus;
  resolutions: Resolution[];
}

export interface Resolution {
  id?: string;
  title: string;
  type: 'Ordinary' | 'Special';
  description: string;
  outcome: 'Pending' | 'Passed' | 'Failed' | 'Withdrawn';
  proposedBy: string;
  secondedBy: string;
}

// Board Minute Types
export interface BoardMinute extends BaseEntity {
  minuteId: string;
  meetingType: 'AGM' | 'EGM' | 'Board Meeting' | 'Committee Meeting';
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  content: string;
  discussions: Discussion[];
  resolutions: Resolution[];
  status: BoardMinuteStatus;
}

export interface Discussion {
  id?: string;
  topic: string;
  details: string;
  decisions: string;
  actionItems: ActionItem[];
}

export interface ActionItem {
  id?: string;
  task: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';
}

// Common Response Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Query Parameters
export interface QueryParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

// Export Types
export type ExportFormat = 'pdf' | 'excel';

// Import Types
export interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  failed: number;
  errors?: { row: number; message: string }[];
}

// Statutory Service Interface
export interface StatutoryService {
  // Directors
  getDirectors: (params?: QueryParams) => Promise<PaginatedResponse<Director>>;
  getDirector: (id: string) => Promise<Director>;
  createDirector: (director: Omit<Director, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Director>;
  updateDirector: (id: string, director: Partial<Director>) => Promise<Director>;
  deleteDirector: (id: string) => Promise<void>;
  resignDirector: (id: string, resignationDate: string) => Promise<Director>;

  // Shareholders
  getShareholders: (params?: QueryParams) => Promise<PaginatedResponse<Shareholder>>;
  getShareholder: (id: string) => Promise<Shareholder>;
  createShareholder: (shareholder: Omit<Shareholder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Shareholder>;
  updateShareholder: (id: string, shareholder: Partial<Shareholder>) => Promise<Shareholder>;
  deleteShareholder: (id: string) => Promise<void>;

  // Shares
  getShares: (params?: QueryParams) => Promise<PaginatedResponse<Share>>;
  getShare: (id: string) => Promise<Share>;
  createShare: (share: Omit<Share, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Share>;
  updateShare: (id: string, share: Partial<Share>) => Promise<Share>;
  deleteShare: (id: string) => Promise<void>;

  // Beneficial Owners
  getBeneficialOwners: (params?: QueryParams) => Promise<PaginatedResponse<BeneficialOwner>>;
  getBeneficialOwner: (id: string) => Promise<BeneficialOwner>;
  createBeneficialOwner: (owner: Omit<BeneficialOwner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BeneficialOwner>;
  updateBeneficialOwner: (id: string, owner: Partial<BeneficialOwner>) => Promise<BeneficialOwner>;
  deleteBeneficialOwner: (id: string) => Promise<void>;

  // Allotments
  getAllotments: (params?: QueryParams) => Promise<PaginatedResponse<Allotment>>;
  getAllotment: (id: string) => Promise<Allotment>;
  createAllotment: (allotment: Omit<Allotment, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Allotment>;
  updateAllotment: (id: string, allotment: Partial<Allotment>) => Promise<Allotment>;
  deleteAllotment: (id: string) => Promise<void>;

  // Charges
  getCharges: (params?: QueryParams) => Promise<PaginatedResponse<Charge>>;
  getCharge: (id: string) => Promise<Charge>;
  createCharge: (charge: Omit<Charge, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Charge>;
  updateCharge: (id: string, charge: Partial<Charge>) => Promise<Charge>;
  deleteCharge: (id: string) => Promise<void>;

  // Meetings
  getMeetings: (params?: QueryParams) => Promise<PaginatedResponse<Meeting>>;
  getMeeting: (id: string) => Promise<Meeting>;
  createMeeting: (meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Meeting>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<Meeting>;
  deleteMeeting: (id: string) => Promise<void>;

  // Board Minutes
  getBoardMinutes: (params?: QueryParams) => Promise<PaginatedResponse<BoardMinute>>;
  getBoardMinute: (id: string) => Promise<BoardMinute>;
  createBoardMinute: (minute: Omit<BoardMinute, 'id' | 'createdAt' | 'updatedAt'>) => Promise<BoardMinute>;
  updateBoardMinute: (id: string, minute: Partial<BoardMinute>) => Promise<BoardMinute>;
  deleteBoardMinute: (id: string) => Promise<void>;

  // Activities
  getActivities: (params?: { entityType?: string; limit?: number }) => Promise<Activity[]>;
  getActivityStatistics: () => Promise<ActivityStats>;

  // Export/Import
  exportData: (entityType: string, format: ExportFormat) => Promise<Blob>;
  importData: (entityType: string, file: File) => Promise<ImportResult>;
}
