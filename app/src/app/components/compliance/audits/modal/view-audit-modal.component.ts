import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Audit, Finding } from './../../compliance.types';

@Component({
  selector: 'app-view-audit-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View Audit Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Title</label>
            <p class="mb-0">{{ audit.title }}</p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Company</label>
            <p class="mb-0">{{ audit.company?.name }}</p>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ audit.description }}</p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Type</label>
            <p class="mb-0">{{ audit.type }}</p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Status</label>
            <span [class]="'badge ' + getStatusClass(audit.status)">{{ audit.status }}</span>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Timeline</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Start Date</label>
            <p class="mb-0">{{ formatDate(audit.startDate) }}</p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">End Date</label>
            <p class="mb-0">{{ formatDate(audit.endDate) }}</p>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small">Duration</label>
            <p class="mb-0">{{ calculateDuration(audit.startDate, audit.endDate) }}</p>
          </div>
        </div>
      </div>

      <!-- Audit Details -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Audit Details</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Department</label>
            <p class="mb-0">{{ audit.department }}</p>
          </div>
          <div class="col-md-6">
            <label class="form-label text-muted small">Auditor</label>
            <p class="mb-0">{{ audit.auditor }}</p>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small">Scope</label>
            <p class="mb-0">{{ audit.scope }}</p>
          </div>
          <div class="col-12">
            <label class="form-label text-muted small">Methodology</label>
            <p class="mb-0">{{ audit.methodology }}</p>
          </div>
        </div>
      </div>

      <!-- Findings -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Findings</h6>
        <div class="table-responsive">
          <table class="table table-sm" *ngIf="audit.findings?.length; else noFindings">
            <thead class="table-light">
              <tr>
                <th>Title</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Target Resolution</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let finding of audit.findings">
                <td>{{ finding.title }}</td>
                <td>
                  <span [class]="'badge ' + getSeverityClass(finding.severity)">
                    {{ finding.severity }}
                  </span>
                </td>
                <td>
                  <span [class]="'badge ' + getFindingStatusClass(finding.status)">
                    {{ finding.status }}
                  </span>
                </td>
                <td>{{ formatDate(finding.targetResolutionDate) }}</td>
              </tr>
            </tbody>
          </table>
          <ng-template #noFindings>
            <p class="text-muted mb-0">No findings recorded</p>
          </ng-template>
        </div>
      </div>

      <!-- Recommendations -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Recommendations</h6>
        <ul class="list-unstyled mb-0" *ngIf="audit.recommendations?.length; else noRecommendations">
          <li *ngFor="let recommendation of audit.recommendations" class="mb-2">
            <i class="bi bi-arrow-right-circle-fill text-primary me-2"></i>
            {{ recommendation }}
          </li>
        </ul>
        <ng-template #noRecommendations>
          <p class="text-muted mb-0">No recommendations provided</p>
        </ng-template>
      </div>

      <!-- Attachments -->
      <div>
        <h6 class="text-primary mb-3">Attachments</h6>
        <ul class="list-unstyled mb-0" *ngIf="audit.attachments?.length; else noAttachments">
          <li *ngFor="let attachment of audit.attachments" class="mb-2">
            <i class="bi bi-paperclip text-primary me-2"></i>
            {{ attachment }}
          </li>
        </ul>
        <ng-template #noAttachments>
          <p class="text-muted mb-0">No attachments uploaded</p>
        </ng-template>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Close</button>
      <button type="button" class="btn btn-primary" (click)="onEdit()">Edit</button>
    </div>
  `
})
export class ViewAuditModalComponent {
  @Input() audit!: Audit;

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

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Reviewed': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
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

  getFindingStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Open': 'bg-danger',
      'In Progress': 'bg-warning',
      'Resolved': 'bg-success',
      'Closed': 'bg-secondary'
    };
    return classes[status] || 'bg-secondary';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', audit: this.audit });
  }
}
