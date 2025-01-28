import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  Committee,
  CommitteeMember,
  CommitteeMeeting,
  Policy,
  Status,
  Frequency
} from '../compliance.types';

type StatusClasses = {
  [key in Status]: string;
};

@Component({
  selector: 'app-compliance-governance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Corporate Governance</h2>
          <p class="text-muted">Manage and monitor corporate governance structure and policies</p>
        </div>
        <div class="col-auto">
          <div class="btn-group">
            <button class="btn btn-primary d-inline-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i>
              <span>Add Board Member</span>
            </button>
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <i class="bi bi-plus-lg"></i>
              <span>New Committee</span>
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
                <h6 class="card-title mb-0">Board Size</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-people fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalBoardMembers}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Active Members</h6>
                <div class="rounded-3 bg-success bg-opacity-10 p-2">
                  <i class="bi bi-shield-check fs-4 text-success"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.activeMembers}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Committees</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-diagram-3 fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalCommittees}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Meetings</h6>
                <div class="rounded-3 bg-danger bg-opacity-10 p-2">
                  <i class="bi bi-calendar2-week fs-4 text-danger"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalMeetings}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Active Policies</h6>
                <div class="rounded-3 bg-secondary bg-opacity-10 p-2">
                  <i class="bi bi-file-text fs-4 text-secondary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.activePolicies}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Board Members -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Board Members</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Name & Role</th>
                <th class="text-uppercase small fw-semibold text-secondary">Expertise</th>
                <th class="text-uppercase small fw-semibold text-secondary">Appointment</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let member of committeeMembers">
                <td>
                  <div class="fw-medium">{{member.name}}</div>
                  <small class="text-muted">{{member.role}}</small>
                </td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span class="badge bg-light text-dark border" *ngFor="let skill of member.expertise">
                      {{skill}}
                    </span>
                  </div>
                </td>
                <td>
                  <div>Since: {{member.appointmentDate | date:'mediumDate'}}</div>
                  <small class="text-muted" *ngIf="member.endDate">
                    Until: {{member.endDate | date:'mediumDate'}}
                  </small>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(member.status)">{{member.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Profile">
                      <i class="bi bi-person"></i>
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

      <!-- Committees -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Committees</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Committee Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Members</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let committee of committees">
                <td>
                  <div class="fw-medium">{{committee.title}}</div>
                  <small class="text-muted">{{committee.description}}</small>
                </td>
                <td>{{committee.type}}</td>
                <td>
                  <div class="d-flex flex-wrap gap-1">
                    <span class="badge bg-light text-dark border" *ngFor="let member of committee.members">
                      {{member.name}}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(committee.status)">{{committee.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Schedule Meeting">
                      <i class="bi bi-calendar-plus"></i>
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

      <!-- Governance Policies -->
      <div class="card shadow-sm">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Governance Policies</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Policy Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Owner</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Review Timeline</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let policy of policies">
                <td>
                  <div class="fw-medium">{{policy.title}}</div>
                  <small class="text-muted">{{policy.description}}</small>
                </td>
                <td>{{policy.category}}</td>
                <td>{{policy.owner}}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(policy.status)">{{policy.status}}</span>
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
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Policy">
                      <i class="bi bi-file-text"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Review">
                      <i class="bi bi-check-lg"></i>
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
export class GovernanceComponent {
  committeeMembers: CommitteeMember[] = [
    {
      id: '1',
      name: 'John Smith',
      role: 'Chairman',
      appointmentDate: new Date(2019, 0, 1).toISOString(),
      status: 'Active',
      expertise: ['Finance', 'Strategy'],
      committeeId: '1'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      role: 'Non-Executive Director',
      appointmentDate: new Date(2021, 0, 1).toISOString(),
      status: 'Active',
      expertise: ['Risk Management', 'Compliance'],
      committeeId: '2'
    },
    {
      id: '3',
      name: 'Michael Brown',
      role: 'Executive Director',
      appointmentDate: new Date(2020, 0, 1).toISOString(),
      status: 'Active',
      expertise: ['Operations', 'Technology'],
      committeeId: '3'
    }
  ];

  committees: Committee[] = [
    {
      id: '1',
      title: 'Audit Committee',
      description: 'Oversees financial reporting and internal controls',
      companyId: '1',
      type: 'Audit',
      status: 'Active',
      charter: 'Audit committee charter document',
      members: this.committeeMembers.filter(m => m.id === '1' || m.id === '2'),
      meetings: [],
      responsibilities: [
        'Financial reporting oversight',
        'Internal controls review',
        'External auditor relationship'
      ]
    },
    {
      id: '2',
      title: 'Risk Committee',
      description: 'Monitors and reviews risk management systems',
      companyId: '1',
      type: 'Risk',
      status: 'Active',
      charter: 'Risk committee charter document',
      members: this.committeeMembers.filter(m => m.id === '2' || m.id === '3'),
      meetings: [],
      responsibilities: [
        'Risk assessment',
        'Risk monitoring',
        'Compliance oversight'
      ]
    }
  ];

  policies: Policy[] = [
    {
      id: '1',
      title: 'Board Composition Policy',
      description: 'Guidelines for board structure and composition',
      companyId: '1',
      policyNumber: 'POL-001',
      version: '1.0',
      category: 'General',
      status: 'Active',
      purpose: 'Define board composition requirements',
      scope: 'All board members',
      content: 'Board composition policy content',
      owner: 'John Smith',
      approver: 'Board',
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      lastReviewDate: new Date(2023, 11, 1).toISOString(),
      nextReviewDate: new Date(2024, 5, 1).toISOString(),
      reviewFrequency: 'Semi-Annual',
      relatedPolicies: [],
      references: [],
      acknowledgments: [],
      reviews: [],
      revisions: []
    },
    {
      id: '2',
      title: 'Risk Management Policy',
      description: 'Corporate risk management guidelines',
      companyId: '1',
      policyNumber: 'POL-002',
      version: '1.0',
      category: 'Operations',
      status: 'Under Review',
      purpose: 'Define risk management framework',
      scope: 'All operations',
      content: 'Risk management policy content',
      owner: 'Sarah Johnson',
      approver: 'Risk Committee',
      effectiveDate: new Date(2023, 0, 1).toISOString(),
      lastReviewDate: new Date(2023, 11, 1).toISOString(),
      nextReviewDate: new Date(2024, 2, 1).toISOString(),
      reviewFrequency: 'Quarterly',
      relatedPolicies: [],
      references: [],
      acknowledgments: [],
      reviews: [],
      revisions: []
    }
  ];

  statistics = {
    totalBoardMembers: this.committeeMembers.length,
    activeMembers: this.committeeMembers.filter(m => m.status === 'Active').length,
    totalCommittees: this.committees.length,
    totalMeetings: this.committees.reduce((sum, c) => sum + c.meetings.length, 0),
    activePolicies: this.policies.filter(p => p.status === 'Active').length
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

  getStatusClass(status: Status): string {
    return this.statusClasses[status] || 'bg-secondary';
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
}
