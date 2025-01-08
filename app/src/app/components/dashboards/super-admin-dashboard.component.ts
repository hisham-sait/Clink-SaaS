import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-super-admin-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Platform Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Platform Overview</h5>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-building fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Total Companies</h6>
                      <h4 class="mb-0">{{ totalCompanies }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-people fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Total Users</h6>
                      <h4 class="mb-0">{{ totalUsers }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-info bg-opacity-10 p-3 rounded">
                      <i class="bi bi-activity fs-4 text-info"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Active Sessions</h6>
                      <h4 class="mb-0">{{ activeSessions }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-hdd-rack fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Server Load</h6>
                      <h4 class="mb-0">{{ serverLoad }}%</h4>
                    </div>
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
                      <small class="text-muted">{{ activity.time }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- System Health -->
        <div class="col-md-6">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">System Health</h5>
                <button class="btn btn-sm btn-outline-primary">Details</button>
              </div>
              <div class="mb-4" *ngFor="let metric of systemMetrics">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span>{{ metric.name }}</span>
                  <span>{{ metric.value }}%</span>
                </div>
                <div class="progress" style="height: 6px;">
                  <div class="progress-bar" 
                       [class]="'bg-' + metric.status"
                       [style.width.%]="metric.value"></div>
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
export class SuperAdminDashboardComponent {
  // Mock data
  totalCompanies = 156;
  totalUsers = 2847;
  activeSessions = 342;
  serverLoad = 67;

  recentActivities = [
    { type: 'primary', icon: 'bi-person-plus', message: 'New company registered: Tech Solutions Ltd', time: '5 minutes ago' },
    { type: 'success', icon: 'bi-check-circle', message: 'System backup completed successfully', time: '20 minutes ago' },
    { type: 'warning', icon: 'bi-exclamation-triangle', message: 'High server load detected', time: '1 hour ago' },
    { type: 'info', icon: 'bi-gear', message: 'System updates installed', time: '2 hours ago' }
  ];

  systemMetrics = [
    { name: 'CPU Usage', value: 67, status: 'success' },
    { name: 'Memory Usage', value: 84, status: 'warning' },
    { name: 'Storage', value: 42, status: 'success' },
    { name: 'Network', value: 93, status: 'danger' }
  ];

  quickActions = [
    { icon: 'bi-plus-circle', label: 'Add Company' },
    { icon: 'bi-person-plus', label: 'Add User' },
    { icon: 'bi-gear', label: 'System Settings' },
    { icon: 'bi-file-earmark-text', label: 'View Reports' }
  ];
}
