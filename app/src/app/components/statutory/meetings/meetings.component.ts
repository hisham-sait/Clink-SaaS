import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { CreateMeetingModalComponent } from './modal/create-meeting-modal.component';
import { EditMeetingModalComponent } from './modal/edit-meeting-modal.component';
import { ViewMeetingModalComponent } from './modal/view-meeting-modal.component';
import { ConfirmModalComponent } from './modal/confirm-modal.component';

import { Meeting, Activity, DocumentStatus } from '../statutory.types';

@Component({
  selector: 'app-meetings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    CreateMeetingModalComponent,
    EditMeetingModalComponent,
    ViewMeetingModalComponent,
    ConfirmModalComponent
  ],
  template: `
    <div class="container-fluid p-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 class="h3 mb-2">General Meetings Minutes</h1>
          <p class="text-muted mb-0">Record and manage company general meetings and resolutions</p>
        </div>
        <div>
          <button class="btn btn-primary d-inline-flex align-items-center gap-2" (click)="openAddMeetingModal()">
            <i class="bi bi-plus-lg"></i>
            <span>Add Meeting</span>
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
              <h3 class="mb-0">{{ meetings.length }}</h3>
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
                <span class="text-muted">Quorum</span>
                <i class="bi bi-people fs-4 text-primary"></i>
              </div>
              <h3 class="mb-0">{{ getQuorumAchievedPercentage() }}%</h3>
              <small class="text-muted">Quorum achievement rate</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Meetings Table -->
      <div class="card mb-4">
        <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
          <h5 class="mb-0">Meetings</h5>
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
                <th class="text-uppercase small fw-semibold text-secondary">Type</th>
                <th class="text-uppercase small fw-semibold text-secondary">Date</th>
                <th class="text-uppercase small fw-semibold text-secondary">Chairperson</th>
                <th class="text-uppercase small fw-semibold text-secondary">Quorum</th>
                <th class="text-uppercase small fw-semibold text-secondary">Status</th>
                <th class="text-uppercase small fw-semibold text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let meeting of getFilteredMeetings()">
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-calendar-event text-secondary"></i>
                    <a href="#" class="text-decoration-none" (click)="viewMeeting(meeting, $event)">
                      {{ meeting.meetingId }}
                    </a>
                  </div>
                </td>
                <td>{{ meeting.meetingType }}</td>
                <td>{{ formatDate(meeting.meetingDate) }}</td>
                <td>{{ meeting.chairperson }}</td>
                <td>
                  <span [class]="'badge ' + (meeting.quorum.achieved ? 'text-bg-success' : 'text-bg-danger')">
                    {{ meeting.quorum.present }}/{{ meeting.quorum.required }}
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + getStatusClass(meeting.status)">
                    {{ meeting.status }}
                  </span>
                </td>
                <td>
                  <div class="btn-group">
                    <button class="btn btn-link btn-sm text-body px-2" (click)="viewMeeting(meeting)" title="View Details">
                      <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-body px-2" (click)="editMeeting(meeting)" title="Edit">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-link btn-sm text-danger px-2" (click)="removeMeeting(meeting)" title="Remove">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="getFilteredMeetings().length === 0">
                <td colspan="7" class="text-center py-4 text-muted">
                  <i class="bi bi-info-circle me-2"></i>
                  No meetings found
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
export class MeetingsComponent {
  meetings: Meeting[] = [];
  showAll = false;
  recentActivities: Activity[] = [];
  private companyId: string = '1'; // This should be injected or retrieved from a service

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) {
    this.loadData();
  }

  private loadData(): void {
    const savedMeetings = localStorage.getItem('meetings');
    if (savedMeetings) {
      this.meetings = JSON.parse(savedMeetings);
    }

    const savedActivities = localStorage.getItem('meetingActivities');
    if (savedActivities) {
      this.recentActivities = JSON.parse(savedActivities);
    }
  }

  openAddMeetingModal(): void {
    const modalRef = this.modalService.open(CreateMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.result.then(
      (newMeeting: Meeting) => {
        this.meetings.push(newMeeting);
        localStorage.setItem('meetings', JSON.stringify(this.meetings));

        this.addActivity({
          id: crypto.randomUUID(),
          type: 'added',
          entityType: 'meeting',
          entityId: newMeeting.meetingId,
          description: `New ${newMeeting.meetingType} (${newMeeting.meetingId}) created`,
          user: 'System',
          time: new Date().toLocaleString(),
          companyId: this.companyId
        });
      },
      () => {} // Modal dismissed
    );
  }

  viewMeeting(meeting: Meeting, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    const modalRef = this.modalService.open(ViewMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.meeting = {...meeting};
    
    modalRef.result.then(
      (result: { action: string; meeting: Meeting } | undefined) => {
        if (result?.action === 'edit') {
          this.editMeeting(result.meeting);
        }
      },
      () => {} // Modal dismissed
    );
  }

  editMeeting(meeting: Meeting): void {
    const modalRef = this.modalService.open(EditMeetingModalComponent, {
      size: 'lg',
      backdrop: 'static'
    });
    
    modalRef.componentInstance.meeting = {...meeting};
    
    modalRef.result.then(
      (updatedMeeting: Meeting) => {
        const index = this.meetings.findIndex(m => m.meetingId === meeting.meetingId);
        if (index !== -1) {
          this.meetings[index] = updatedMeeting;
          localStorage.setItem('meetings', JSON.stringify(this.meetings));

          const statusChanged = meeting.status !== updatedMeeting.status;
          this.addActivity({
            id: crypto.randomUUID(),
            type: statusChanged ? 'status_changed' : 'updated',
            entityType: 'meeting',
            entityId: updatedMeeting.meetingId,
            description: statusChanged 
              ? `${updatedMeeting.meetingId} status changed to ${updatedMeeting.status}`
              : `${updatedMeeting.meetingId} details updated`,
            user: 'System',
            time: new Date().toLocaleString(),
            companyId: this.companyId
          });
        }
      },
      () => {} // Modal dismissed
    );
  }

  removeMeeting(meeting: Meeting): void {
    const modalRef = this.modalService.open(ConfirmModalComponent, {
      size: 'sm',
      backdrop: 'static'
    });

    modalRef.componentInstance.title = 'Confirm Removal';
    modalRef.componentInstance.message = `Are you sure you want to remove meeting ${meeting.meetingId}?`;
    modalRef.componentInstance.confirmButtonText = 'Remove';
    modalRef.componentInstance.confirmButtonClass = 'btn-danger';

    modalRef.result.then(
      (result: boolean) => {
        if (result === true) {
          const index = this.meetings.findIndex(m => m.meetingId === meeting.meetingId);
          if (index !== -1) {
            this.meetings.splice(index, 1);
            localStorage.setItem('meetings', JSON.stringify(this.meetings));

            this.addActivity({
              id: crypto.randomUUID(),
              type: 'removed',
              entityType: 'meeting',
              entityId: meeting.meetingId,
              description: `${meeting.meetingId} removed from meetings register`,
              user: 'System',
              time: new Date().toLocaleString(),
              companyId: this.companyId
            });
          }
        }
      },
      () => {} // Modal dismissed
    );
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  getStatusClass(status: DocumentStatus): string {
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

  getFilteredMeetings(): Meeting[] {
    if (!this.showAll) {
      // Show meetings from the last 3 months
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      return this.meetings.filter(m => new Date(m.meetingDate) >= threeMonthsAgo);
    }
    return this.meetings;
  }

  getTotalResolutions(): number {
    return this.meetings.reduce((sum, m) => sum + m.resolutions.length, 0);
  }

  getPassedResolutionsPercentage(): number {
    const totalResolutions = this.meetings.reduce((sum, m) => sum + m.resolutions.length, 0);
    if (totalResolutions === 0) return 0;

    const passedResolutions = this.meetings.reduce((sum, m) => 
      sum + m.resolutions.filter(r => r.outcome === 'Passed').length, 0);

    return Math.round((passedResolutions / totalResolutions) * 100);
  }

  getQuorumAchievedPercentage(): number {
    if (this.meetings.length === 0) return 0;

    const achievedCount = this.meetings.filter(m => m.quorum.achieved).length;
    return Math.round((achievedCount / this.meetings.length) * 100);
  }

  getActivityIcon(type: Activity['type']): string {
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
    localStorage.setItem('meetingActivities', JSON.stringify(this.recentActivities));
  }
}
