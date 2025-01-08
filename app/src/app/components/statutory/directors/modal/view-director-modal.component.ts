import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { Director } from '../../statutory.types';

@Component({
  selector: 'app-view-director-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Director Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="row g-3">
        <!-- Company Information -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Company Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-12">
              <label class="form-label small text-muted">Company</label>
              <div class="form-control-plaintext">{{ director.company?.name || 'Not assigned' }}</div>
            </div>
          </div>
        </div>

        <!-- Personal Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Personal Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small text-muted">Full Name</label>
              <div class="form-control-plaintext">{{ director.title }} {{ director.firstName }} {{ director.lastName }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Date of Birth</label>
              <div class="form-control-plaintext">{{ formatDate(director.dateOfBirth) }}</div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted">Nationality</label>
              <div class="form-control-plaintext">{{ director.nationality }}</div>
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Address</label>
              <div class="form-control-plaintext">{{ director.address }}</div>
            </div>
          </div>
        </div>

        <!-- Professional Details -->
        <div class="col-12">
          <div class="d-flex align-items-center gap-2 mb-3">
            <h6 class="fw-bold mb-0">Professional Information</h6>
            <div class="border-bottom flex-grow-1"></div>
          </div>
          
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label small text-muted">Director Type</label>
              <div class="form-control-plaintext">{{ director.directorType }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Occupation</label>
              <div class="form-control-plaintext">{{ director.occupation }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small text-muted">Status</label>
              <div class="form-control-plaintext">
                <span [class]="'badge ' + (director.status === 'Active' ? 'text-bg-success' : 'text-bg-secondary')">
                  {{ director.status }}
                </span>
              </div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Appointment Date</label>
              <div class="form-control-plaintext">{{ formatDate(director.appointmentDate) }}</div>
            </div>
            <div class="col-md-6">
              <label class="form-label small text-muted">Shareholding</label>
              <div class="form-control-plaintext">{{ director.shareholding || 'None' }}</div>
            </div>
            <div class="col-12">
              <label class="form-label small text-muted">Other Directorships</label>
              <div class="form-control-plaintext">{{ director.otherDirectorships || 'None' }}</div>
            </div>
          </div>
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
export class ViewDirectorModalComponent {
  @Input() director!: Director;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB');
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', director: this.director });
  }
}
