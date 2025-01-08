import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-platform-admin-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Platform Stats -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Platform Statistics</h5>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-building fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Active Companies</h6>
                      <h4 class="mb-0">{{ activeCompanies }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-people fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Active Users</h6>
                      <h4 class="mb-0">{{ activeUsers }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-clock-history fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Pending Approvals</h6>
                      <h4 class="mb-0">{{ pendingApprovals }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-exclamation-triangle fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Issues Reported</h6>
                      <h4 class="mb-0">{{ issuesReported }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Registrations -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Recent Registrations</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let registration of recentRegistrations">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div class="bg-light rounded p-2">
                        <i class="bi bi-building fs-5"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ registration.companyName }}</h6>
                        <small class="text-muted">{{ registration.date }}</small>
                      </div>
                    </div>
                    <button class="btn btn-sm" [class]="'btn-outline-' + registration.status.type">
                      {{ registration.status.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Support Tickets -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Support Tickets</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let ticket of supportTickets">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + ticket.priority.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + ticket.priority.icon + ' text-' + ticket.priority.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ ticket.title }}</h6>
                        <small class="text-muted">{{ ticket.company }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + ticket.priority.type">{{ ticket.priority.label }}</span>
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
export class PlatformAdminDashboardComponent {
  // Mock data
  activeCompanies = 142;
  activeUsers = 2156;
  pendingApprovals = 23;
  issuesReported = 15;

  recentRegistrations = [
    { 
      companyName: 'Tech Solutions Ltd',
      date: '2 hours ago',
      status: { label: 'Pending Review', type: 'warning' }
    },
    { 
      companyName: 'Global Innovations Inc',
      date: '5 hours ago',
      status: { label: 'Approved', type: 'success' }
    },
    { 
      companyName: 'Digital Dynamics',
      date: '1 day ago',
      status: { label: 'Needs Info', type: 'info' }
    },
    { 
      companyName: 'Future Systems',
      date: '1 day ago',
      status: { label: 'Approved', type: 'success' }
    }
  ];

  supportTickets = [
    {
      title: 'Integration Issue',
      company: 'Tech Solutions Ltd',
      priority: { label: 'High', type: 'danger', icon: 'bi-exclamation-circle' }
    },
    {
      title: 'Account Access',
      company: 'Global Innovations Inc',
      priority: { label: 'Medium', type: 'warning', icon: 'bi-exclamation-triangle' }
    },
    {
      title: 'Report Generation',
      company: 'Digital Dynamics',
      priority: { label: 'Low', type: 'success', icon: 'bi-info-circle' }
    },
    {
      title: 'Data Import Failed',
      company: 'Future Systems',
      priority: { label: 'High', type: 'danger', icon: 'bi-exclamation-circle' }
    }
  ];

  quickActions = [
    { icon: 'bi-check-circle', label: 'Review Registrations' },
    { icon: 'bi-ticket', label: 'Support Tickets' },
    { icon: 'bi-people', label: 'User Management' },
    { icon: 'bi-gear', label: 'Platform Settings' }
  ];
}
