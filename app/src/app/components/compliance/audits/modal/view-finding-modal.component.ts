import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Finding } from './../../compliance.types';

@Component({
  selector: 'app-view-finding-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View Finding Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Title</label>
            <p class="mb-0">{{ finding.title }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ finding.description }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Severity</label>
            <div>
              <span [class]="'badge ' + getSeverityClass(finding.severity)">
                {{ finding.severity }}
              </span>
            </div>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Status</label>
            <div>
              <span [class]="'badge ' + getStatusClass(finding.status)">
                {{ finding.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Timeline</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Identified Date</label>
            <p class="mb-0">{{ formatDate(finding.identifiedDate) }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Target Resolution Date</label>
            <p class="mb-0">{{ formatDate(finding.targetResolutionDate) }}</p>
          </div>

          <div class="col-12" *ngIf="finding.actualResolutionDate">
            <label class="form-label text-muted small">Actual Resolution Date</label>
            <p class="mb-0">{{ formatDate(finding.actualResolutionDate) }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Time to Resolution</label>
            <p class="mb-0">
              {{ 
                finding.actualResolutionDate ? 
                calculateDuration(finding.identifiedDate, finding.actualResolutionDate) :
                'Not yet resolved'
              }}
            </p>
          </div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Assignment</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Assigned To</label>
            <p class="mb-0">{{ finding.assignedTo }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Remediation Plan</label>
            <p class="mb-0">{{ finding.remediation }}</p>
          </div>
        </div>
      </div>

      <!-- Evidence -->
      <div>
        <h6 class="text-primary mb-3">Evidence</h6>
        <ul class="list-unstyled mb-0" *ngIf="finding.evidence?.length; else noEvidence">
          <li *ngFor="let item of finding.evidence" class="mb-2">
            <i class="bi bi-check-circle-fill text-success me-2"></i>
            {{ item }}
          </li>
        </ul>
        <ng-template #noEvidence>
          <p class="text-muted mb-0">No evidence recorded</p>
        </ng-template>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">Edit</button>
    </div>
  `
})
export class ViewFindingModalComponent {
  @Input() finding!: Finding;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  calculateDuration(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} days`;
  }

  getSeverityClass(severity: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-danger'
    };
    return classes[severity] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Open': 'bg-danger',
      'In Progress': 'bg-warning',
      'Resolved': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', finding: this.finding });
  }
}
