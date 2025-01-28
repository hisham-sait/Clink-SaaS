import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CommitteeMeeting } from '../../compliance.types';

interface MeetingDocument {
  id: string;
  type: string;
  title: string;
  description?: string;
  version: string;
  author: string;
  uploadDate: string;
  size: number;
  tags: string[];
  path: string;
  meetingId: string;
}

@Component({
  selector: 'app-delete-document-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Delete Document</h5>
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
              </div>
            </div>
          </div>
        </div>

        <!-- Document Info -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex flex-column gap-2">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="small fw-medium">{{document.title}}</span>
                    <small class="text-muted d-block">{{document.type}}</small>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="onDownload()">
                    <i class="bi bi-download"></i>
                  </button>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">Version</small>
                  <span class="small">{{document.version}}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">Author</small>
                  <span class="small">{{document.author}}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">Upload Date</small>
                  <span class="small">{{document.uploadDate | date:'mediumDate'}}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-muted">Size</small>
                  <span class="small">{{formatFileSize(document.size)}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Warning -->
        <div class="col-12">
          <div class="alert alert-danger mb-0">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-exclamation-triangle-fill"></i>
              <strong>Warning</strong>
            </div>
            <p class="small mb-2">Are you sure you want to delete this document? This action cannot be undone.</p>
            <ul class="small mb-0">
              <li>The document will be permanently removed from the system</li>
              <li>All version history will be lost</li>
              <li>References to this document may become invalid</li>
            </ul>
          </div>
        </div>

        <!-- Related Documents -->
        <div class="col-12" *ngIf="document.tags?.length">
          <div class="alert alert-warning mb-0">
            <div class="d-flex align-items-center gap-2 mb-2">
              <i class="bi bi-info-circle-fill"></i>
              <strong>Related Documents</strong>
            </div>
            <p class="small mb-0">
              This document is tagged with: {{document.tags.join(', ')}}<br>
              Other documents with these tags may reference this document.
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
      <button type="button" class="btn btn-danger btn-sm" (click)="onConfirm()">
        Delete Document
      </button>
    </div>
  `
})
export class DeleteDocumentModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  constructor(public activeModal: NgbActiveModal) {}

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Scheduled': 'bg-info',
      'In Progress': 'bg-primary',
      'Completed': 'bg-success',
      'Cancelled': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onDownload(): void {
    // In a real app, this would trigger a file download
    console.log('Downloading:', this.document.path);
  }

  onConfirm(): void {
    const result = {
      meeting: this.meeting,
      document: this.document
    };
    this.activeModal.close(result);
  }
}
