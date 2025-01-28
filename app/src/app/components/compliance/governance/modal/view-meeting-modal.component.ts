import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting, CommitteeMeetingAttendee, CommitteeActionItem } from '../../compliance.types';

@Component({
  selector: 'app-view-meeting-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Meeting Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Basic Information -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">{{meeting.type}} Meeting</h6>
              <small class="text-muted">{{meeting.date | date:'mediumDate'}} at {{meeting.time}}</small>
            </div>
            <span [class]="'badge ' + getMeetingStatusClass(meeting.status)">{{meeting.status}}</span>
          </div>
        </div>

        <!-- Location -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Meeting Details</small>
              <div class="d-flex flex-column gap-1">
                <div class="d-flex align-items-center gap-2" *ngIf="meeting.location">
                  <i class="bi bi-geo-alt text-primary"></i>
                  <span class="small">{{meeting.location}}</span>
                </div>
                <div class="d-flex align-items-center gap-2" *ngIf="meeting.virtualLink">
                  <i class="bi bi-camera-video text-success"></i>
                  <span class="small">{{meeting.virtualLink}}</span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-clock text-info"></i>
                  <span class="small">Duration: {{getDuration()}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Attendees -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Attendees</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let attendee of meeting.attendees">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i class="bi bi-person-circle text-secondary"></i>
                      <div>
                        <span class="small">{{attendee.name}}</span>
                        <small class="text-muted d-block">{{attendee.role}}</small>
                      </div>
                    </div>
                    <span [class]="'badge ' + getAttendanceStatusClass(attendee.status)">{{attendee.status}}</span>
                  </div>
                  <small class="text-muted d-block mt-1" *ngIf="attendee.notes">{{attendee.notes}}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Agenda -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Agenda</small>
              <ol class="list-unstyled mb-0">
                <li class="small mb-2" *ngFor="let item of meeting.agenda; let i = index">
                  <div class="d-flex align-items-start gap-2">
                    <span class="badge bg-primary">{{i + 1}}</span>
                    <span>{{item}}</span>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Materials -->
        <div class="col-12" *ngIf="meeting.materials?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Meeting Materials</small>
              <ul class="list-unstyled mb-0">
                <li class="small" *ngFor="let material of meeting.materials">
                  <i class="bi bi-file-earmark-text text-primary me-2"></i>{{material}}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Minutes -->
        <div class="col-12" *ngIf="meeting.minutes">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Meeting Minutes</small>
              <p class="small mb-0" style="white-space: pre-wrap;">{{meeting.minutes}}</p>
            </div>
          </div>
        </div>

        <!-- Decisions -->
        <div class="col-12" *ngIf="meeting.decisions?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Key Decisions</small>
              <ul class="list-unstyled mb-0">
                <li class="small mb-2" *ngFor="let decision of meeting.decisions">
                  <i class="bi bi-check-circle-fill text-success me-2"></i>{{decision}}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Action Items -->
        <div class="col-12" *ngIf="meeting.actionItems?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Action Items</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let item of meeting.actionItems">
                  <div class="d-flex justify-content-between align-items-start mb-1">
                    <div class="d-flex align-items-center gap-2">
                      <i [class]="getActionItemIcon(item.status)"></i>
                      <span class="small">{{item.task}}</span>
                    </div>
                    <span [class]="'badge ' + getActionItemStatusClass(item.status)">{{item.status}}</span>
                  </div>
                  <div class="small text-muted">
                    Assigned to: {{item.assignedTo}} | Due: {{item.dueDate | date:'mediumDate'}}
                  </div>
                  <small class="text-muted d-block mt-1" *ngIf="item.notes">{{item.notes}}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="col-12" *ngIf="meeting.notes">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Additional Notes</small>
              <p class="small mb-0">{{meeting.notes}}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class ViewMeetingModalComponent {
  @Input() meeting!: CommitteeMeeting;

  constructor(public activeModal: NgbActiveModal) {}

  getMeetingStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getAttendanceStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Present': 'bg-success',
      'Absent': 'bg-danger',
      'Late': 'bg-warning',
      'Excused': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getActionItemStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Pending': 'bg-warning',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Overdue': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getActionItemIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'Pending': 'bi bi-circle text-warning',
      'In Progress': 'bi bi-play-circle text-primary',
      'Completed': 'bi bi-check-circle text-success',
      'Overdue': 'bi bi-exclamation-circle text-danger'
    };
    return icons[status] || 'bi bi-circle text-secondary';
  }

  getDuration(): string {
    // Simulated duration - in a real app, calculate from start/end time
    return '2 hours';
  }
}
