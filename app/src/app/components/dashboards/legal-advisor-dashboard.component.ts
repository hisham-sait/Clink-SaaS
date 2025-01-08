import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-legal-advisor-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Legal Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">Legal Overview</h5>
                  <p class="text-muted mb-0">{{ companyName }}</p>
                </div>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-download me-2"></i>Export Report
                  </button>
                  <button class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg me-2"></i>New Document
                  </button>
                </div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-file-earmark-text fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Legal Documents</h6>
                      <h4 class="mb-0">{{ totalDocuments }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-check-circle fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Compliance Score</h6>
                      <h4 class="mb-0">{{ complianceScore }}%</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-clock-history fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Pending Reviews</h6>
                      <h4 class="mb-0">{{ pendingReviews }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-calendar-check fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Next Due Date</h6>
                      <h4 class="mb-0">{{ nextDueDate }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Deadlines -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Upcoming Deadlines</h5>
                <button class="btn btn-sm btn-outline-primary">View Calendar</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let deadline of upcomingDeadlines">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + deadline.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + deadline.icon + ' text-' + deadline.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ deadline.title }}</h6>
                        <small class="text-muted">Due: {{ deadline.date }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + deadline.type">{{ deadline.daysLeft }} days left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Documents -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Recent Documents</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let document of recentDocuments">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + document.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + document.icon + ' text-' + document.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ document.title }}</h6>
                        <small class="text-muted">{{ document.date }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + document.status.type">{{ document.status.label }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compliance Status -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Compliance Status</h5>
              <div class="row g-4">
                <div class="col-md-4" *ngFor="let status of complianceStatus">
                  <div class="card border">
                    <div class="card-body">
                      <div class="d-flex align-items-center mb-3">
                        <div [class]="'bg-' + status.type + ' bg-opacity-10 p-3 rounded'">
                          <i [class]="'bi ' + status.icon + ' fs-4 text-' + status.type"></i>
                        </div>
                        <div class="ms-3">
                          <h6 class="mb-1">{{ status.category }}</h6>
                          <small [class]="'text-' + status.type">{{ status.status }}</small>
                        </div>
                      </div>
                      <div class="progress mb-2" style="height: 6px;">
                        <div class="progress-bar" 
                             [class]="'bg-' + status.type"
                             [style.width.%]="status.completion"></div>
                      </div>
                      <small class="text-muted">{{ status.note }}</small>
                    </div>
                  </div>
                </div>
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
export class LegalAdvisorDashboardComponent {
  // Mock data
  companyName = 'Tech Solutions Ltd';
  totalDocuments = 156;
  complianceScore = 92;
  pendingReviews = 5;
  nextDueDate = 'Apr 15';

  upcomingDeadlines = [
    {
      title: 'Annual Return Filing',
      date: 'April 15, 2024',
      daysLeft: 7,
      type: 'danger',
      icon: 'bi-file-text'
    },
    {
      title: 'Board Meeting Minutes',
      date: 'April 20, 2024',
      daysLeft: 12,
      type: 'warning',
      icon: 'bi-people'
    },
    {
      title: 'Regulatory Compliance Review',
      date: 'May 1, 2024',
      daysLeft: 23,
      type: 'info',
      icon: 'bi-shield-check'
    },
    {
      title: 'Shareholder Agreement Update',
      date: 'May 15, 2024',
      daysLeft: 37,
      type: 'success',
      icon: 'bi-file-earmark-text'
    }
  ];

  recentDocuments = [
    {
      title: 'Board Resolution',
      date: 'Today',
      type: 'primary',
      icon: 'bi-file-text',
      status: { label: 'Draft', type: 'warning' }
    },
    {
      title: 'Employment Contract',
      date: 'Yesterday',
      type: 'info',
      icon: 'bi-file-earmark-text',
      status: { label: 'Signed', type: 'success' }
    },
    {
      title: 'Privacy Policy Update',
      date: '2 days ago',
      type: 'warning',
      icon: 'bi-shield',
      status: { label: 'Review', type: 'info' }
    },
    {
      title: 'Vendor Agreement',
      date: '3 days ago',
      type: 'success',
      icon: 'bi-file-check',
      status: { label: 'Complete', type: 'success' }
    }
  ];

  complianceStatus = [
    {
      category: 'Corporate Governance',
      status: 'Up to Date',
      completion: 100,
      type: 'success',
      icon: 'bi-building',
      note: 'All required filings and registrations complete'
    },
    {
      category: 'Regulatory Compliance',
      status: 'Review Required',
      completion: 85,
      type: 'warning',
      icon: 'bi-shield-check',
      note: 'New regulations require policy updates'
    },
    {
      category: 'Contract Management',
      status: 'Active',
      completion: 95,
      type: 'info',
      icon: 'bi-file-text',
      note: 'All contracts current and properly maintained'
    }
  ];
}
