import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  RegulatoryRequirement,
  RegulatoryStatus,
  UpdateFrequency,
  RiskLevel
} from '../compliance.types';

type StatusClasses = {
  [key in RegulatoryStatus]: string;
};

@Component({
  selector: 'app-compliance-requirements',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Compliance Requirements</h2>
          <p class="text-muted">Manage and track your organization's compliance requirements</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary d-inline-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Add Requirement</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Total</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-list-check fs-4 text-primary"></i>
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
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-play-circle fs-4 text-primary"></i>
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
                <div class="rounded-3 bg-secondary bg-opacity-10 p-2">
                  <i class="bi bi-clock fs-4 text-secondary"></i>
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
                <h6 class="card-title mb-0">Overdue</h6>
                <div class="rounded-3 bg-danger bg-opacity-10 p-2">
                  <i class="bi bi-exclamation-circle fs-4 text-danger"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.overdue}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">High Risk</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-flag-fill fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.highRisk}}</h3>
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
              <label class="form-label">Risk Level</label>
              <select class="form-select">
                <option value="">All Risk Levels</option>
                <option *ngFor="let risk of filterOptions.riskLevels" [value]="risk">
                  {{risk}}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Search</label>
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search requirements...">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements List -->
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Title</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Due Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Authority</th>
                <th class="text-uppercase small fw-semibold text-secondary">Risk Level</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of requirements">
                <td>
                  <div class="fw-medium">{{req.title}}</div>
                  <small class="text-muted">{{req.description}}</small>
                </td>
                <td>{{req.category}}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(req.status)">{{req.status}}</span>
                </td>
                <td>{{req.nextReviewDate | date:'mediumDate'}}</td>
                <td>{{req.authority}}</td>
                <td>
                  <div class="d-flex align-items-center gap-1" [class]="getRiskClass(req.riskLevel)">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>{{req.riskLevel}}</span>
                  </div>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" title="Delete">
                      <i class="bi bi-trash"></i>
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
export class RequirementsComponent {
  requirements: RegulatoryRequirement[] = [
    {
      id: '1',
      title: 'Annual Data Protection Audit',
      description: 'Complete annual audit of data protection measures and GDPR compliance',
      companyId: '1',
      authority: 'Data Protection Authority',
      jurisdiction: 'EU',
      category: 'Data Protection',
      status: 'Active',
      lastUpdateDate: new Date().toISOString(),
      nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      effectiveDate: new Date().toISOString(),
      updateFrequency: 'Annually',
      riskLevel: 'High',
      complianceStatus: 'Partially Compliant',
      applicability: 'All departments',
      obligations: [],
      controls: [],
      documents: [],
      assessments: []
    },
    {
      id: '2',
      title: 'ISO 27001 Certification Renewal',
      description: 'Prepare and submit documentation for ISO 27001 certification renewal',
      companyId: '1',
      authority: 'ISO',
      jurisdiction: 'International',
      category: 'Information Security',
      status: 'Under Review',
      lastUpdateDate: new Date().toISOString(),
      nextReviewDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
      effectiveDate: new Date().toISOString(),
      updateFrequency: 'Annually',
      riskLevel: 'High',
      complianceStatus: 'Compliant',
      applicability: 'IT Department',
      obligations: [],
      controls: [],
      documents: [],
      assessments: []
    }
  ];

  filterOptions = {
    categories: ['Data Protection', 'Information Security', 'Financial', 'Environmental'],
    statuses: ['Draft', 'Active', 'Under Review', 'Superseded', 'Archived'],
    riskLevels: ['Low', 'Medium', 'High', 'Critical']
  };

  statistics = {
    total: this.requirements.length,
    active: this.requirements.filter(r => r.status === 'Active').length,
    underReview: this.requirements.filter(r => r.status === 'Under Review').length,
    draft: this.requirements.filter(r => r.status === 'Draft').length,
    archived: this.requirements.filter(r => r.status === 'Archived').length,
    superseded: this.requirements.filter(r => r.status === 'Superseded').length,
    overdue: this.requirements.filter(r => {
      const reviewDate = new Date(r.nextReviewDate);
      const today = new Date();
      return reviewDate < today;
    }).length,
    highRisk: this.requirements.filter(r => r.riskLevel === 'High').length
  };

  private statusClasses: StatusClasses = {
    'Active': 'bg-success',
    'Draft': 'bg-secondary',
    'Under Review': 'bg-warning',
    'Superseded': 'bg-warning',
    'Archived': 'bg-secondary'
  };

  private riskClasses: { [key in RiskLevel]: string } = {
    'Low': 'text-info',
    'Medium': 'text-warning',
    'High': 'text-danger',
    'Critical': 'text-danger'
  };

  getStatusClass(status: RegulatoryStatus): string {
    return this.statusClasses[status];
  }

  getRiskClass(risk: RiskLevel): string {
    return this.riskClasses[risk];
  }
}
