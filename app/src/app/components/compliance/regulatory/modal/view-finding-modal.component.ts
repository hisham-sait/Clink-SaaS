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
      <h5 class="modal-title">View Finding</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Finding Details</h6>
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
          <div class="col-md-4">
            <label class="form-label text-muted small">Identified Date</label>
            <p class="mb-0">{{ formatDate(finding.identifiedDate) }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Due Date</label>
            <p class="mb-0">{{ finding.dueDate ? formatDate(finding.dueDate) : 'Not set' }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Closed Date</label>
            <p class="mb-0">{{ finding.closedDate ? formatDate(finding.closedDate) : 'Not closed' }}</p>
          </div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Assignment</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Assigned To</label>
            <p class="mb-0">{{ finding.assignedTo || 'Unassigned' }}</p>
          </div>
        </div>
      </div>

      <!-- Remediation -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Remediation Plan</h6>
        <div class="row g-3">
          <div class="col-12">
            <p class="mb-0">{{ finding.remediation || 'No remediation plan provided' }}</p>
          </div>
        </div>
      </div>

      <!-- Evidence -->
      <div class="mb-4" *ngIf="finding.evidence?.length">
        <h6 class="text-primary mb-3">Evidence</h6>
        <div class="list-group">
          <div *ngFor="let item of finding.evidence" class="list-group-item">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-text me-2"></i>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Timeline -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Progress Timeline</h6>
        <div class="position-relative">
          <!-- Timeline Line -->
          <div class="position-absolute h-100" style="width: 2px; background-color: #e9ecef; left: 7px; top: 10px;"></div>
          
          <!-- Timeline Events -->
          <div class="d-flex align-items-start mb-3 position-relative">
            <div class="rounded-circle bg-primary" style="width: 16px; height: 16px;"></div>
            <div class="ms-3">
              <p class="mb-0"><strong>Finding Identified</strong></p>
              <small class="text-muted">{{ formatDate(finding.identifiedDate) }}</small>
            </div>
          </div>

          <div *ngIf="finding.dueDate" class="d-flex align-items-start mb-3 position-relative">
            <div class="rounded-circle bg-warning" style="width: 16px; height: 16px;"></div>
            <div class="ms-3">
              <p class="mb-0"><strong>Due Date Set</strong></p>
              <small class="text-muted">{{ formatDate(finding.dueDate) }}</small>
            </div>
          </div>

          <div *ngIf="finding.closedDate" class="d-flex align-items-start mb-3 position-relative">
            <div class="rounded-circle bg-success" style="width: 16px; height: 16px;"></div>
            <div class="ms-3">
              <p class="mb-0"><strong>Finding Closed</strong></p>
              <small class="text-muted">{{ formatDate(finding.closedDate) }}</small>
            </div>
          </div>
        </div>
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
      'Closed': 'bg-success'
    };
    return classes[status] || 'bg-secondary';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', finding: this.finding });
  }
}
