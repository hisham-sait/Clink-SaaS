import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing } from './../../compliance.types';

@Component({
  selector: 'app-view-filing-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">View Filing Details</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body">
      <!-- Basic Information -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Basic Information</h6>
        <div class="row g-3">
          <div class="col-12">
            <label class="form-label text-muted small">Title</label>
            <p class="mb-0">{{ filing.title }}</p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Description</label>
            <p class="mb-0">{{ filing.description }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Authority</label>
            <p class="mb-0">{{ filing.authority }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Reference Number</label>
            <p class="mb-0">{{ filing.referenceNumber || 'Not assigned' }}</p>
          </div>
        </div>
      </div>

      <!-- Filing Details -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Filing Details</h6>
        <div class="row g-3">
          <div class="col-md-4">
            <label class="form-label text-muted small">Type</label>
            <p class="mb-0">{{ filing.type }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Frequency</label>
            <p class="mb-0">{{ filing.frequency }}</p>
          </div>

          <div class="col-md-4">
            <label class="form-label text-muted small">Priority</label>
            <div>
              <span [class]="'badge ' + getPriorityClass(filing.priority)">
                {{ filing.priority }}
              </span>
            </div>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Status</label>
            <div>
              <span [class]="'badge ' + getStatusClass(filing.status)">
                {{ filing.status }}
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
            <label class="form-label text-muted small">Due Date</label>
            <p class="mb-0">{{ formatDate(filing.dueDate) }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Time Remaining</label>
            <p [class]="'mb-0 ' + getTimeRemainingClass(filing.dueDate)">
              {{ calculateTimeRemaining(filing.dueDate) }}
            </p>
          </div>

          <div class="col-12">
            <label class="form-label text-muted small">Period</label>
            <p class="mb-0">{{ formatDate(filing.period.start) }} - {{ formatDate(filing.period.end) }}</p>
          </div>
        </div>
      </div>

      <!-- Assignment -->
      <div class="mb-4">
        <h6 class="text-primary mb-3">Assignment</h6>
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label text-muted small">Assigned To</label>
            <p class="mb-0">{{ filing.assignedTo }}</p>
          </div>

          <div class="col-md-6">
            <label class="form-label text-muted small">Reviewer</label>
            <p class="mb-0">{{ filing.reviewedBy || 'Not assigned' }}</p>
          </div>
        </div>
      </div>

      <!-- Submission Details -->
      <div class="mb-4" *ngIf="filing.submissionDate || filing.acceptanceDate">
        <h6 class="text-primary mb-3">Submission Details</h6>
        <div class="row g-3">
          <div class="col-md-6" *ngIf="filing.submissionDate">
            <label class="form-label text-muted small">Submission Date</label>
            <p class="mb-0">{{ formatDate(filing.submissionDate) }}</p>
          </div>

          <div class="col-md-6" *ngIf="filing.acceptanceDate">
            <label class="form-label text-muted small">Acceptance Date</label>
            <p class="mb-0">{{ formatDate(filing.acceptanceDate) }}</p>
          </div>
        </div>
      </div>

      <!-- Documents -->
      <div class="mb-4" *ngIf="filing.documents?.length">
        <h6 class="text-primary mb-3">Documents</h6>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let doc of filing.documents">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <i [class]="'bi ' + getDocumentIcon(doc.type) + ' text-primary me-2'"></i>
                {{ doc.title }}
                <span [class]="'badge ms-2 ' + getDocumentStatusClass(doc.status)">
                  {{ doc.status }}
                </span>
              </div>
              <small class="text-muted">{{ formatDate(doc.uploadDate) }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments -->
      <div *ngIf="filing.comments?.length">
        <h6 class="text-primary mb-3">Comments</h6>
        <div class="list-group">
          <div class="list-group-item" *ngFor="let comment of filing.comments">
            <div class="d-flex justify-content-between align-items-start mb-1">
              <span class="fw-medium">{{ comment.createdBy }}</span>
              <small class="text-muted">{{ formatDate(comment.createdAt) }}</small>
            </div>
            <p class="mb-0">{{ comment.content }}</p>
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
export class ViewFilingModalComponent {
  @Input() filing!: Filing;

  constructor(public activeModal: NgbActiveModal) {}

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'Low': 'bg-success',
      'Medium': 'bg-warning',
      'High': 'bg-danger',
      'Critical': 'bg-danger'
    };
    return classes[priority] || 'bg-secondary';
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Draft': 'bg-secondary',
      'Pending Review': 'bg-info',
      'Submitted': 'bg-primary',
      'Accepted': 'bg-success',
      'Rejected': 'bg-danger',
      'Amended': 'bg-warning'
    };
    return classes[status] || 'bg-secondary';
  }

  getDocumentStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Draft': 'bg-secondary',
      'Final': 'bg-success',
      'Signed': 'bg-primary',
      'Submitted': 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'pdf': 'bi-file-pdf',
      'doc': 'bi-file-word',
      'xls': 'bi-file-excel',
      'image': 'bi-file-image'
    };
    return icons[type] || 'bi-file-text';
  }

  calculateTimeRemaining(dueDate: string): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  }

  getTimeRemainingClass(dueDate: string): string {
    const now = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-danger';
    if (diffDays <= 7) return 'text-warning';
    return 'text-success';
  }

  onEdit(): void {
    this.activeModal.close({ action: 'edit', filing: this.filing });
  }
}
