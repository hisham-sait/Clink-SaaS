import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { 
  TrackingItem,
  Milestone,
  Alert,
  TrackingStatus,
  Priority,
  AlertType,
  Activity
} from '../compliance.types';
import { CreateTaskModalComponent } from './modal/create-task-modal.component';
import { EditTaskModalComponent } from './modal/edit-task-modal.component';
import { ViewTaskModalComponent } from './modal/view-task-modal.component';
import { CreateMilestoneModalComponent } from './modal/create-milestone-modal.component';
import { EditMilestoneModalComponent } from './modal/edit-milestone-modal.component';
import { ViewMilestoneModalComponent } from './modal/view-milestone-modal.component';

type StatusClasses = {
  [key in TrackingStatus | 'Active' | 'Acknowledged' | 'Resolved' | 'Expired']: string;
};

type PriorityClasses = {
  [key in Priority]: string;
};

@Component({
  selector: 'app-compliance-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Previous template content remains unchanged until the end -->
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col">
          <h2 class="mb-3">Compliance Tracking</h2>
          <p class="text-muted">Monitor and track compliance tasks, milestones, and risks</p>
        </div>
        <div class="col-auto">
          <div class="btn-group">
            <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openCreateTaskModal()">
              <i class="bi bi-plus-lg"></i>
              <span>New Task</span>
            </button>
            <button class="btn btn-outline-primary d-inline-flex align-items-center gap-2" (click)="openCreateMilestoneModal()">
              <i class="bi bi-plus-lg"></i>
              <span>Add Milestone</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="text-muted mb-0">Total Tasks</h6>
                <i class="bi bi-list-task fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{statistics.totalTasks}}</h3>
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
              <h3 class="mb-0 text-success">{{statistics.completedTasks}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Overdue</h6>
                <i class="bi bi-exclamation-circle fs-4 text-danger"></i>
              </div>
              <h3 class="mb-0 text-danger">{{statistics.overdueTasks}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Progress</h6>
                <i class="bi bi-graph-up fs-4 text-info"></i>
              </div>
              <h3 class="mb-0 text-info">{{statistics.averageProgress}}%</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Milestones</h6>
                <i class="bi bi-flag fs-4 text-warning"></i>
              </div>
              <h3 class="mb-0 text-warning">{{statistics.upcomingMilestones}}</h3>
            </div>
          </div>
        </div>
        <div class="col-md-2">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h6 class="card-title mb-0">Open Risks</h6>
                <i class="bi bi-shield-exclamation fs-4 text-danger"></i>
              </div>
              <h3 class="mb-0 text-danger">{{statistics.openRisks}}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Tasks -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Compliance Tasks</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Task Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Category</th>
                <th class="text-uppercase small fw-semibold text-secondary">Priority</th>
                <th class="text-uppercase small fw-semibold text-secondary">Owner</th>
                <th class="text-uppercase small fw-semibold text-secondary">Due Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Progress</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of tasks">
                <td>
                  <div class="fw-medium">{{task.title}}</div>
                  <small class="text-muted">{{task.description}}</small>
                  <div class="mt-1">
                    <small class="text-muted me-2" *ngFor="let dep of task.dependencies">
                      <i class="bi bi-arrow-right-short"></i>{{dep}}
                    </small>
                  </div>
                </td>
                <td>{{task.category}}</td>
                <td>
                  <div class="d-flex align-items-center gap-1" [class]="getPriorityClass(task.priority)">
                    <i class="bi bi-flag-fill"></i>
                    <span>{{task.priority}}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    {{task.owner}}
                  </div>
                </td>
                <td>
                  <div [class]="isOverdue(task.dueDate) ? 'text-danger' : isDueSoon(task.dueDate) ? 'text-warning' : ''">
                    {{task.dueDate | date:'mediumDate'}}
                    <div class="small">
                      {{calculateDaysRemaining(task.dueDate)}} days remaining
                    </div>
                  </div>
                </td>
                <td style="min-width: 150px;">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                      <div class="progress-bar rounded-pill" role="progressbar" [style.width]="task.progress + '%'"
                           [ngClass]="{
                             'bg-success': task.progress >= 75,
                             'bg-warning': task.progress >= 25 && task.progress < 75,
                             'bg-danger': task.progress < 25
                           }">
                      </div>
                    </div>
                    <small class="text-muted">{{task.progress}}%</small>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(task.status)">{{task.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details" (click)="openViewTaskModal(task)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Update Progress" (click)="openEditTaskModal(task)">
                      <i class="bi bi-arrow-up-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit" (click)="openEditTaskModal(task)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Milestones -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Milestones</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Milestone Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Owner</th>
                <th class="text-uppercase small fw-semibold text-secondary">Due Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Progress</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let milestone of milestones">
                <td>
                  <div class="fw-medium">{{milestone.title}}</div>
                  <small class="text-muted">{{milestone.description}}</small>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    {{milestone.owner}}
                  </div>
                </td>
                <td>
                  <div [class]="isOverdue(milestone.dueDate) ? 'text-danger' : isDueSoon(milestone.dueDate) ? 'text-warning' : ''">
                    {{milestone.dueDate | date:'mediumDate'}}
                    <div class="small">
                      {{calculateDaysRemaining(milestone.dueDate)}} days remaining
                    </div>
                  </div>
                </td>
                <td style="min-width: 150px;">
                  <div class="d-flex align-items-center gap-2">
                    <div class="progress flex-grow-1" style="height: 6px;">
                      <div class="progress-bar rounded-pill" role="progressbar" [style.width]="milestone.progress + '%'"
                           [ngClass]="{
                             'bg-success': milestone.progress >= 75,
                             'bg-warning': milestone.progress >= 25 && milestone.progress < 75,
                             'bg-danger': milestone.progress < 25
                           }">
                      </div>
                    </div>
                    <small class="text-muted">{{milestone.progress}}%</small>
                  </div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(milestone.status)">{{milestone.status}}</span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" title="View Details" (click)="openViewMilestoneModal(milestone)">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" title="Update Progress" (click)="openEditMilestoneModal(milestone)">
                      <i class="bi bi-arrow-up-circle"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" title="Edit" (click)="openEditMilestoneModal(milestone)">
                      <i class="bi bi-pencil"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alerts -->
      <div class="card shadow-sm mb-4">
        <div class="card-header bg-white py-3">
          <h5 class="mb-0">Risk Alerts</h5>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">Alert Details</th>
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Priority</th>
                <th class="text-uppercase small fw-semibold text-secondary">Assigned To</th>
                <th class="text-uppercase small fw-semibold text-secondary">Created Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let alert of alerts">
                <td>
                  <div class="fw-medium">{{alert.title}}</div>
                  <small class="text-muted">{{alert.message}}</small>
                  <div class="mt-1 text-muted small d-flex align-items-center gap-1">
                    <i class="bi bi-shield-check"></i>
                    <span>{{alert.resolution}}</span>
                  </div>
                </td>
                <td>{{alert.type}}</td>
                <td>
                  <div class="d-flex align-items-center gap-1" [class]="getPriorityClass(alert.priority)">
                    <i class="bi bi-exclamation-triangle-fill"></i>
                    <span>{{alert.priority}}</span>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-person-circle text-secondary"></i>
                    {{alert.assignedTo.join(', ')}}
                  </div>
                </td>
                <td>{{alert.createdAt | date:'mediumDate'}}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(alert.status)">{{alert.status}}</span>
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
export class TrackingComponent {
  tasks: TrackingItem[] = [
    {
      id: '1',
      title: 'GDPR Compliance Review',
      description: 'Conduct quarterly GDPR compliance review',
      category: 'Regulatory',
      status: 'On Track',
      priority: 'High',
      startDate: new Date().toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
      owner: 'Sarah Johnson',
      assignees: ['Sarah Johnson'],
      progress: 60,
      metrics: [],
      milestones: [],
      alerts: [],
      dependencies: ['Data Mapping Update', 'Privacy Policy Review'],
      companyId: '1'
    },
    {
      id: '2',
      title: 'Annual Policy Update',
      description: 'Update internal compliance policies',
      category: 'Internal',
      status: 'Not Started',
      priority: 'Medium',
      startDate: new Date().toISOString(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
      owner: 'Michael Brown',
      assignees: ['Michael Brown'],
      progress: 0,
      metrics: [],
      milestones: [],
      alerts: [],
      dependencies: ['Policy Review', 'Stakeholder Feedback'],
      companyId: '1'
    }
  ];

  milestones: Milestone[] = [
    {
      id: '1',
      title: 'Q2 Compliance Review',
      description: 'Complete Q2 compliance review and documentation',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
      status: 'On Track',
      owner: 'Sarah Johnson',
      deliverables: ['Review Report', 'Documentation Updates'],
      dependencies: [],
      progress: 45,
      notes: [],
      trackingItemId: '1',
      companyId: '1'
    },
    {
      id: '2',
      title: 'Annual Certification',
      description: 'Complete annual compliance certification process',
      dueDate: new Date(new Date().setDate(new Date().getDate() + 60)).toISOString(),
      status: 'Not Started',
      owner: 'David Wilson',
      deliverables: ['Certification Documents'],
      dependencies: [],
      progress: 15,
      notes: [],
      trackingItemId: '2',
      companyId: '1'
    }
  ];

  alerts: Alert[] = [
    {
      id: '1',
      type: 'Critical',
      title: 'Data Protection Gap',
      message: 'Identified potential data protection compliance gap',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      status: 'Active',
      priority: 'High',
      assignedTo: ['Sarah Johnson'],
      resolution: 'Implementing additional security controls',
      entityType: 'tracking',
      entityId: '1'
    },
    {
      id: '2',
      type: 'Warning',
      title: 'Policy Implementation Delay',
      message: 'Delay in implementing new compliance policies',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      status: 'Active',
      priority: 'Medium',
      assignedTo: ['Michael Brown'],
      resolution: 'Accelerating review process',
      entityType: 'tracking',
      entityId: '2'
    }
  ];

  recentActivities: Activity[] = [
    {
      id: '1',
      type: 'created',
      entityType: 'tracking',
      entityId: '1',
      description: 'created a new compliance task',
      user: 'Sarah Johnson',
      time: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      companyId: '1'
    },
    {
      id: '2',
      type: 'milestone_completed',
      entityType: 'milestone',
      entityId: '1',
      description: 'completed the Q1 Review milestone',
      user: 'David Wilson',
      time: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
      companyId: '1'
    },
    {
      id: '3',
      type: 'alert_triggered',
      entityType: 'tracking',
      entityId: '2',
      description: 'triggered a policy implementation delay alert',
      user: 'System',
      time: new Date(new Date().setHours(new Date().getHours() - 6)).toISOString(),
      companyId: '1'
    }
  ];

  statistics = {
    totalTasks: this.tasks.length,
    completedTasks: this.tasks.filter(t => t.status === 'Completed').length,
    overdueTasks: this.tasks.filter(t => {
      const dueDate = new Date(t.dueDate);
      return dueDate < new Date();
    }).length,
    upcomingMilestones: this.milestones.filter(m => m.status === 'Not Started').length,
    openRisks: this.alerts.filter(r => r.status === 'Active').length,
    averageProgress: Math.round(this.tasks.reduce((sum, t) => sum + t.progress, 0) / this.tasks.length)
  };

  private statusClasses: StatusClasses = {
    'On Track': 'bg-success',
    'At Risk': 'bg-warning',
    'Off Track': 'bg-danger',
    'Completed': 'bg-success',
    'Not Started': 'bg-secondary',
    'Active': 'bg-danger',
    'Acknowledged': 'bg-warning',
    'Resolved': 'bg-success',
    'Expired': 'bg-secondary'
  };

  private priorityClasses: PriorityClasses = {
    'Critical': 'text-danger fw-bold',
    'High': 'text-danger',
    'Medium': 'text-warning',
    'Low': 'text-info'
  };

  constructor(private modalService: NgbModal) {}

  getStatusClass(status: TrackingStatus | 'Active' | 'Acknowledged' | 'Resolved' | 'Expired'): string {
    return this.statusClasses[status] || 'bg-secondary';
  }

  getPriorityClass(priority: Priority): string {
    return this.priorityClasses[priority];
  }

  calculateDaysRemaining(dueDate: string): number {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  isOverdue(dueDate: string): boolean {
    return this.calculateDaysRemaining(dueDate) < 0;
  }

  isDueSoon(dueDate: string): boolean {
    const daysRemaining = this.calculateDaysRemaining(dueDate);
    return daysRemaining >= 0 && daysRemaining <= 7;
  }

  getActivityIconClass(type: string): string {
    const classes: { [key: string]: string } = {
      'created': 'rounded-circle bg-primary bg-opacity-10 p-2',
      'updated': 'rounded-circle bg-info bg-opacity-10 p-2',
      'completed': 'rounded-circle bg-success bg-opacity-10 p-2',
      'milestone_completed': 'rounded-circle bg-warning bg-opacity-10 p-2',
      'alert_triggered': 'rounded-circle bg-danger bg-opacity-10 p-2'
    };
    return classes[type] || 'rounded-circle bg-secondary bg-opacity-10 p-2';
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'created': 'bi bi-plus-lg text-primary',
      'updated': 'bi bi-pencil text-info',
      'completed': 'bi bi-check-lg text-success',
      'milestone_completed': 'bi bi-flag-fill text-warning',
      'alert_triggered': 'bi bi-exclamation-triangle-fill text-danger'
    };
    return icons[type] || 'bi bi-activity text-secondary';
  }

  openCreateTaskModal() {
    const modalRef = this.modalService.open(CreateTaskModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.result.then((result) => {
      if (result) {
        // Handle new task creation
        console.log('New task:', result);
      }
    });
  }

  openEditTaskModal(task: TrackingItem) {
    const modalRef = this.modalService.open(EditTaskModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.componentInstance.task = task;
    modalRef.result.then((result) => {
      if (result) {
        // Handle task update
        console.log('Updated task:', result);
      }
    });
  }

  openViewTaskModal(task: TrackingItem) {
    const modalRef = this.modalService.open(ViewTaskModalComponent, { size: 'lg' });
    modalRef.componentInstance.task = task;
  }

  openCreateMilestoneModal() {
    const modalRef = this.modalService.open(CreateMilestoneModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.result.then((result) => {
      if (result) {
        // Handle new milestone creation
        console.log('New milestone:', result);
      }
    });
  }

  openEditMilestoneModal(milestone: Milestone) {
    const modalRef = this.modalService.open(EditMilestoneModalComponent, { size: 'lg' });
    modalRef.componentInstance.companies = [{ id: '1', name: 'Demo Company' }];
    modalRef.componentInstance.milestone = milestone;
    modalRef.result.then((result) => {
      if (result) {
        // Handle milestone update
        console.log('Updated milestone:', result);
      }
    });
  }

  openViewMilestoneModal(milestone: Milestone) {
    const modalRef = this.modalService.open(ViewMilestoneModalComponent, { size: 'lg' });
    modalRef.componentInstance.milestone = milestone;
  }
}
