import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { 
  Report,
  ReportMetric,
  Finding,
  Status,
  RiskLevel,
  DocumentStatus,
  Activity
} from '../compliance.types';
import { CreateReportModalComponent } from './modal/create-report-modal.component';
import { EditReportModalComponent } from './modal/edit-report-modal.component';
import { ViewReportModalComponent } from './modal/view-report-modal.component';

type StatusClasses = {
  [key in Status | DocumentStatus | 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Above Target' | 'On Target' | 'Below Target']: string;
};

type SeverityClasses = {
  [key in RiskLevel]: string;
};

@Component({
  selector: 'app-compliance-reports',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Previous template content remains unchanged until the end -->
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Compliance Reports</h2>
          <p class="text-muted">Generate and manage compliance reports, metrics, and findings</p>
        </div>
        <div class="col-auto">
          <div class="btn-group">
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openCreateReportModal()">
              <i class="bi bi-plus-lg"></i>
              <span>New Report</span>
            </button>
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2">
              <i class="bi bi-download"></i>
              <span>Export</span>
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
                <h6 class="card-title mb-0">Reports</h6>
                <div class="rounded-3 bg-primary bg-opacity-10 p-2">
                  <i class="bi bi-file-text fs-4 text-primary"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalReports}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Pending</h6>
                <div class="rounded-3 bg-warning bg-opacity-10 p-2">
                  <i class="bi bi-hourglass-split fs-4 text-warning"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.pendingReports}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Submitted</h6>
                <div class="rounded-3 bg-success bg-opacity-10 p-2">
                  <i class="bi bi-check-circle fs-4 text-success"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.submittedReports}}</h3>
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
                <h6 class="card-title mb-0">Findings</h6>
                <div class="rounded-3 bg-info bg-opacity-10 p-2">
                  <i class="bi bi-exclamation-diamond fs-4 text-info"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.totalFindings}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6 class="card-title mb-0">Open Issues</h6>
                <div class="rounded-3 bg-danger bg-opacity-10 p-2">
                  <i class="bi bi-exclamation-circle fs-4 text-danger"></i>
                </div>
              </div>
              <h3 class="mb-0 fw-semibold">{{statistics.openFindings}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Reports</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Report Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Frequency</th>
                <th class="text-uppercase small fw-semibold text-secondary">Period</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let report of reports">
                <td>
                  <div class="fw-medium">{{report.title}}</div>
                  <small class="text-muted">{{report.description}}</small>
                  <div class="mt-1 d-flex align-items-center gap-3">
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-person-circle"></i>{{report.author}}
                    </small>
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-calendar3"></i>
                      {{report.period.start | date}} - {{report.period.end | date}}
                    </small>
                  </div>
                </td>
                <td>{{report.category}}</td>
                <td>{{report.frequency}}</td>
                <td>
                  <div>
                    Start: {{report.period.start | date:'mediumDate'}}<br>
                    End: {{report.period.end | date:'mediumDate'}}
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(report.status)">{{report.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Report" (click)="openViewReportModal(report)">
                      <i class="bi bi-file-text"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Download">
                      <i class="bi bi-download"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit" (click)="openEditReportModal(report)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Metrics -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Report Metrics</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Metric Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Value</th>
                <th class="text-uppercase small fw-semibold text-secondary">Target</th>
                <th class="text-uppercase small fw-semibold text-secondary">Trend</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let metric of metrics">
                <td>
                  <div class="fw-medium">{{metric.name}}</div>
                  <small class="text-muted">{{metric.notes}}</small>
                </td>
                <td>{{metric.category}}</td>
                <td>{{metric.value}} {{metric.unit}}</td>
                <td>{{metric.target}} {{metric.unit}}</td>
                <td>
                  <i class="bi" [ngClass]="{
                    'bi-arrow-up-circle-fill text-success': metric.trend === 'Up',
                    'bi-arrow-down-circle-fill text-danger': metric.trend === 'Down',
                    'bi-dash-circle-fill text-warning': metric.trend === 'Stable'
                  }"></i>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(metric.status)">{{metric.status}}</span>
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

      <!-- Findings -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Report Findings</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Finding Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Severity</th>
                <th class="text-uppercase small fw-semibold text-secondary">Due Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let finding of findings">
                <td>
                  <div class="fw-medium">{{finding.title}}</div>
                  <small class="text-muted">{{finding.description}}</small>
                  <div class="mt-1 d-flex align-items-center gap-3">
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-person-circle"></i>{{finding.assignedTo}}
                    </small>
                    <small class="text-muted d-inline-flex align-items-center gap-1">
                      <i class="bi bi-lightbulb"></i>{{finding.remediation}}
                    </small>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-1" [class]="getSeverityClass(finding.severity)">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>{{finding.severity}}</span>
                  </div>
                </td>
                <td>
                  <div [class]="isOverdue(finding.targetResolutionDate) ? 'text-danger' : isDueSoon(finding.targetResolutionDate) ? 'text-warning' : ''">
                    {{finding.targetResolutionDate | date:'mediumDate'}}
                    <div class="small">
                      {{calculateDaysRemaining(finding.targetResolutionDate)}} days remaining
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(finding.status)">{{finding.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Update Status">
                      <i class="bi bi-arrow-up-circle"></i>
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
export class ReportsComponent {
  reports: Report[] = [
    {
      id: '1',
      title: 'Q2 2024 Regulatory Compliance Report',
      description: 'Quarterly regulatory compliance assessment report',
      companyId: '1',
      category: 'Regulatory',
      status: 'Draft',
      frequency: 'Quarterly',
      period: {
        start: new Date(2024, 3, 1).toISOString(), // Q2 start
        end: new Date(2024, 5, 30).toISOString()   // Q2 end
      },
      author: 'Sarah Johnson',
      reviewers: ['Michael Brown', 'David Wilson'],
      sections: [],
      metrics: [],
      findings: [],
      recommendations: [],
      distribution: ['Board of Directors', 'Compliance Team'],
      tags: ['Regulatory', 'Quarterly', '2024']
    },
    {
      id: '2',
      title: '2024 Annual ESG Report',
      description: 'Annual environmental, social, and governance report',
      companyId: '1',
      category: 'ESG',
      status: 'Draft',
      frequency: 'Annual',
      period: {
        start: new Date(2024, 0, 1).toISOString(),
        end: new Date(2024, 11, 31).toISOString()
      },
      author: 'Michael Brown',
      reviewers: ['Sarah Johnson', 'Emma Davis'],
      sections: [],
      metrics: [],
      findings: [],
      recommendations: [],
      distribution: ['Board of Directors', 'Stakeholders'],
      tags: ['ESG', 'Annual', '2024']
    }
  ];

  metrics: ReportMetric[] = [
    {
      id: '1',
      name: 'Regulatory Filing Compliance',
      category: 'Regulatory',
      value: 95,
      target: 100,
      unit: '%',
      trend: 'Up',
      comparisonPeriod: 'Q1 2024',
      previousValue: 90,
      variance: 5,
      status: 'Above Target',
      reportId: '1'
    },
    {
      id: '2',
      name: 'Carbon Emissions',
      category: 'Environmental',
      value: 125,
      target: 100,
      unit: 'tons CO2e',
      trend: 'Down',
      comparisonPeriod: '2023',
      previousValue: 130,
      variance: -5,
      status: 'Below Target',
      reportId: '2'
    }
  ];

  findings: Finding[] = [
    {
      id: '1',
      title: 'Documentation Gap in Compliance Procedures',
      description: 'Identified gaps in compliance documentation procedures',
      companyId: '1',
      severity: 'Medium',
      status: 'In Progress',
      identifiedDate: new Date().toISOString(),
      targetResolutionDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      assignedTo: 'Sarah Johnson',
      remediation: 'Update and standardize documentation processes',
      entityId: '1',
      entityType: 'audit'
    },
    {
      id: '2',
      title: 'ESG Data Collection Process Improvement',
      description: 'ESG data collection process needs optimization',
      companyId: '1',
      severity: 'Low',
      status: 'Open',
      identifiedDate: new Date().toISOString(),
      targetResolutionDate: new Date(new Date().setDate(new Date().getDate() + 45)).toISOString(),
      assignedTo: 'Michael Brown',
      remediation: 'Implement automated data collection system',
      entityId: '2',
      entityType: 'audit'
    }
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      type: 'created',
      entityType: 'report',
      entityId: '1',
      description: 'created Q2 2024 Regulatory Compliance Report',
      user: 'Sarah Johnson',
      time: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      companyId: '1'
    },
    {
      id: '2',
      type: 'updated',
      entityType: 'report',
      entityId: '2',
      description: 'updated ESG Report metrics',
      user: 'Michael Brown',
      time: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
      companyId: '1'
    },
    {
      id: '3',
      type: 'published',
      entityType: 'report',
      entityId: '3',
      description: 'published Q1 2024 Compliance Report',
      user: 'David Wilson',
      time: new Date(new Date().setHours(new Date().getHours() - 24)).toISOString(),
      companyId: '1'
    }
  ];

  statistics = {
    totalReports: this.reports.length,
    pendingReports: this.reports.filter(r => ['Draft', 'Under Review'].includes(r.status)).length,
    submittedReports: this.reports.filter(r => r.status === 'Published').length,
    upcomingDeadlines: 0,
    totalFindings: this.findings.length,
    openFindings: this.findings.filter(f => f.status === 'Open').length
  };

  private statusClasses: StatusClasses = {
    // Document statuses
    'Active': 'bg-success',
    'Inactive': 'bg-secondary',
    'Draft': 'bg-secondary',
    'Under Review': 'bg-warning',
    'Pending': 'bg-info',
    'In Progress': 'bg-warning',
    'Completed': 'bg-success',
    'Archived': 'bg-secondary',
    'Superseded': 'bg-warning',
    'Repealed': 'bg-danger',
    'Final': 'bg-success',
    'Signed': 'bg-success',
    'Submitted': 'bg-info',
    'Published': 'bg-success',
    // Finding statuses
    'Open': 'bg-danger',
    'Resolved': 'bg-success',
    'Closed': 'bg-secondary',
    // Metric statuses
    'Above Target': 'bg-success',
    'On Target': 'bg-info',
    'Below Target': 'bg-danger'
  };

  private severityClasses: SeverityClasses = {
    'Low': 'text-info',
    'Medium': 'text-warning',
    'High': 'text-danger',
    'Critical': 'text-danger'
  };

  constructor(private modalService: NgbModal) {}

  getStatusClass(status: Status | DocumentStatus | 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Above Target' | 'On Target' | 'Below Target'): string {
    return this.statusClasses[status] || 'bg-secondary';
  }

  getSeverityClass(severity: RiskLevel): string {
    return this.severityClasses[severity];
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

  getMetricsByReport(reportId: string): ReportMetric[] {
    return this.metrics.filter(m => m.reportId === reportId);
  }

  getFindingsByReport(reportId: string): Finding[] {
    return this.findings.filter(f => f.entityId === reportId && f.entityType === 'audit');
  }

  getActivityIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'created': 'rounded-circle bg-primary bg-opacity-10 p-2',
      'updated': 'rounded-circle bg-info bg-opacity-10 p-2',
      'published': 'rounded-circle bg-success bg-opacity-10 p-2',
      'distributed': 'rounded-circle bg-warning bg-opacity-10 p-2',
      'reviewed': 'rounded-circle bg-secondary bg-opacity-10 p-2'
    };
    return classes[type] || 'rounded-circle bg-secondary bg-opacity-10 p-2';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'created': 'bi bi-plus-lg text-primary',
      'updated': 'bi bi-pencil text-info',
      'published': 'bi bi-check-lg text-success',
      'distributed': 'bi bi-share text-warning',
      'reviewed': 'bi bi-eye text-secondary'
    };
    return icons[type] || 'bi bi-activity text-secondary';
  }

  openCreateReportModal() {
    const modalRef = this.modalService.open(CreateReportModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.result.then((result) => {
      if (result) {
        // Handle new report creation
        console.log('New report:', result);
      }
    });
  }

  openEditReportModal(report: Report) {
    const modalRef = this.modalService.open(EditReportModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.componentInstance.report = report;
    modalRef.result.then((result) => {
      if (result) {
        // Handle report update
        console.log('Updated report:', result);
      }
    });
  }

  openViewReportModal(report: Report) {
    const modalRef = this.modalService.open(ViewReportModalComponent, { size: 'lg' });
    modalRef.componentInstance.report = report;
  }
}
