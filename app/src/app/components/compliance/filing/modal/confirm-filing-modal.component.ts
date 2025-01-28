import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirm-filing-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">{{ title }}</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <div class="d-flex gap-3 align-items-start">
        <i [class]="'bi ' + icon + ' fs-4 text-' + iconClass"></i>
        <div>
          <p class="mb-0">{{ message }}</p>
          <small class="text-muted" *ngIf="detail">{{ detail }}</small>
        </div>
      </div>

      <!-- Additional Warning for Active Filings -->
      <div class="alert alert-warning mt-3" *ngIf="showActiveWarning">
        <i class="bi bi-exclamation-triangle-fill me-2"></i>
        <span>This filing is currently active and pending submission. Removing it may affect compliance tracking and reporting.</span>
      </div>

      <!-- Regulatory Warning -->
      <div class="alert alert-warning mt-3" *ngIf="showRegulatoryWarning">
        <i class="bi bi-shield-exclamation me-2"></i>
        <span>This is a regulatory filing. Removing it may affect your organization's compliance status and reporting obligations.</span>
      </div>

      <!-- Impact Information -->
      <div class="alert alert-info mt-3" *ngIf="showImpactInfo">
        <i class="bi bi-info-circle-fill me-2"></i>
        <span>This action will also remove:</span>
        <ul class="mb-0 mt-2">
          <li>All associated documents and attachments</li>
          <li>Filing history and audit trail</li>
          <li>Comments and communications</li>
          <li>Reminders and notifications</li>
          <li>Related compliance records</li>
        </ul>
      </div>

      <!-- Submission Warning -->
      <div class="alert alert-danger mt-3" *ngIf="showSubmissionWarning">
        <i class="bi bi-exclamation-octagon-fill me-2"></i>
        <span>This filing has already been submitted to the relevant authority. Removing it:</span>
        <ul class="mb-0 mt-2">
          <li>Does not withdraw the submission from the authority</li>
          <li>May affect your ability to track the submission status</li>
          <li>Could impact future amendments or corrections</li>
        </ul>
      </div>

      <!-- Deadline Warning -->
      <div class="alert alert-danger mt-3" *ngIf="showDeadlineWarning">
        <i class="bi bi-calendar-x-fill me-2"></i>
        <span>This filing has an upcoming deadline. Removing it may result in:</span>
        <ul class="mb-0 mt-2">
          <li>Missing regulatory deadlines</li>
          <li>Potential penalties or fines</li>
          <li>Non-compliance with reporting requirements</li>
        </ul>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">
        {{ cancelButtonText }}
      </button>
      <button 
        type="button" 
        [class]="'btn btn-' + confirmButtonClass"
        (click)="activeModal.close(true)"
      >
        {{ confirmButtonText }}
      </button>
    </div>
  `
})
export class ConfirmFilingModalComponent {
  @Input() title: string = 'Confirm Action';
  @Input() message: string = 'Are you sure you want to proceed?';
  @Input() detail?: string;
  @Input() icon: string = 'bi-exclamation-triangle-fill';
  @Input() iconClass: string = 'warning';
  @Input() confirmButtonText: string = 'Confirm';
  @Input() confirmButtonClass: string = 'primary';
  @Input() cancelButtonText: string = 'Cancel';
  @Input() showActiveWarning: boolean = false;
  @Input() showRegulatoryWarning: boolean = false;
  @Input() showImpactInfo: boolean = false;
  @Input() showSubmissionWarning: boolean = false;
  @Input() showDeadlineWarning: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}
}
