import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  selector: 'app-preview-document-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <div class="d-flex flex-column">
        <h5 class="modal-title fs-6 mb-0">{{document.title}}</h5>
        <small class="text-muted">{{document.type}} - Version {{document.version}}</small>
      </div>
      <div class="d-flex gap-2 align-items-center">
        <button type="button" class="btn btn-sm btn-outline-primary" (click)="onDownload()">
          <i class="bi bi-download"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="onPrint()">
          <i class="bi bi-printer"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="onFullscreen()">
          <i class="bi bi-arrows-fullscreen"></i>
        </button>
        <button type="button" class="btn-close ms-2" (click)="activeModal.dismiss()"></button>
      </div>
    </div>

    <div class="modal-body p-0">
      <div class="row g-0">
        <!-- Document Info Sidebar -->
        <div class="col-md-3 border-end">
          <div class="p-3">
            <!-- Meeting Info -->
            <div class="card bg-light mb-3">
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

            <!-- Document Details -->
            <div class="mb-3">
              <small class="text-muted d-block mb-1">Document Details</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2">
                  <small class="text-muted d-block">Author</small>
                  <span class="small">{{document.author}}</span>
                </div>
                <div class="list-group-item px-0 py-2">
                  <small class="text-muted d-block">Upload Date</small>
                  <span class="small">{{document.uploadDate | date:'medium'}}</span>
                </div>
                <div class="list-group-item px-0 py-2">
                  <small class="text-muted d-block">Size</small>
                  <span class="small">{{formatFileSize(document.size)}}</span>
                </div>
              </div>
            </div>

            <!-- Tags -->
            <div *ngIf="document.tags?.length" class="mb-3">
              <small class="text-muted d-block mb-2">Tags</small>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-secondary" *ngFor="let tag of document.tags">{{tag}}</span>
              </div>
            </div>

            <!-- Description -->
            <div *ngIf="document.description" class="mb-3">
              <small class="text-muted d-block mb-1">Description</small>
              <p class="small mb-0">{{document.description}}</p>
            </div>
          </div>
        </div>

        <!-- Document Preview -->
        <div class="col-md-9">
          <div class="document-preview-container" [class.fullscreen]="isFullscreen">
            <!-- Loading Indicator -->
            <div class="document-loading" *ngIf="isLoading">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <!-- Error Message -->
            <div class="document-error" *ngIf="hasError">
              <div class="text-center p-4">
                <i class="bi bi-exclamation-circle text-danger fs-1"></i>
                <p class="mt-3 mb-0">Unable to preview this document.</p>
                <small class="text-muted">Try downloading the file to view it.</small>
              </div>
            </div>

            <!-- Preview Frame -->
            <iframe *ngIf="!isLoading && !hasError"
                    [src]="previewUrl"
                    class="document-preview"
                    (load)="onPreviewLoad()"
                    (error)="onPreviewError()">
            </iframe>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `,
  styles: [`
    .document-preview-container {
      position: relative;
      height: 75vh;
      background-color: #f8f9fa;
    }

    .document-preview-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
    }

    .document-preview {
      width: 100%;
      height: 100%;
      border: none;
    }

    .document-loading,
    .document-error {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
    }
  `]
})
export class PreviewDocumentModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  previewUrl: SafeResourceUrl;
  isLoading = true;
  hasError = false;
  isFullscreen = false;

  constructor(
    public activeModal: NgbActiveModal,
    private sanitizer: DomSanitizer
  ) {
    // Initialize with a blank URL - will be set in ngOnInit
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl('about:blank');
  }

  ngOnInit(): void {
    // In a real app, this would be a URL to a document preview service
    // For now, we'll just use Google Docs Viewer as an example
    const previewServiceUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(this.document.path)}&embedded=true`;
    this.previewUrl = this.sanitizer.bypassSecurityTrustResourceUrl(previewServiceUrl);
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

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  onPreviewLoad(): void {
    this.isLoading = false;
    this.hasError = false;
  }

  onPreviewError(): void {
    this.isLoading = false;
    this.hasError = true;
  }

  onDownload(): void {
    // In a real app, this would trigger a file download
    console.log('Downloading:', this.document.path);
  }

  onPrint(): void {
    // In a real app, this would open the browser's print dialog
    const iframe = document.querySelector('iframe');
    if (iframe) {
      const iframeWindow = iframe.contentWindow;
      if (iframeWindow) {
        iframeWindow.print();
      }
    }
  }

  onFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  ngOnDestroy(): void {
    // Ensure body overflow is restored when modal is closed
    document.body.style.overflow = '';
  }
}
