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
  selector: 'app-view-document-modal',
  standalone: true,
  imports: [CommonModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Document Details</h5>
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

        <!-- Document Header -->
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="fw-bold mb-0">{{document.title}}</h6>
              <small class="text-muted">{{document.type}}</small>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-sm btn-outline-primary" (click)="onDownload()">
                <i class="bi bi-download me-1"></i>Download
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary" (click)="onPreview()">
                <i class="bi bi-eye me-1"></i>Preview
              </button>
            </div>
          </div>
        </div>

        <!-- Document Info -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="row g-2">
                <div class="col-md-6">
                  <small class="text-muted d-block">Version</small>
                  <span class="small">{{document.version}}</span>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">Author</small>
                  <span class="small">{{document.author}}</span>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">Upload Date</small>
                  <span class="small">{{document.uploadDate | date:'medium'}}</span>
                </div>
                <div class="col-md-6">
                  <small class="text-muted d-block">Size</small>
                  <span class="small">{{formatFileSize(document.size)}}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description -->
        <div class="col-12" *ngIf="document.description">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-1">Description</small>
              <p class="small mb-0">{{document.description}}</p>
            </div>
          </div>
        </div>

        <!-- Tags -->
        <div class="col-12" *ngIf="document.tags?.length">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Tags</small>
              <div class="d-flex flex-wrap gap-1">
                <span class="badge bg-secondary" *ngFor="let tag of document.tags">{{tag}}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Version History -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Version History</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let version of versionHistory">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <span class="small fw-medium">Version {{version.version}}</span>
                      <small class="text-muted d-block">{{version.uploadDate | date:'medium'}}</small>
                    </div>
                    <button type="button" class="btn btn-link btn-sm p-0" (click)="onViewVersion(version)">
                      View
                    </button>
                  </div>
                  <small class="text-muted d-block mt-1">{{version.changes}}</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Documents -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <small class="text-muted d-block mb-2">Related Documents</small>
              <div class="list-group list-group-flush">
                <div class="list-group-item px-0 py-2" *ngFor="let doc of relatedDocuments">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <i [class]="getDocumentIcon(doc.type)"></i>
                      <div>
                        <span class="small">{{doc.title}}</span>
                        <small class="text-muted d-block">{{doc.type}}</small>
                      </div>
                    </div>
                    <button type="button" class="btn btn-link btn-sm p-0" (click)="onViewDocument(doc)">
                      View
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class ViewDocumentModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  // Simulated data - in a real app, this would come from the backend
  versionHistory = [
    {
      version: '1.0',
      uploadDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      changes: 'Initial version'
    },
    {
      version: '1.1',
      uploadDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      changes: 'Updated formatting and fixed typos'
    },
    {
      version: '1.2',
      uploadDate: new Date().toISOString(),
      changes: 'Added executive summary'
    }
  ];

  relatedDocuments = [
    {
      id: '1',
      type: 'Agenda',
      title: 'Meeting Agenda',
      uploadDate: new Date().toISOString()
    },
    {
      id: '2',
      type: 'Presentation',
      title: 'Q2 Performance Review',
      uploadDate: new Date().toISOString()
    }
  ];

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

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Agenda': 'bi bi-list-check text-primary',
      'Minutes': 'bi bi-file-text text-success',
      'Presentation': 'bi bi-easel text-info',
      'Report': 'bi bi-file-earmark-bar-graph text-warning',
      'Supporting Material': 'bi bi-folder text-secondary'
    };
    return icons[type] || 'bi bi-file text-secondary';
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

  onPreview(): void {
    // In a real app, this would open a preview window/modal
    console.log('Previewing:', this.document.path);
  }

  onViewVersion(version: any): void {
    // In a real app, this would show the specific version
    console.log('Viewing version:', version);
  }

  onViewDocument(doc: any): void {
    // In a real app, this would open the related document
    console.log('Viewing document:', doc);
  }
}
