// Common Types
export type DirectorStatus = 'Active' | 'Resigned';
export type Status = 'Active' | 'Inactive';
export type DocumentStatus = 'Draft' | 'Final' | 'Signed';

// Director Interfaces
export interface Director {
  id: string;
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
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Activity Response Interface
export interface ActivityResponse {
  activities: Activity[];
  total: number;
}

// Shareholder Interfaces
export interface Shareholder {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  email: string;
  phone: string;
  shares: {
    ordinary: number;
    preferential: number;
  };
  dateAcquired: string;
  status: Status;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Share Interfaces
export interface Share {
  id: string;
  class: string;
  type: 'Ordinary' | 'Preferential' | 'Deferred';
  nominalValue: number;
  currency: string;
  votingRights: boolean;
  dividendRights: boolean;
  transferable: boolean;
  totalIssued: number;
  status: Status;
  description?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Beneficial Owner Interfaces
export interface BeneficialOwner {
  id: string;
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
  status: Status;
  description?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Charge Interfaces
export interface Charge {
  id: string;
  chargeType: string;
  dateCreated: string;
  amount: number;
  currency: string;
  chargor: string;
  chargee: string;
  description: string;
  propertyCharged: string;
  registrationDate: string;
  status: 'Active' | 'Satisfied' | 'Released';
  satisfactionDate?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Allotment Interfaces
export interface Allotment {
  id: string;
  allotmentDate: string;
  shareClass: string;
  numberOfShares: number;
  pricePerShare: number;
  currency: string;
  allottee: string;
  paymentStatus: 'Paid' | 'Unpaid' | 'Partially Paid';
  amountPaid?: number;
  paymentDate?: string;
  certificateNumber?: string;
  status: Status;
  notes?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Meeting Interfaces
export interface Resolution {
  title: string;
  type?: 'Ordinary' | 'Special';
  description: string;
  outcome: 'Passed' | 'Rejected' | 'Pending' | 'Deferred';
  proposedBy?: string;
  secondedBy?: string;
}

export interface Meeting {
  id: string;
  meetingDate: string;
  meetingType: 'AGM' | 'EGM' | 'Class Meeting';
  venue: string;
  startTime: string;
  endTime: string;
  chairperson: string;
  attendees: string[];
  agenda: string;
  resolutions: Resolution[];
  quorum: {
    required: number;
    present: number;
    achieved: boolean;
  };
  minutes: string;
  status: DocumentStatus;
  attachments?: string[];
  notes?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Board Minute Interfaces
export interface ActionItem {
  task: string;
  assignee: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface Discussion {
  topic: string;
  details: string;
  decisions: string[];
  actionItems?: ActionItem[];
}

export interface BoardMinute {
  id: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  agenda: string;
  discussions: Discussion[];
  resolutions: Resolution[];
  minutes: string;
  status: DocumentStatus;
  attachments?: string[];
  notes?: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

// Activity Interface
export interface Activity {
  id: string;
  type: 'appointment' | 'resignation' | 'update' | 'removal' | 
        'added' | 'updated' | 'removed' | 'status_changed';
  entityType?: string;
  entityId?: string;
  description: string;
  user: string;
  time: string;
  companyId: string;
}
