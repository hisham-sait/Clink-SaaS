import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Meeting } from '../../statutory.types';

@Component({
  selector: 'app-view-meeting-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Meeting Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="row g-3">
        <!-- Basic Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Basic Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Meeting ID</label>
              <div class="form-control-plaintext">{{ meeting.id }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Type</label>
              <div class="form-control-plaintext">{{ meeting.meetingType }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + getStatusClass(meeting.status)">
                  {{ meeting.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Date and Time -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Schedule</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Date</label>
              <div class="form-control-plaintext">{{ formatDate(meeting.meetingDate) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Start Time</label>
              <div class="form-control-plaintext">{{ formatTime(meeting.startTime) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">End Time</label>
              <div class="form-control-plaintext">{{ formatTime(meeting.endTime) }}</div>
            </div>
          </div>
        </div>

        <!-- Venue -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Location</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ meeting.venue }}</div>
        </div>

        <!-- Participants -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Participants</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Chairperson</label>
              <div class="form-control-plaintext">{{ meeting.chairperson }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Attendees</label>
              <div class="form-control-plaintext">
                <ul class="list-unstyled mb-0">
                  <li *ngFor="let attendee of meeting.attendees">{{ attendee }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Quorum -->
        <div class="col-12" *ngIf="meeting.quorum">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Quorum Details</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Required</label>
              <div class="form-control-plaintext">{{ meeting.quorum?.required || 0 }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Present</label>
              <div class="form-control-plaintext">{{ meeting.quorum?.present || 0 }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (meeting.quorum?.achieved ? 'text-bg-success' : 'text-bg-danger')">
                  {{ meeting.quorum?.achieved ? 'Achieved' : 'Not Achieved' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Agenda -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Agenda</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ meeting.agenda }}</div>
        </div>

        <!-- Resolutions -->
        <div class="col-12" *ngIf="meeting.resolutions?.length">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Resolutions</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="list-group">
            <div class="list-group-item" *ngFor="let resolution of meeting.resolutions">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ resolution.title }}</h6>
                <span [class]="'badge ' + getResolutionOutcomeClass(resolution.outcome)">
                  {{ resolution.outcome }}
                </span>
              </div>
              <div class="small text-muted mb-2">{{ resolution.type }} Resolution</div>
              <p class="mb-0">{{ resolution.description }}</p>
            </div>
          </div>
        </div>

        <!-- Minutes -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Minutes</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ meeting.minutes }}</div>
        </div>

        <!-- Notes -->
        <div class="col-12" *ngIf="meeting.notes">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Notes</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ meeting.notes }}</div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">
        Edit
      </button>
    </div>
  `
})
export class ViewMeetingModalComponent {
  @Input() meeting!: Meeting;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  formatTime(time: string): string {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
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

  getResolutionOutcomeClass(outcome: string): string {
    switch (outcome) {
      case 'Passed':
        return 'text-bg-success';
      case 'Rejected':
        return 'text-bg-danger';
      case 'Pending':
        return 'text-bg-warning';
      default:
        return 'text-bg-secondary';
    }
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', meeting: this.meeting });
  }
}
