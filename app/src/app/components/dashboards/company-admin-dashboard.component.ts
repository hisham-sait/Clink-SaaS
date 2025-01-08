import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-admin-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Company Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">{{ companyName }}</h5>
                  <p class="text-muted mb-0">Company Overview</p>
                </div>
                <div class="badge bg-success">Active</div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-people fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Total Users</h6>
                      <h4 class="mb-0">{{ totalUsers }}</h4>
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
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-file-text fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Documents</h6>
                      <h4 class="mb-0">{{ totalDocuments }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-bell fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Pending Tasks</h6>
                      <h4 class="mb-0">{{ pendingTasks }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Compliance Calendar -->
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
                        <small class="text-muted">Due: {{ deadline.dueDate }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + deadline.type">{{ deadline.daysLeft }} days left</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Recent Activity</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let activity of recentActivities">
                  <div class="d-flex align-items-center">
                    <div [class]="'bg-' + activity.type + ' bg-opacity-10 p-2 rounded'">
                      <i [class]="'bi ' + activity.icon + ' text-' + activity.type"></i>
                    </div>
                    <div class="ms-3">
                      <p class="mb-0">{{ activity.message }}</p>
                      <small class="text-muted">{{ activity.time }} by {{ activity.user }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Quick Actions</h5>
              <div class="row g-3">
                <div class="col-md-3" *ngFor="let action of quickActions">
                  <button class="btn btn-light border w-100 p-3 d-flex align-items-center">
                    <i [class]="'bi ' + action.icon + ' fs-4 me-2'"></i>
                    <span>{{ action.label }}</span>
                  </button>
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
export class CompanyAdminDashboardComponent {
  // Mock data
  companyName = 'Tech Solutions Ltd';
  totalUsers = 48;
  complianceScore = 92;
  totalDocuments = 156;
  pendingTasks = 8;

  upcomingDeadlines = [
    {
      title: 'Annual Return Filing',
      dueDate: 'March 31, 2024',
      daysLeft: 15,
      type: 'warning',
      icon: 'bi-calendar'
    },
    {
      title: 'Board Meeting',
      dueDate: 'March 15, 2024',
      daysLeft: 7,
      type: 'info',
      icon: 'bi-people'
    },
    {
      title: 'Tax Submission',
      dueDate: 'April 5, 2024',
      daysLeft: 30,
      type: 'success',
      icon: 'bi-file-text'
    },
    {
      title: 'Compliance Audit',
      dueDate: 'March 20, 2024',
      daysLeft: 3,
      type: 'danger',
      icon: 'bi-shield-check'
    }
  ];

  recentActivities = [
    {
      message: 'Updated company profile information',
      time: '2 hours ago',
      user: 'John Smith',
      type: 'primary',
      icon: 'bi-pencil'
    },
    {
      message: 'Uploaded Q4 financial statements',
      time: '5 hours ago',
      user: 'Sarah Johnson',
      type: 'success',
      icon: 'bi-file-earmark-text'
    },
    {
      message: 'Added new team member',
      time: '1 day ago',
      user: 'Mike Wilson',
      type: 'info',
      icon: 'bi-person-plus'
    },
    {
      message: 'Completed compliance checklist',
      time: '2 days ago',
      user: 'Emily Brown',
      type: 'warning',
      icon: 'bi-check2-square'
    }
  ];

  quickActions = [
    { icon: 'bi-person-plus', label: 'Add User' },
    { icon: 'bi-file-earmark-text', label: 'New Document' },
    { icon: 'bi-calendar-plus', label: 'Schedule Meeting' },
    { icon: 'bi-shield-check', label: 'Compliance Check' }
  ];
}
