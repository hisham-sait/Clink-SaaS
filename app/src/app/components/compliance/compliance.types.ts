// Common Status Types
export type Status = 'Active' | 'Inactive' | 'Draft' | 'Under Review' | 'Pending' | 'In Progress' | 'Completed' | 'Archived' | 'Superseded' | 'Repealed';
export type ComplianceStatus = 'Compliant' | 'Partially Compliant' | 'Non-Compliant' | 'Not Applicable';
export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ReviewStatus = 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Changes Requested';
export type DocumentStatus = 'Draft' | 'Final' | 'Active' | 'Archived' | 'Signed' | 'Submitted' | 'Published' | 'Under Review';
export type Frequency = 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'As Needed' | 'One-Time';
export type DataStatus = 'Pending' | 'Collected' | 'Verified' | 'Reported';
export type VerificationStatus = 'Pending' | 'In Review' | 'Verified' | 'Failed';
export type TrackingStatus = 'On Track' | 'At Risk' | 'Off Track' | 'Completed' | 'Not Started';
export type AlertType = 'Info' | 'Warning' | 'Critical' | 'Success';
export type MonitoringFrequency = 'Real-time' | 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';

// Additional Status Types
export type FindingStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';
export type FindingSeverity = 'Low' | 'Medium' | 'High' | 'Critical';
export type ESGCategory = 'Environmental' | 'Social' | 'Governance';
export type MetricStatus = 'Above Target' | 'On Target' | 'Below Target';
export type ReportingPeriod = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
export type FilingStatus = 'Draft' | 'Pending Review' | 'Submitted' | 'Accepted' | 'Rejected' | 'Amended';
export type FilingFrequency = 'One-Time' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';
export type FilingPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RegulatoryStatus = 'Draft' | 'Active' | 'Under Review' | 'Superseded' | 'Archived';
export type UpdateFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'As Needed';

// Base Interfaces
export interface BaseEntity {
  id: string;
  title: string;
  description: string;
  companyId: string;
  company?: {
    id: string;
    name: string;
  };
}

export interface BaseDocument {
  id: string;
  title: string;
  type: string;
  version: string;
  status: DocumentStatus;
  author: string;
  uploadDate: string;
  effectiveDate: string;
  expiryDate?: string;
  path: string;
  attachments?: string[];
}

// Filter and Pagination Interfaces
export interface FilterOptions {
  search?: string;
  status?: Status;
  riskLevel?: RiskLevel;
  complianceStatus?: ComplianceStatus;
  authority?: string;
  jurisdiction?: string;
  category?: string;
  owner?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Modal Result Interfaces
export interface RequirementModalResult {
  action?: 'create' | 'edit' | 'delete';
  requirement?: RegulatoryRequirement;
  status?: Status;
  owner?: string;
}

export interface BulkModalResult {
  action: 'status' | 'owner' | 'delete';
  status?: Status;
  owner?: string;
  confirmed?: boolean;
}

// Bulk Operation Results
export interface BulkActionResult {
  success: boolean;
  processed: number;
  failed: number;
  errors?: { id: string; error: string }[];
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: {
    row: number;
    error: string;
    data?: any;
  }[];
}

// Regulatory Types
export interface Obligation extends BaseEntity {
  dueDate: string;
  frequency: string;
  status: ComplianceStatus;
  assignedTo: string;
  evidence: string[];
  attachments?: string[];
  comments: string[];
  requirementId: string;
}

export interface Control extends BaseEntity {
  name: string;
  type: string;
  status: Status;
  effectiveness: 'Effective' | 'Partially Effective' | 'Ineffective';
  implementation: string;
  testing: string;
  owner: string;
  lastTestedDate: string;
  nextTestDate: string;
  evidence: string[];
  requirementId: string;
}

export interface RegulatoryDocument extends BaseDocument {
  tags: string[];
  requirementId: string;
}

// Audit Types
export interface Audit extends BaseEntity {
  type: 'Internal' | 'External' | 'Regulatory' | 'Compliance';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed';
  startDate: string;
  endDate: string;
  auditor: string;
  department: string;
  scope: string;
  methodology: string;
  findings: Finding[];
  recommendations: string[];
  attachments?: string[];
  documents?: string[]; 
}

export interface Finding extends BaseEntity {
  severity: RiskLevel;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  identifiedDate: string;
  targetResolutionDate: string;
  actualResolutionDate?: string;
  dueDate?: string;
  closedDate?: string;
  assignedTo: string;
  remediation: string;
  evidence?: string[];
  entityId: string;
  entityType: 'audit' | 'assessment';
}

// ESG Types
export interface ESGMetric extends BaseEntity {
  name?: string;
  category: 'Environmental' | 'Social' | 'Governance';
  unit: string;
  target: number;
  current: number;
  status: TrackingStatus;
  reportingPeriod: Frequency;
  lastUpdated: string;
  nextReportDue: string;
  methodology: string;
  dataSource: string;
}

export interface ESGInitiative extends BaseEntity {
  category: 'Environmental' | 'Social' | 'Governance';
  startDate: string;
  endDate: string;
  status: Status;
  budget: number;
  spent: number;
  impact: string;
  stakeholders: string[];
  metrics: string[];
  documents?: string[];
}

export interface ESGTarget extends BaseEntity {
  metricId: string;
  value: number;
  targetDate: string;
  status: TrackingStatus;
  milestones: ESGMilestone[];
}

export interface ESGMilestone {
  id: string;
  targetId: string;
  title: string;
  description: string;
  dueDate: string;
  completionDate?: string;
  value: number;
  status: 'Not Started' | 'In Progress' | 'Completed';
}

// Policy Types
export interface Policy extends BaseEntity {
  policyNumber: string;
  version: string;
  category: 'HR' | 'IT' | 'Finance' | 'Operations' | 'Compliance' | 'Security' | 'General';
  status: Status;
  purpose: string;
  scope: string;
  content: string;
  owner: string;
  approver: string;
  effectiveDate: string;
  expiryDate?: string;
  lastReviewDate: string;
  nextReviewDate: string;
  reviewFrequency: Frequency;
  relatedPolicies: string[];
  references: string[];
  acknowledgments: PolicyAcknowledgment[];
  reviews: PolicyReview[];
  revisions: PolicyRevision[];
}

export interface PolicyAcknowledgment {
  id: string;
  userId: string;
  userName: string;
  acknowledgedDate: string;
  version: string;
  comments?: string;
  policyId: string;
}

export interface PolicyReview {
  id: string;
  reviewer: string;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  status: ReviewStatus;
  comments: string[];
  changes: string[];
  attachments?: string[];
  policyId: string;
}

export interface PolicyRevision {
  id: string;
  version: string;
  changes: string[];
  author: string;
  date: string;
  approvalStatus: ApprovalStatus;
  approver?: string;
  approvalDate?: string;
  comments?: string[];
  policyId: string;
}

// Filing Types
export interface Filing extends BaseEntity {
  authority: string;
  referenceNumber?: string;
  type: string;
  status: FilingStatus;
  frequency: FilingFrequency;
  priority: FilingPriority;
  dueDate: string;
  submissionDate?: string;
  acceptanceDate?: string;
  period: {
    start: string;
    end: string;
  };
  assignedTo: string;
  reviewedBy?: string;
  documents: FilingDocument[];
  comments: FilingComment[];
  history: FilingHistory[];
  reminders: FilingReminder[];
  attachments?: string[];
}

export interface FilingDocument extends BaseDocument {
  size: number;
  comments: string[];
  filingId: string;
}

export interface FilingComment {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
  type: 'General' | 'Review' | 'System';
  attachments?: string[];
  filingId: string;
}

export interface FilingHistory {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  user: string;
  changes?: {
    field: string;
    oldValue: string;
    newValue: string;
  }[];
  filingId: string;
}

export interface FilingReminder {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'Pending' | 'Sent' | 'Acknowledged';
  type: 'Email' | 'System' | 'SMS';
  recipients: string[];
  frequency: 'Once' | 'Daily' | 'Weekly';
  filingId: string;
}

// Assessment Types
export interface Assessment extends BaseEntity {
  assessor: string;
  date: string;
  type: 'Internal' | 'External' | 'Self';
  status: 'Planned' | 'In Progress' | 'Completed';
  findings: Finding[];
  recommendations: string[];
  attachments?: string[];
  requirementId: string;
}

// Governance Types
export interface GovernanceFramework extends BaseEntity {
  version: string;
  status: Status;
  effectiveDate: string;
  lastReviewDate: string;
  nextReviewDate: string;
  owner: string;
  reviewers: string[];
  principles: GoverningPrinciple[];
  documents: GovernanceDocument[];
}

export interface GoverningPrinciple extends BaseEntity {
  category: string;
  requirements: string[];
  complianceStatus: ComplianceStatus;
  evidence: string[];
  assessments: Assessment[];
  recommendations: string[];
  frameworkId: string;
}

export interface Committee extends BaseEntity {
  type: string;
  status: Status;
  charter: string;
  members: CommitteeMember[];
  meetings: CommitteeMeeting[];
  responsibilities: string[];
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  appointmentDate: string;
  endDate?: string;
  status: 'Active' | 'Inactive';
  expertise: string[];
  committeeId: string;
}

export interface CommitteeMeeting {
  id: string;
  type: 'Regular' | 'Special' | 'Emergency' | 'Annual';
  date: string;
  time: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  meetingMode: 'physical' | 'virtual' | 'hybrid';
  location?: string;
  virtualLink?: string;
  agenda: string[];
  attendees: CommitteeMeetingAttendee[];
  minutes?: string;
  decisions: string[];
  actionItems: CommitteeActionItem[];
  materials?: string[];
  notes?: string;
  attachments?: string[];
  committeeId: string;
}

export interface CommitteeMeetingAttendee {
  id: string;
  name: string;
  role: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  notes?: string;
  meetingId: string;
}

export interface CommitteeActionItem {
  id: string;
  task: string;
  assignedTo: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue';
  notes?: string;
  meetingId: string;
}

export interface GovernanceDocument extends BaseDocument {
  reviewFrequency: Frequency;
  nextReviewDate: string;
  tags: string[];
  frameworkId: string;
}

export interface RegulatoryRequirement extends BaseEntity {
  authority: string;
  jurisdiction: string;
  category: string;
  status: RegulatoryStatus;
  lastUpdateDate: string;
  nextReviewDate: string;
  effectiveDate: string;
  updateFrequency: UpdateFrequency;
  riskLevel: RiskLevel;
  complianceStatus: ComplianceStatus;
  applicability: string;
  obligations: Obligation[];
  controls: Control[];
  documents: RegulatoryDocument[];
  assessments: Assessment[];
}

// Report Types
export interface Report extends BaseEntity {
  category: 'Compliance' | 'Audit' | 'Risk' | 'Performance' | 'Regulatory' | 'ESG' | 'Executive';
  status: DocumentStatus;
  frequency: Frequency;
  period: {
    start: string;
    end: string;
  };
  author: string;
  reviewers: string[];
  approver?: string;
  publishedDate?: string;
  sections: ReportSection[];
  metrics: ReportMetric[];
  findings: Finding[];
  recommendations: string[];
  distribution: string[];
  tags: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  order: number;
  content: string;
  dataFormat: 'Table' | 'Chart' | 'Graph' | 'Summary' | 'Detailed';
  charts?: ChartData[];
  tables?: TableData[];
  summary?: string;
  attachments?: string[];
  reportId: string;
}

export interface ReportMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  target: number;
  unit: string;
  trend: 'Up' | 'Down' | 'Stable';
  comparisonPeriod: string;
  previousValue?: number;
  variance: number;
  status: 'Above Target' | 'On Target' | 'Below Target';
  notes?: string;
  reportId: string;
}

// Tracking Types
export interface TrackingItem extends BaseEntity {
  category: string;
  status: TrackingStatus;
  priority: Priority;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  owner: string;
  assignees: string[];
  progress: number;
  metrics: Metric[];
  milestones: Milestone[];
  alerts: Alert[];
  dependencies: string[];
}

export interface Metric extends BaseEntity {
  type: string;
  value: number;
  target: number;
  unit: string;
  frequency: MonitoringFrequency;
  lastUpdated: string;
  nextUpdate: string;
  trend: 'Increasing' | 'Decreasing' | 'Stable';
  status: TrackingStatus;
  history: MetricHistory[];
  alerts: Alert[];
  trackingItemId: string;
}

export interface MetricHistory {
  id: string;
  value: number;
  timestamp: string;
  change: number;
  note?: string;
  metricId: string;
}

export interface Milestone extends BaseEntity {
  dueDate: string;
  completionDate?: string;
  status: TrackingStatus;
  owner: string;
  deliverables: string[];
  dependencies: string[];
  progress: number;
  notes: string[];
  trackingItemId: string;
}

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  createdAt: string;
  expiresAt?: string;
  status: 'Active' | 'Acknowledged' | 'Resolved' | 'Expired';
  priority: Priority;
  assignedTo: string[];
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolution?: string;
  entityType: 'tracking' | 'metric' | 'milestone';
  entityId: string;
}

// Chart and Table Types
export interface ChartData {
  id: string;
  type: 'Bar' | 'Line' | 'Pie' | 'Radar' | 'Scatter';
  title: string;
  description?: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
  }[];
  options?: any;
  sectionId: string;
}

export interface TableData {
  id: string;
  title: string;
  description?: string;
  headers: string[];
  rows: any[][];
  footer?: string[];
  sectionId: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'deleted' | 'status_changed' | 'completed' | 'reviewed' | 'submitted' | 
        'finding_added' | 'finding_resolved' | 'target_achieved' | 'milestone_completed' | 'document_added' |
        'comment_added' | 'assessment_completed' | 'report_submitted' | 'published' | 'distributed' |
        'evidence_added' | 'verification_completed' | 'alert_triggered';
  entityType: 'requirement' | 'obligation' | 'control' | 'assessment' | 'finding' | 'policy' | 'filing' |
             'metric' | 'initiative' | 'audit' | 'report' | 'template' | 'schedule' | 'distribution' |
             'tracking' | 'milestone' | 'alert' | 'monitor' | 'evidence' | 'verification' | 'review';
  entityId: string;
  description: string;
  user: string;
  time: string;
  companyId: string;
}
