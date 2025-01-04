import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BoardMinute } from '../../statutory.types';

@Component({
  selector: 'app-view-board-minute-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Board Meeting Details</h5>
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
              <label class="form-label small text-muted">Minute ID</label>
              <div class="form-control-plaintext">{{ minute.minuteId }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Date</label>
              <div class="form-control-plaintext">{{ formatDate(minute.meetingDate) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + getStatusClass(minute.status)">
                  {{ minute.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Time and Venue -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Schedule & Location</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Start Time</label>
              <div class="form-control-plaintext">{{ formatTime(minute.startTime) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">End Time</label>
              <div class="form-control-plaintext">{{ formatTime(minute.endTime) }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Venue</label>
              <div class="form-control-plaintext">{{ minute.venue }}</div>
            </div>
          </div>
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
              <div class="form-control-plaintext">{{ minute.chairperson }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Attendees</label>
              <div class="form-control-plaintext">
                <ul class="list-unstyled mb-0">
                  <li *ngFor="let attendee of minute.attendees">{{ attendee }}</li>
                </ul>
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
          
          <div class="form-control-plaintext">{{ minute.agenda }}</div>
        </div>

        <!-- Discussions -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Discussions</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="list-group">
            <div class="list-group-item" *ngFor="let discussion of minute.discussions">
              <h6 class="mb-2">{{ discussion.topic }}</h6>
              <p class="mb-3">{{ discussion.details }}</p>

              <!-- Decisions -->
              <div class="mb-3" *ngIf="discussion.decisions?.length">
                <div class="small text-muted mb-2">Decisions:</div>
                <ul class="mb-0">
                  <li *ngFor="let decision of discussion.decisions">{{ decision }}</li>
                </ul>
              </div>

              <!-- Action Items -->
              <div *ngIf="discussion.actionItems?.length">
                <div class="small text-muted mb-2">Action Items:</div>
                <div class="table-responsive">
                  <table class="table table-sm table-bordered mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Task</th>
                        <th>Assignee</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let item of discussion.actionItems">
                        <td>{{ item.task }}</td>
                        <td>{{ item.assignee }}</td>
                        <td>{{ formatDate(item.dueDate) }}</td>
                        <td>
                          <span [class]="'badge ' + getActionStatusClass(item.status)">
                            {{ item.status }}
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

        <!-- Resolutions -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Resolutions</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="list-group">
            <div class="list-group-item" *ngFor="let resolution of minute.resolutions">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="mb-0">{{ resolution.title }}</h6>
                <span [class]="'badge ' + getResolutionOutcomeClass(resolution.outcome)">
                  {{ resolution.outcome }}
                </span>
              </div>
              <p class="mb-2">{{ resolution.description }}</p>
              <div class="small text-muted">
                Proposed by {{ resolution.proposedBy }}, 
                Seconded by {{ resolution.secondedBy }}
              </div>
            </div>
          </div>
        </div>

        <!-- Minutes -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Minutes</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ minute.minutes }}</div>
        </div>

        <!-- Notes -->
        <div class="col-12" *ngIf="minute.notes">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Additional Notes</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="form-control-plaintext">{{ minute.notes }}</div>
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
export class ViewBoardMinuteModalComponent {
  @Input() minute!: BoardMinute;

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

  getActionStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'text-bg-success';
      case 'In Progress':
        return 'text-bg-warning';
      case 'Pending':
        return 'text-bg-secondary';
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
      case 'Deferred':
        return 'text-bg-warning';
      default:
        return 'text-bg-secondary';
    }
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', minute: this.minute });
  }
}
