import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-external-consultant-dashboard',
  template: `
    <div class="container-fluid py-4">
      <div class="row g-4">
        <!-- Project Overview -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h5 class="card-title mb-1">Project Overview</h5>
                  <p class="text-muted mb-0">{{ companyName }}</p>
                </div>
                <div class="btn-group">
                  <button class="btn btn-outline-primary btn-sm">
                    <i class="bi bi-download me-2"></i>Export Report
                  </button>
                  <button class="btn btn-primary btn-sm">
                    <i class="bi bi-plus-lg me-2"></i>New Project
                  </button>
                </div>
              </div>
              <div class="row g-4">
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-primary bg-opacity-10 p-3 rounded">
                      <i class="bi bi-briefcase fs-4 text-primary"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Active Projects</h6>
                      <h4 class="mb-0">{{ activeProjects }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-success bg-opacity-10 p-3 rounded">
                      <i class="bi bi-check2-circle fs-4 text-success"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Completed</h6>
                      <h4 class="mb-0">{{ completedProjects }}</h4>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="d-flex align-items-center">
                    <div class="bg-warning bg-opacity-10 p-3 rounded">
                      <i class="bi bi-clock fs-4 text-warning"></i>
                    </div>
                    <div class="ms-3">
                      <h6 class="mb-0">Pending Tasks</h6>
                      <h4 class="mb-0">{{ pendingTasks }}</h4>
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
                      <h4 class="mb-0">{{ nextReview }}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Active Projects -->
        <div class="col-md-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Active Projects</h5>
                <button class="btn btn-sm btn-outline-primary">View All</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let project of activeProjectsList">
                  <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + project.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + project.icon + ' text-' + project.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ project.title }}</h6>
                        <small class="text-muted">Due: {{ project.dueDate }}</small>
                      </div>
                    </div>
                    <span [class]="'badge bg-' + project.status.type">{{ project.status.label }}</span>
                  </div>
                  <div class="progress" style="height: 6px;">
                    <div class="progress-bar" 
                         [class]="'bg-' + project.type"
                         [style.width.%]="project.progress"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Upcoming Reviews -->
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="card-title mb-0">Upcoming Reviews</h5>
                <button class="btn btn-sm btn-outline-primary">Calendar</button>
              </div>
              <div class="list-group list-group-flush">
                <div class="list-group-item border-0 px-0" *ngFor="let review of upcomingReviews">
                  <div class="d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <div [class]="'bg-' + review.type + ' bg-opacity-10 p-2 rounded'">
                        <i [class]="'bi ' + review.icon + ' text-' + review.type"></i>
                      </div>
                      <div class="ms-3">
                        <h6 class="mb-0">{{ review.title }}</h6>
                        <small class="text-muted">{{ review.date }}</small>
                      </div>
                    </div>
                    <button class="btn btn-sm" [class]="'btn-outline-' + review.type">
                      {{ review.action }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-4">Recent Activities</h5>
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Project</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let activity of recentActivities">
                      <td>{{ activity.description }}</td>
                      <td>{{ activity.project }}</td>
                      <td>{{ activity.date }}</td>
                      <td>
                        <i [class]="'bi ' + activity.icon + ' text-' + activity.type + ' me-2'"></i>
                        {{ activity.category }}
                      </td>
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
export class ExternalConsultantDashboardComponent {
  // Mock data
  companyName = 'Tech Solutions Ltd';
  activeProjects = 4;
  completedProjects = 12;
  pendingTasks = 8;
  nextReview = 'Apr 20';

  activeProjectsList = [
    {
      title: 'Process Optimization',
      dueDate: 'April 30, 2024',
      progress: 75,
      type: 'primary',
      icon: 'bi-gear',
      status: { label: 'In Progress', type: 'primary' }
    },
    {
      title: 'Digital Transformation',
      dueDate: 'May 15, 2024',
      progress: 45,
      type: 'info',
      icon: 'bi-laptop',
      status: { label: 'Planning', type: 'info' }
    },
    {
      title: 'Compliance Framework',
      dueDate: 'May 1, 2024',
      progress: 90,
      type: 'success',
      icon: 'bi-shield-check',
      status: { label: 'Review', type: 'warning' }
    },
    {
      title: 'Risk Assessment',
      dueDate: 'April 25, 2024',
      progress: 60,
      type: 'warning',
      icon: 'bi-exclamation-triangle',
      status: { label: 'Active', type: 'success' }
    }
  ];

  upcomingReviews = [
    {
      title: 'Project Milestone Review',
      date: 'Tomorrow, 2:00 PM',
      type: 'danger',
      icon: 'bi-calendar-check',
      action: 'Prepare'
    },
    {
      title: 'Strategy Meeting',
      date: 'April 22, 10:00 AM',
      type: 'warning',
      icon: 'bi-people',
      action: 'Schedule'
    },
    {
      title: 'Progress Report',
      date: 'April 25, 3:00 PM',
      type: 'info',
      icon: 'bi-file-text',
      action: 'Review'
    },
    {
      title: 'Client Presentation',
      date: 'April 28, 11:00 AM',
      type: 'success',
      icon: 'bi-easel',
      action: 'Prepare'
    }
  ];

  recentActivities = [
    {
      description: 'Updated project timeline',
      project: 'Process Optimization',
      date: 'Today, 10:30 AM',
      category: 'Planning',
      icon: 'bi-calendar',
      type: 'primary',
      status: { label: 'Complete', type: 'success' }
    },
    {
      description: 'Submitted progress report',
      project: 'Digital Transformation',
      date: 'Yesterday',
      category: 'Documentation',
      icon: 'bi-file-text',
      type: 'info',
      status: { label: 'Pending', type: 'warning' }
    },
    {
      description: 'Client meeting notes',
      project: 'Compliance Framework',
      date: '2 days ago',
      category: 'Meeting',
      icon: 'bi-people',
      type: 'success',
      status: { label: 'Reviewed', type: 'info' }
    },
    {
      description: 'Risk analysis update',
      project: 'Risk Assessment',
      date: '3 days ago',
      category: 'Analysis',
      icon: 'bi-graph-up',
      type: 'warning',
      status: { label: 'In Progress', type: 'primary' }
    }
  ];
}
