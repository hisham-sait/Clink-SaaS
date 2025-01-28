import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  Filing, 
  FilingDocument,
  FilingHistory,
  FilingStatus
} from '../compliance.types';

type StatusClasses = {
  [key in FilingStatus]: string;
};

type CategoryClasses = {
  [key in 'Regulatory' | 'Legal' | 'Internal' | 'External']: string;
};

@Component({
  selector: 'app-compliance-filing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Document Filing</h2>
          <p class="text-muted">Manage compliance documents, templates, and filing activities</p>
        </div>
        <div class="col-auto">
          <div class="btn-group">
            <button class="btn btn-primary d-inline-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i>
              <span>New Document</span>
            </button>
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i>
              <span>Add Template</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Documents</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-file-text fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalDocuments}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">In Review</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-eye fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.pendingReview}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Approved</h6>
                <div class="rounded-3 bg-success bg-opacity-10 p-2">
                  <i class="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.approvedDocuments}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Deadlines</h6>
                <div class="rounded-3 bg-danger bg-opacity-10 p-2">
                  <i class="bi bi-calendar-event fs-4 text-danger"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.upcomingDeadlines}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Templates</h6>
                <div class="rounded-3 bg-info bg-opacity-10 p-2">
                  <i class="bi bi-file-earmark-text fs-4 text-info"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalTemplates}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Activities</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-activity fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.recentActivities}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Documents</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Document Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Authority</th>
                <th class="text-uppercase small fw-semibold text-secondary">Due Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let doc of filings">
                <td>
                  <div class="fw-medium">{{doc.title}}</div>
                  <small class="text-muted">{{doc.description}}</small>
                  <div class="mt-1 d-flex align-items-center gap-3">
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-person-circle"></i>{{doc.assignedTo}}
                    </small>
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-building"></i>{{doc.authority}}
                    </small>
                  </div>
                </td>
                <td>{{doc.type}}</td>
                <td>{{doc.authority}}</td>
                <td>
                  <div [class]="isOverdue(doc.dueDate) ? 'text-danger' : isDueSoon(doc.dueDate) ? 'text-warning' : ''">
                    {{doc.dueDate | date:'mediumDate'}}
                    <div class="small">
                      {{calculateDaysRemaining(doc.dueDate)}} days remaining
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(doc.status)">{{doc.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Document">
                      <i class="bi bi-file-text"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Download">
                      <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Recent Activities</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Activity Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">User</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let activity of filingHistory">
                <td>
                  <div class="fw-medium">{{getDocumentTitle(activity.filingId)}}</div>
                  <small class="text-muted">{{activity.description}}</small>
                </td>
                <td>{{activity.action}}</td>
                <td>{{activity.timestamp | date:'mediumDate'}}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    {{activity.user}}
                  </div>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FilingComponent {
  // Component code remains unchanged
  filings: Filing[] = [
    {
      id: '1',
      title: 'Annual Compliance Report 2024',
      description: 'Annual compliance report detailing regulatory adherence',
      companyId: '1',
      authority: 'Financial Services Authority',
      referenceNumber: 'FSA-2024-001',
      type: 'Annual Report',
      status: 'Draft',
      frequency: 'Annual',
      priority: 'High',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      period: {
        start: new Date(2024, 0, 1).toISOString(),
        end: new Date(2024, 11, 31).toISOString()
      },
      assignedTo: 'Sarah Johnson',
      documents: [],
      comments: [],
      history: [],
      reminders: []
    },
    {
      id: '2',
      title: 'Data Protection Policy Filing',
      description: 'Company-wide data protection policy documentation',
      companyId: '1',
      authority: 'Internal Compliance',
      referenceNumber: 'DPP-2024-001',
      type: 'Policy',
      status: 'Pending Review',
      frequency: 'Annual',
      priority: 'Medium',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 180)).toISOString(),
      submissionDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      period: {
        start: new Date(2024, 0, 1).toISOString(),
        end: new Date(2024, 11, 31).toISOString()
      },
      assignedTo: 'Michael Brown',
      documents: [],
      comments: [],
      history: [],
      reminders: []
    }
  ];

  filingHistory: FilingHistory[] = [
    {
      id: '1',
      action: 'created',
      description: 'Initial draft created from template',
      timestamp: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      user: 'Sarah Johnson',
      changes: [
        { field: 'status', oldValue: '', newValue: 'Draft' },
        { field: 'content', oldValue: '', newValue: 'Initial content' }
      ],
      filingId: '1'
    },
    {
      id: '2',
      action: 'submitted',
      description: 'Submitted for review',
      timestamp: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      user: 'Michael Brown',
      changes: [
        { field: 'status', oldValue: 'Draft', newValue: 'Pending Review' }
      ],
      filingId: '2'
    }
  ];

  statistics = {
    totalDocuments: this.filings.length,
    pendingReview: this.filings.filter(d => d.status === 'Pending Review').length,
    approvedDocuments: this.filings.filter(d => d.status === 'Accepted').length,
    upcomingDeadlines: this.filings.filter(d => {
      const daysUntilDue = this.calculateDaysRemaining(d.dueDate);
      return daysUntilDue >= 0 && daysUntilDue <= 30;
    }).length,
    totalTemplates: 0,
    recentActivities: this.filingHistory.filter(a => {
      const daysSinceActivity = Math.abs(this.calculateDaysRemaining(a.timestamp));
      return daysSinceActivity <= 7;
    }).length
  };

  private statusClasses: StatusClasses = {
    'Draft': 'bg-secondary',
    'Pending Review': 'bg-warning',
    'Submitted': 'bg-info',
    'Accepted': 'bg-success',
    'Rejected': 'bg-danger',
    'Amended': 'bg-primary'
  };

  private categoryClasses: CategoryClasses = {
    'Regulatory': 'text-primary',
    'Legal': 'text-danger',
    'Internal': 'text-success',
    'External': 'text-warning'
  };

  getDocumentTitle(filingId: string): string {
    const filing = this.filings.find(d => d.id === filingId);
    return filing ? filing.title : 'Unknown Document';
  }

  getStatusClass(status: FilingStatus): string {
    return this.statusClasses[status] || 'bg-secondary';
  }

  getCategoryClass(category: keyof CategoryClasses): string {
    return this.categoryClasses[category];
  }

  calculateDaysRemaining(date: string): number {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(date: string): boolean {
    return this.calculateDaysRemaining(date) < 0;
  }

  isDueSoon(date: string): boolean {
    const daysRemaining = this.calculateDaysRemaining(date);
    return daysRemaining >= 0 && daysRemaining <= 30;
  }

  getActivitiesByDocument(filingId: string): FilingHistory[] {
    return this.filingHistory.filter(a => a.filingId === filingId);
  }
}
