import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { 
  Policy,
  Status,
  PolicyAcknowledgment,
  PolicyReview,
  PolicyRevision,
  Activity
} from '../compliance.types';
import { CreatePolicyModalComponent } from './modal/create-policy-modal.component';
import { EditPolicyModalComponent } from './modal/edit-policy-modal.component';
import { ViewPolicyModalComponent } from './modal/view-policy-modal.component';

type StatusClasses = {
  [key in Status]: string;
};

type CategoryIcons = {
  [key in 'HR' | 'IT' | 'Finance' | 'Operations' | 'Compliance' | 'Security' | 'General']: string;
};

@Component({
  selector: 'app-compliance-policies',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Previous template content remains unchanged until the end -->
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Compliance Policies</h2>
          <p class="text-muted">Manage and track your organization's compliance policies</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openCreatePolicyModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Create New Policy</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Total Policies</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-files fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.total}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Active</h6>
                <div class="rounded-3 bg-success bg-opacity-10 p-2">
                  <i class="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.active}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Under Review</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-eye fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.underReview}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Draft</h6>
                <div class="rounded-3 bg-info bg-opacity-10 p-2">
                  <i class="bi bi-file-earmark fs-4 text-info"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.draft}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Archived</h6>
                <div class="rounded-3 bg-secondary bg-opacity-10 p-2">
                  <i class="bi bi-archive fs-4 text-secondary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.archived}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Requires Review</h6>
                <div class="rounded-3 bg-danger bg-opacity-10 p-2">
                  <i class="bi bi-exclamation-circle fs-4 text-danger"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.requiresReview}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Category</label>
              <select class="form-select">
                <option value="">All Categories</option>
                <option *ngFor="let category of filterOptions.categories" [value]="category">
                  {{category}}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Status</label>
              <select class="form-select">
                <option value="">All Statuses</option>
                <option *ngFor="let status of filterOptions.statuses" [value]="status">
                  {{status}}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Review Period</label>
              <select class="form-select">
                <option value="">All Periods</option>
                <option value="30">Next 30 Days</option>
                <option value="60">Next 60 Days</option>
                <option value="90">Next 90 Days</option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Search</label>
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search policies...">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Policies List -->
      <div class="card shadow-sm mb-4">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Policy Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Version</th>
                <th class="text-uppercase small fw-semibold text-secondary">Review Timeline</th>
                <th class="text-uppercase small fw-semibold text-secondary">Owner</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let policy of policies">
                <td>
                  <div class="fw-medium">{{policy.title}}</div>
                  <small class="text-muted">{{policy.description}}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i [class]="'bi ' + getCategoryIcon(policy.category)"></i>
                    <span>{{policy.category}}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(policy.status)">{{policy.status}}</span>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="fw-medium">v{{policy.version}}</span>
                    <small class="text-muted d-flex align-items-center gap-1">
                      <i class="bi bi-clock"></i>
                      {{policy.lastReviewDate | date:'mediumDate'}}
                    </small>
                  </div>
                </td>
                <td>
                  <div [class]="isReviewDueSoon(policy.nextReviewDate) ? 'text-danger' : ''">
                    <div>Next Review: {{policy.nextReviewDate | date:'mediumDate'}}</div>
                    <small [class]="isReviewDueSoon(policy.nextReviewDate) ? 'text-danger' : 'text-muted'">
                      {{calculateDaysUntilReview(policy.nextReviewDate)}} days remaining
                    </small>
                  </div>
                </td>
                <td>
                  <div class="d-flex flex-column">
                    <span>{{policy.owner}}</span>
                    <small class="text-muted">Approved by: {{policy.approver}}</small>
                  </div>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Policy" (click)="openViewPolicyModal(policy)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Download">
                      <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit" (click)="openEditPolicyModal(policy)">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Archive">
                      <i class="bi bi-archive"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Recent Activity</h5>
        </div>
        <div class="list-group list-group-flush">
          <div class="list-group-item" *ngFor="let activity of recentActivities">
            <div class="d-flex align-items-center gap-3">
              <div [class]="getActivityIconClass(activity.type)">
                <i [class]="getActivityIcon(activity.type)"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="fw-medium">{{activity.user}}</span>
                    <span class="text-muted ms-1">{{activity.description}}</span>
                  </div>
                  <small class="text-muted">{{activity.time | date:'shortTime'}}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class PoliciesComponent {
  policies: Policy[] = [
    {
      id: '1',
      title: 'Data Protection Policy',
      description: 'Guidelines for handling and protecting sensitive data',
      companyId: '1',
      policyNumber: 'POL-001',
      version: '2.1',
      category: 'Security',
      status: 'Active',
      purpose: 'Ensure proper data protection practices',
      scope: 'All employees',
      content: 'Data protection policy content',
      owner: 'Sarah Johnson',
      approver: 'John Smith',
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      lastReviewDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      nextReviewDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
      reviewFrequency: 'Semi-Annual',
      relatedPolicies: [],
      references: [],
      acknowledgments: [],
      reviews: [],
      revisions: []
    },
    {
      id: '2',
      title: 'Information Security Policy',
      description: 'Security protocols and procedures for IT infrastructure',
      companyId: '1',
      policyNumber: 'POL-002',
      version: '3.0',
      category: 'IT',
      status: 'Under Review',
      purpose: 'Define security protocols',
      scope: 'All IT systems',
      content: 'Information security policy content',
      owner: 'Michael Brown',
      approver: 'David Wilson',
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      lastReviewDate: new Date(new Date().setDate(new Date().getDate() - 15)).toISOString(),
      nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      reviewFrequency: 'Quarterly',
      relatedPolicies: [],
      references: [],
      acknowledgments: [],
      reviews: [],
      revisions: []
    },
    {
      id: '3',
      title: 'Financial Controls Policy',
      description: 'Internal financial control procedures',
      companyId: '1',
      policyNumber: 'POL-003',
      version: '2.3',
      category: 'Finance',
      status: 'Active',
      purpose: 'Define financial controls',
      scope: 'Finance department',
      content: 'Financial controls policy content',
      owner: 'Robert Taylor',
      approver: 'Patricia Moore',
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      lastReviewDate: new Date(new Date().setDate(new Date().getDate() - 45)).toISOString(),
      nextReviewDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
      reviewFrequency: 'Quarterly',
      relatedPolicies: [],
      references: [],
      acknowledgments: [],
      reviews: [],
      revisions: []
    }
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      type: 'created',
      entityType: 'policy',
      entityId: '1',
      description: 'created Data Protection Policy',
      user: 'Sarah Johnson',
      time: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      companyId: '1'
    },
    {
      id: '2',
      type: 'updated',
      entityType: 'policy',
      entityId: '2',
      description: 'updated Information Security Policy',
      user: 'Michael Brown',
      time: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
      companyId: '1'
    },
    {
      id: '3',
      type: 'reviewed',
      entityType: 'policy',
      entityId: '3',
      description: 'completed review of Financial Controls Policy',
      user: 'Robert Taylor',
      time: new Date(new Date().setHours(new Date().getHours() - 24)).toISOString(),
      companyId: '1'
    }
  ];

  filterOptions = {
    categories: ['HR', 'IT', 'Finance', 'Operations', 'Compliance', 'Security', 'General'],
    statuses: ['Active', 'Under Review', 'Draft', 'Archived']
  };

  statistics = {
    total: this.policies.length,
    active: this.policies.filter(p => p.status === 'Active').length,
    underReview: this.policies.filter(p => p.status === 'Under Review').length,
    draft: this.policies.filter(p => p.status === 'Draft').length,
    archived: this.policies.filter(p => p.status === 'Archived').length,
    requiresReview: this.policies.filter(p => {
      const reviewDate = new Date(p.nextReviewDate);
      const today = new Date();
      return reviewDate <= new Date(today.setMonth(today.getMonth() + 1));
    }).length
  };

  private statusClasses: StatusClasses = {
    'Active': 'bg-success',
    'Inactive': 'bg-secondary',
    'Draft': 'bg-info',
    'Under Review': 'bg-warning',
    'Pending': 'bg-info',
    'In Progress': 'bg-primary',
    'Completed': 'bg-success',
    'Archived': 'bg-secondary',
    'Superseded': 'bg-warning',
    'Repealed': 'bg-danger'
  };

  private categoryIcons: CategoryIcons = {
    'HR': 'bi-people',
    'IT': 'bi-pc-display',
    'Finance': 'bi-cash-stack',
    'Operations': 'bi-gear',
    'Compliance': 'bi-shield-check',
    'Security': 'bi-shield-lock',
    'General': 'bi-file-text'
  };

  constructor(private modalService: NgbModal) {}

  getStatusClass(status: Status): string {
    return this.statusClasses[status] || 'bg-secondary';
  }

  getCategoryIcon(category: keyof CategoryIcons): string {
    return this.categoryIcons[category];
  }

  calculateDaysUntilReview(reviewDate: string): number {
    const today = new Date();
    const review = new Date(reviewDate);
    const diffTime = review.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isReviewDueSoon(reviewDate: string): boolean {
    return this.calculateDaysUntilReview(reviewDate) <= 30;
  }

  getActivityIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'created': 'rounded-circle bg-primary bg-opacity-10 p-2',
      'updated': 'rounded-circle bg-info bg-opacity-10 p-2',
      'reviewed': 'rounded-circle bg-success bg-opacity-10 p-2',
      'archived': 'rounded-circle bg-secondary bg-opacity-10 p-2',
      'published': 'rounded-circle bg-warning bg-opacity-10 p-2'
    };
    return classes[type] || 'rounded-circle bg-secondary bg-opacity-10 p-2';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'created': 'bi bi-plus-lg text-primary',
      'updated': 'bi bi-pencil text-info',
      'reviewed': 'bi bi-check-lg text-success',
      'archived': 'bi bi-archive text-secondary',
      'published': 'bi bi-send text-warning'
    };
    return icons[type] || 'bi bi-activity text-secondary';
  }

  openCreatePolicyModal() {
    const modalRef = this.modalService.open(CreatePolicyModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.result.then((result) => {
      if (result) {
        // Handle new policy creation
        console.log('New policy:', result);
      }
    });
  }

  openEditPolicyModal(policy: Policy) {
    const modalRef = this.modalService.open(EditPolicyModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.componentInstance.policy = policy;
    modalRef.result.then((result) => {
      if (result) {
        // Handle policy update
        console.log('Updated policy:', result);
      }
    });
  }

  openViewPolicyModal(policy: Policy) {
    const modalRef = this.modalService.open(ViewPolicyModalComponent, { size: 'lg' });
    modalRef.componentInstance.policy = policy;
  }
}
