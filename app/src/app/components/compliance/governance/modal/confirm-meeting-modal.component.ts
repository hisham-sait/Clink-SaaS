import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting } from '../../compliance.types';

@Component({
  selector: 'app-confirm-meeting-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">{{title}}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Meeting Info -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-content-between align-items-start">
                  <span class="small fw-medium">{{meeting.type}} Meeting</span>
                  <span [class]="'badge ' + getStatusClass(meeting.status)">{{meeting.status}}</span>
                </div>
                <small class="text-muted">{{meeting.date | date:'mediumDate'}} at {{meeting.time}}</small>
                <small class="text-muted" *ngIf="meeting.location">
                  <i class="bi bi-geo-alt me-1"></i>{{meeting.location}}
                </small>
                <small class="text-muted" *ngIf="meeting.virtualLink">
                  <i class="bi bi-camera-video me-1"></i>Virtual Meeting
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Confirmation Message -->
        <div class="col-12">
          <p class="mb-0 small" [class.text-danger]="action === 'cancel'">
            <i [class]="getActionIcon()"></i>
            {{getMessage()}}
          </p>
        </div>

        <!-- Notes -->
        <div class="col-12">
          <textarea 
            class="form-control form-control-sm" 
            rows="2" 
            placeholder="Additional Notes (optional)"
            [(ngModel)]="notes">
          </textarea>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" [class]="'btn btn-sm ' + getButtonClass()" (click)="confirm()">
        {{getButtonText()}}
      </button>
    </div>
  `
})
export class ConfirmMeetingModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() action!: 'cancel' | 'complete';

  notes: string = '';

  constructor(public activeModal: NgbActiveModal) {}

  get title(): string {
    return this.action === 'cancel' ? 'Cancel Meeting' : 'Complete Meeting';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getActionIcon(): string {
    return this.action === 'cancel' 
      ? 'bi bi-x-circle me-2 text-danger'
      : 'bi bi-check-circle me-2 text-success';
  }

  getMessage(): string {
    if (this.action === 'cancel') {
      return 'Are you sure you want to cancel this meeting? This action cannot be undone.';
    }
    return 'Are you sure you want to mark this meeting as completed? This will finalize all meeting records.';
  }

  getButtonClass(): string {
    return this.action === 'cancel' ? 'btn-danger' : 'btn-success';
  }

  getButtonText(): string {
    return this.action === 'cancel' ? 'Cancel Meeting' : 'Complete Meeting';
  }

  confirm(): void {
    const result = {
      action: this.action,
      meeting: {
        ...this.meeting,
        status: this.action === 'cancel' ? 'Cancelled' : 'Completed',
        notes: this.notes ? (this.meeting.notes ? `${this.meeting.notes}\n${this.notes}` : this.notes) : this.meeting.notes
      }
    };
    this.activeModal.close(result);
  }
}
