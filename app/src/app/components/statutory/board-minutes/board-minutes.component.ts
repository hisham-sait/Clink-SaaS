import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateBoardMinuteModalComponent } from './modal/create-board-minute-modal.component';
import { EditBoardMinuteModalComponent } from './modal/edit-board-minute-modal.component';
import { ViewBoardMinuteModalComponent } from './modal/view-board-minute-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

interface BoardMinute {
  minuteId: string;
  meetingDate: string;
  startTime: string;
  endTime: string;
  venue: string;
  chairperson: string;
  attendees: string[];
  agenda: string;
  discussions: {
    topic: string;
    details: string;
    decisions: string[];
    actionItems?: {
      task: string;
      assignee: string;
      dueDate: string;
      status: 'Pending' | 'In Progress' | 'Completed';
    }[];
  }[];
  resolutions: {
    title: string;
    description: string;
    proposedBy: string;
    secondedBy: string;
    outcome: 'Passed' | 'Rejected' | 'Deferred';
  }[];
  minutes: string;
  status: 'Draft' | 'Final' | 'Signed';
  attachments?: string[];
  notes?: string;
}

interface Activity {
  type: 'added' | 'updated' | 'removed' | 'status_changed';
  description: string;
  user: string;
  time: string;
}

@Component({
  selector: 'app-board-minutes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateBoardMinuteModalComponent,
    EditBoardMinuteModalComponent,
    ViewBoardMinuteModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">Board Minutes Register</h1>
          <p class="text-muted mb-0">Record and manage board meetings and resolutions</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddMinuteModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Board Meeting</span>
          </button>
        </div>
      </div>

      <!-- Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Total Meetings</span>
                <i class="bi bi-calendar-event fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ minutes.length }}</h3>
              <small class="text-muted">Recorded meetings</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Resolutions</span>
                <i class="bi bi-file-text fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getTotalResolutions() }}</h3>
              <small class="text-muted">Total resolutions</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Passed</span>
                <i class="bi bi-check-circle fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getPassedResolutionsPercentage() }}%</h3>
              <small class="text-muted">Resolution success rate</small>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted">Actions</span>
                <i class="bi bi-list-task fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getCompletedActionsPercentage() }}%</h3>
              <small class="text-muted">Action items completed</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Minutes Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Board Meetings</h5>
          <button class="btn btn-light btn-sm d-inline-flex align-items-center gap-2 border" (click)="toggleShowAll()">
            <i [class]="showAll ? 'bi bi-funnel' : 'bi bi-funnel-fill'" class="text-primary"></i>
            <span>{{ showAll ? 'Show Recent Only' : 'Show All Meetings' }}</span>
          </button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th class="text-uppercase small fw-semibold text-secondary">ID</th>
                <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Chairperson</th>
                <th class="text-uppercase small fw-semibold text-secondary">Resolutions</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let minute of getFilteredMinutes()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-event text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewMinute(minute, $event)">
                      {{ minute.minuteId }}
                    </a>
                  </div>
                </td>
                <td>{{ formatDate(minute.meetingDate) }}</td>
                <td>{{ minute.chairperson }}</td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge text-bg-secondary">{{ minute.resolutions.length }}</span>
                    <div class="small">
                      <span class="text-success">{{ getPassedResolutions(minute) }}</span> /
                      <span class="text-danger">{{ getRejectedResolutions(minute) }}</span> /
                      <span class="text-warning">{{ getDeferredResolutions(minute) }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge text-bg-secondary">{{ getTotalActions(minute) }}</span>
                    <div class="small">
                      {{ getCompletedActions(minute) }} completed
                    </div>
                  </div>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusClass(minute.status)">
                    {{ minute.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewMinute(minute)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editMinute(minute)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeMinute(minute)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredMinutes().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No board meetings found
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Recent Activities</h5>
          <button class="btn btn-link p-0 text-decoration-none">
            <i class="bi bi-arrow-clockwise me-1"></i>
            <span>Refresh</span>
          </button>
        </div>
        <div class="card-body">
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0" *ngFor="let activity of recentActivities">
              <div class="d-flex align-items-start gap-3">
                <div class="bg-light rounded p-2">
                  <i [class]="getActivityIcon(activity.type)"></i>
                </div>
                <div>
                  <p class="mb-1">{{ activity.description }}</p>
                  <div class="d-flex align-items-center gap-2 small">
                    <span class="text-primary">{{ activity.user }}</span>
                    <span class="text-muted">{{ activity.time }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="text-center py-4 text-muted" *ngIf="recentActivities.length === 0">
              <i class="bi bi-info-circle me-2"></i>
              No recent activities
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BoardMinutesComponent {
  minutes: BoardMinute[] = [];
  showAll = false;
  recentActivities: Activity[] = [];

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedMinutes = localStorage.getItem('boardMinutes');
    if (savedMinutes) {
      this.minutes = JSON.parse(savedMinutes);
    }

    const savedActivities = localStorage.getItem('boardMinuteActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddMinuteModal(): void {
    const modalRef = this.modalService.open(CreateBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newMinute: BoardMinute) => {
        this.minutes.push(newMinute);
        localStorage.setItem('boardMinutes', JSON.stringify(this.minutes));

        this.addActivity({
          type: 'added',
          description: `New board meeting ${newMinute.minuteId} created`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  viewMinute(minute: BoardMinute, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.minute = {...minute};
    
    modalRef.result.then(
      (result: { action: string; minute: BoardMinute }) => {
        if (result?.action === 'edit') {
          this.editMinute(result.minute);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editMinute(minute: BoardMinute): void {
    const modalRef = this.modalService.open(EditBoardMinuteModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.minute = {...minute};
    
    modalRef.result.then(
      (updatedMinute: BoardMinute) => {
        const index = this.minutes.indexOf(minute);
        this.minutes[index] = updatedMinute;
        localStorage.setItem('boardMinutes', JSON.stringify(this.minutes));

        const statusChanged = minute.status !== updatedMinute.status;
        this.addActivity({
          type: statusChanged ? 'status_changed' : 'updated',
          description: statusChanged 
            ? `${updatedMinute.minuteId} status changed to ${updatedMinute.status}`
            : `${updatedMinute.minuteId} details updated`,
          user: 'System',
          time: new Date().toLocaleString()
        });
      },
      () => {} // Modal dismissed
    );
  }

  removeMinute(minute: BoardMinute): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove board meeting ${minute.minuteId}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result) => {
        if (result === true) {
          const index = this.minutes.indexOf(minute);
          this.minutes.splice(index, 1);
          localStorage.setItem('boardMinutes', JSON.stringify(this.minutes));

          this.addActivity({
            type: 'removed',
            description: `${minute.minuteId} removed from board minutes register`,
            user: 'System',
            time: new Date().toLocaleString()
          });
        }
      },
      () => {} // Modal dismissed
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Draft':
        return 'text-bg-warning';
      case 'Final':
        return 'text-bg-info';
      case 'Signed':
        return 'text-bg-success';
      default:
        return 'text-bg-secondary';
    }
  }

  toggleShowAll(): void {
    this.showAll = !this.showAll;
  }

  getFilteredMinutes(): BoardMinute[] {
    if (!this.showAll) {
      // Show meetings from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return this.minutes.filter(m => new Date(m.meetingDate) >= threeMonthsAgo);
    }
    return this.minutes;
  }

  getTotalResolutions(): number {
    return this.minutes.reduce((sum, m) => sum + m.resolutions.length, 0);
  }

  getPassedResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Passed').length;
  }

  getRejectedResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Rejected').length;
  }

  getDeferredResolutions(minute: BoardMinute): number {
    return minute.resolutions.filter(r => r.outcome === 'Deferred').length;
  }

  getPassedResolutionsPercentage(): number {
    const totalResolutions = this.minutes.reduce((sum, m) => sum + m.resolutions.length, 0);
    if (totalResolutions === 0) return 0;

    const passedResolutions = this.minutes.reduce((sum, m) => 
      sum + m.resolutions.filter(r => r.outcome === 'Passed').length, 0);

    return Math.round((passedResolutions / totalResolutions) * 100);
  }

  getTotalActions(minute: BoardMinute): number {
    return minute.discussions.reduce((sum, d) => sum + (d.actionItems?.length || 0), 0);
  }

  getCompletedActions(minute: BoardMinute): number {
    return minute.discussions.reduce((sum, d) => 
      sum + (d.actionItems?.filter(a => a.status === 'Completed').length || 0), 0);
  }

  getCompletedActionsPercentage(): number {
    const totalActions = this.minutes.reduce((sum, m) => 
      sum + m.discussions.reduce((dSum, d) => dSum + (d.actionItems?.length || 0), 0), 0);
    
    if (totalActions === 0) return 0;

    const completedActions = this.minutes.reduce((sum, m) => 
      sum + m.discussions.reduce((dSum, d) => 
        dSum + (d.actionItems?.filter(a => a.status === 'Completed').length || 0), 0), 0);

    return Math.round((completedActions / totalActions) * 100);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'added':
        return 'bi bi-plus-circle';
      case 'updated':
        return 'bi bi-pencil';
      case 'removed':
        return 'bi bi-trash';
      case 'status_changed':
        return 'bi bi-arrow-repeat';
      default:
        return 'bi bi-activity';
    }
  }

  private addActivity(activity: Activity): void {
    this.recentActivities.unshift(activity);
    if (this.recentActivities.length > 10) {
      this.recentActivities.pop();
    }
    localStorage.setItem('boardMinuteActivities', JSON.stringify(this.recentActivities));
  }
}
