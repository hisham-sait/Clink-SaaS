import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Audit, Finding } from '../compliance.types';

type StatusClasses = {
  [key in 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed']: string;
};

type TypeIcons = {
  [key in 'Internal' | 'External' | 'Regulatory' | 'Compliance']: string;
};

@Component({
  selector: 'app-compliance-audits',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Compliance Audits</h2>
          <p class="text-muted">Manage and track your organization's compliance audits</p>
        </div>
        <div class="col-auto">
          <button class="btn btn-primary d-inline-flex align-items-center gap-2">
            <i class="bi bi-plus-lg"></i>
            <span>Schedule New Audit</span>
          </button>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-muted mb-0">Total Audits</h6>
                <i class="bi bi-clipboard-check fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{statistics.total}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Completed</h6>
                <i class="bi bi-check-circle fs-4 text-success"></i>
              </div>
              <h3 class="mb-0 text-success">{{statistics.completed}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">In Progress</h6>
                <i class="bi bi-play-circle fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0 text-primary">{{statistics.inProgress}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Scheduled</h6>
                <i class="bi bi-calendar-event fs-4 text-info"></i>
              </div>
              <h3 class="mb-0 text-info">{{statistics.scheduled}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Critical Findings</h6>
                <i class="bi bi-exclamation-triangle fs-4 text-danger"></i>
              </div>
              <h3 class="mb-0 text-danger">{{statistics.criticalFindings}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Total Findings</h6>
                <i class="bi bi-journal-text fs-4 text-warning"></i>
              </div>
              <h3 class="mb-0 text-warning">{{statistics.totalFindings}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">Audit Type</label>
              <select class="form-select">
                <option value="">All Types</option>
                <option *ngFor="let type of filterOptions.types" [value]="type">
                  {{type}}
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
              <label class="form-label">Department</label>
              <select class="form-select">
                <option value="">All Departments</option>
                <option *ngFor="let dept of filterOptions.departments" [value]="dept">
                  {{dept}}
                </option>
              </select>
            </div>
            <div class="col-md-3">
              <label class="form-label">Search</label>
              <div class="input-group">
                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search audits...">
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Audits List -->
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Audit Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Timeline</th>
                <th class="text-uppercase small fw-semibold text-secondary">Auditor</th>
                <th class="text-uppercase small fw-semibold text-secondary">Department</th>
                <th class="text-uppercase small fw-semibold text-secondary">Findings</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let audit of audits">
                <td>
                  <div class="fw-medium">{{audit.title}}</div>
                  <small class="text-muted">{{audit.description}}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i [class]="'bi ' + getTypeIcon(audit.type)"></i>
                    <span>{{audit.type}}</span>
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusClass(audit.status)">{{audit.status}}</span>
                </td>
                <td>
                  <div class="small">
                    <div>Start: {{audit.startDate | date:'mediumDate'}}</div>
                    <div>End: {{audit.endDate | date:'mediumDate'}}</div>
                    <div [class]="calculateDaysRemaining(audit.endDate) > 0 ? 'text-muted' : 'text-danger'">
                      {{calculateDaysRemaining(audit.endDate) > 0 ? calculateDaysRemaining(audit.endDate) + ' days remaining' : 'Completed'}}
                    </div>
                  </div>
                </td>
                <td>{{audit.auditor}}</td>
                <td>{{audit.department}}</td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="text-danger fw-medium">{{getCriticalFindings(audit)}} Critical</span>
                    <small class="text-muted">{{getTotalFindings(audit)}} Total</small>
                  </div>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Add Finding">
                      <i class="bi bi-plus-lg"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit">
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
export class AuditsComponent {
  audits: Audit[] = [
    {
      id: '1',
      title: 'Annual Regulatory Compliance Audit',
      type: 'Regulatory',
      status: 'In Progress',
      startDate: new Date(2024, 0, 1).toISOString(),
      endDate: new Date(2024, 0, 15).toISOString(),
      auditor: 'Sarah Johnson',
      department: 'Compliance',
      description: 'Annual regulatory compliance assessment',
      scope: 'All regulatory requirements',
      methodology: 'Document review and interviews',
      findings: [],
      recommendations: [],
      documents: [],
      companyId: '1'
    },
    {
      id: '2',
      title: 'Q1 Internal Controls Review',
      type: 'Internal',
      status: 'Scheduled',
      startDate: new Date(2024, 2, 1).toISOString(),
      endDate: new Date(2024, 2, 15).toISOString(),
      auditor: 'Michael Brown',
      department: 'Internal Audit',
      description: 'Quarterly internal controls assessment',
      scope: 'Financial and operational controls',
      methodology: 'Control testing and process review',
      findings: [],
      recommendations: [],
      documents: [],
      companyId: '1'
    },
    {
      id: '3',
      title: 'Data Protection Compliance Audit',
      type: 'Compliance',
      status: 'Completed',
      startDate: new Date(2023, 11, 1).toISOString(),
      endDate: new Date(2023, 11, 15).toISOString(),
      auditor: 'David Wilson',
      department: 'IT Security',
      description: 'Data protection and privacy compliance review',
      scope: 'Data handling procedures and controls',
      methodology: 'System review and staff interviews',
      findings: [],
      recommendations: [],
      documents: [],
      companyId: '1'
    },
    {
      id: '4',
      title: 'External Financial Audit',
      type: 'External',
      status: 'Reviewed',
      startDate: new Date(2023, 10, 1).toISOString(),
      endDate: new Date(2023, 10, 30).toISOString(),
      auditor: 'Emma Davis',
      department: 'Finance',
      description: 'Annual financial statements audit',
      scope: 'Financial statements and controls',
      methodology: 'Financial review and verification',
      findings: [],
      recommendations: [],
      documents: [],
      companyId: '1'
    }
  ];

  filterOptions = {
    types: ['Internal', 'External', 'Regulatory', 'Compliance'],
    statuses: ['Scheduled', 'In Progress', 'Completed', 'Reviewed'],
    departments: ['IT Security', 'Finance', 'Legal', 'Operations', 'HR']
  };

  statistics = {
    total: this.audits.length,
    completed: this.audits.filter(a => a.status === 'Completed' || a.status === 'Reviewed').length,
    inProgress: this.audits.filter(a => a.status === 'In Progress').length,
    scheduled: this.audits.filter(a => a.status === 'Scheduled').length,
    criticalFindings: this.audits.reduce((sum, audit) => sum + this.getCriticalFindings(audit), 0),
    totalFindings: this.audits.reduce((sum, audit) => sum + this.getTotalFindings(audit), 0)
  };

  private statusClasses: StatusClasses = {
    'Scheduled': 'bg-info',
    'In Progress': 'bg-primary',
    'Completed': 'bg-success',
    'Reviewed': 'bg-warning'
  };

  private typeIcons: TypeIcons = {
    'Internal': 'bi-shield-check',
    'External': 'bi-building',
    'Regulatory': 'bi-journal-check',
    'Compliance': 'bi-clipboard-check'
  };

  getStatusClass(status: 'Scheduled' | 'In Progress' | 'Completed' | 'Reviewed'): string {
    return this.statusClasses[status];
  }

  getTypeIcon(type: 'Internal' | 'External' | 'Regulatory' | 'Compliance'): string {
    return this.typeIcons[type];
  }

  calculateDaysRemaining(endDate: string): number {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getCriticalFindings(audit: Audit): number {
    return audit.findings.filter(f => f.severity === 'Critical').length;
  }

  getTotalFindings(audit: Audit): number {
    return audit.findings.length;
  }
}
