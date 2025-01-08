import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-external-auditor-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Audit Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">Audit Overview</h5>
                  <p class="text-muted mb-0">{{ companyName }} - FY {{ currentYear }}</p>
                </div>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-download me-2"></i>Export Report
                  </button>
                  <button class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg me-2"></i>New Finding
                  </button>
                </div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-clipboard-check fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Audit Progress</h6>
                      <h4 class="mb-0">{{ auditProgress }}%</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-exclamation-triangle fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Open Findings</h6>
                      <h4 class="mb-0">{{ openFindings }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-check-circle fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Resolved</h6>
                      <h4 class="mb-0">{{ resolvedFindings }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-calendar-check fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Next Review</h6>
                      <h4 class="mb-0">{{ nextReviewDate }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Findings -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Recent Findings</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let finding of recentFindings">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + finding.severity.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + finding.severity.icon + ' text-' + finding.severity.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ finding.title }}</h6>
                        <small class="text-muted">{{ finding.category }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + finding.severity.type">{{ finding.severity.label }}</span>
                  </div>
                  <p class="text-muted small mb-2">{{ finding.description }}</p>
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Found: {{ finding.date }}</small>
                    <button class="btn btn-sm" [class]="'btn-outline-' + finding.severity.type">
                      Review
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compliance Status -->
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Compliance Status</h5>
                <button class="btn btn-sm btn-outline-primary">Details</button>
              </div>
              <div class="mb-4" *ngFor="let status of complianceStatus">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ status.category }}</span>
                  <span [class]="'text-' + status.type">{{ status.score }}%</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [class]="'bg-' + status.type"
                       [style.width.%]="status.score"></div>
                </div>
                <small class="text-muted">{{ status.note }}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Audit Timeline -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Audit Timeline</h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Activity</th>
                      <th>Area</th>
                      <th>Auditor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let activity of auditActivities">
                      <td>{{ activity.date }}</td>
                      <td>{{ activity.description }}</td>
                      <td>{{ activity.area }}</td>
                      <td>{{ activity.auditor }}</td>
                      <td>
                        <span [class]="'badge bg-' + activity.status.type">
                          {{ activity.status.label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class ExternalAuditorDashboardComponent {
  // Mock data
  companyName = 'Tech Solutions Ltd';
  currentYear = '2024';
  auditProgress = 65;
  openFindings = 8;
  resolvedFindings = 12;
  nextReviewDate = 'Apr 25';

  recentFindings = [
    {
      title: 'Internal Control Weakness',
      category: 'Financial Controls',
      description: 'Inadequate segregation of duties in payment processing workflow',
      date: 'Today',
      severity: { label: 'High', type: 'danger', icon: 'bi-exclamation-circle' }
    },
    {
      title: 'Documentation Gap',
      category: 'Compliance',
      description: 'Missing approval signatures on key transactions',
      date: 'Yesterday',
      severity: { label: 'Medium', type: 'warning', icon: 'bi-exclamation-triangle' }
    },
    {
      title: 'Policy Deviation',
      category: 'Operational',
      description: 'Non-adherence to established review procedures',
      date: '2 days ago',
      severity: { label: 'Low', type: 'info', icon: 'bi-info-circle' }
    },
    {
      title: 'Reconciliation Delay',
      category: 'Financial',
      description: 'Monthly account reconciliations not completed within deadline',
      date: '3 days ago',
      severity: { label: 'Medium', type: 'warning', icon: 'bi-exclamation-triangle' }
    }
  ];

  complianceStatus = [
    {
      category: 'Financial Reporting',
      score: 85,
      type: 'success',
      note: 'All major requirements met, minor improvements needed'
    },
    {
      category: 'Internal Controls',
      score: 70,
      type: 'warning',
      note: 'Several areas require strengthening'
    },
    {
      category: 'Risk Management',
      score: 90,
      type: 'success',
      note: 'Framework well-established and functioning'
    },
    {
      category: 'Regulatory Compliance',
      score: 95,
      type: 'success',
      note: 'Full compliance with current regulations'
    }
  ];

  auditActivities = [
    {
      date: 'Apr 15, 2024',
      description: 'Financial Statement Review',
      area: 'Finance',
      auditor: 'John Smith',
      status: { label: 'In Progress', type: 'primary' }
    },
    {
      date: 'Apr 14, 2024',
      description: 'Process Documentation Review',
      area: 'Operations',
      auditor: 'Sarah Johnson',
      status: { label: 'Completed', type: 'success' }
    },
    {
      date: 'Apr 13, 2024',
      description: 'Risk Assessment',
      area: 'Compliance',
      auditor: 'Mike Wilson',
      status: { label: 'Under Review', type: 'warning' }
    },
    {
      date: 'Apr 12, 2024',
      description: 'Control Testing',
      area: 'IT Systems',
      auditor: 'Emily Brown',
      status: { label: 'Completed', type: 'success' }
    }
  ];
}
