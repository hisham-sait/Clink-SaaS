import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal, NgbModule, NgbNav, NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
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

interface DocumentVersion {
  version: string;
  uploadDate: string;
  author: string;
  size: number;
  changes: string;
  path: string;
}

interface DocumentShare {
  id: string;
  date: string;
  sharedBy: string;
  recipients: {
    name?: string;
    email: string;
    permission: string;
  }[];
  expiration?: string;
  status: 'Active' | 'Expired' | 'Revoked';
}

interface AccessLog {
  id: string;
  date: string;
  user: string;
  action: string;
  details?: string;
  ip?: string;
  userAgent?: string;
}

@Component({
  selector: 'app-document-history-modal',
  standalone: true,
  imports: [CommonModule, NgbModule, NgbNavModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Document History</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <div class="modal-body p-3">
      <div class="row g-3">
        <!-- Document Info -->
        <div class="col-12">
          <div class="card bg-light">
            <div class="card-body p-2">
              <div class="d-flex flex-column gap-1">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="small fw-medium">{{document.title}}</span>
                    <small class="text-muted d-block">{{document.type}} - Version {{document.version}}</small>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="onPreview()">
                    <i class="bi bi-eye"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- History Tabs -->
        <div class="col-12">
          <ul ngbNav #nav="ngbNav" [(activeId)]="activeTab" class="nav-tabs">
            <li [ngbNavItem]="'versions'">
              <a ngbNavLink class="small">Versions</a>
              <ng-template ngbNavContent>
                <div class="list-group list-group-flush">
                  <div class="list-group-item px-0 py-2" *ngFor="let version of versions">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <span class="small fw-medium">Version {{version.version}}</span>
                        <small class="text-muted d-block">{{version.uploadDate | date:'medium'}}</small>
                      </div>
                      <div class="d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-outline-primary" (click)="onPreviewVersion(version)">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" (click)="onDownloadVersion(version)">
                          <i class="bi bi-download"></i>
                        </button>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="text-muted">Author</small>
                      <span class="small">{{version.author}}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <small class="text-muted">Size</small>
                      <span class="small">{{formatFileSize(version.size)}}</span>
                    </div>
                    <small class="text-muted d-block mt-2">Changes</small>
                    <p class="small mb-0">{{version.changes}}</p>
                  </div>
                </div>
              </ng-template>
            </li>
            <li [ngbNavItem]="'shares'">
              <a ngbNavLink class="small">Shares</a>
              <ng-template ngbNavContent>
                <div class="list-group list-group-flush">
                  <div class="list-group-item px-0 py-2" *ngFor="let share of shares">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <span class="small fw-medium">Shared by {{share.sharedBy}}</span>
                        <small class="text-muted d-block">{{share.date | date:'medium'}}</small>
                      </div>
                      <span [class]="'badge ' + getShareStatusClass(share.status)">{{share.status}}</span>
                    </div>
                    <div class="mb-2">
                      <small class="text-muted d-block mb-1">Recipients</small>
                      <div class="list-group list-group-flush">
                        <div class="list-group-item px-0 py-1" *ngFor="let recipient of share.recipients">
                          <div class="d-flex justify-content-between align-items-center">
                            <div>
                              <span class="small">{{recipient.name || recipient.email}}</span>
                              <small class="text-muted d-block" *ngIf="recipient.name">{{recipient.email}}</small>
                            </div>
                            <span class="badge bg-secondary">{{recipient.permission}}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center" *ngIf="share.expiration">
                      <small class="text-muted">Expires</small>
                      <span class="small">{{share.expiration | date:'mediumDate'}}</span>
                    </div>
                    <div class="mt-2" *ngIf="share.status === 'Active'">
                      <button type="button" class="btn btn-sm btn-outline-danger" (click)="onRevokeShare(share)">
                        Revoke Access
                      </button>
                    </div>
                  </div>
                </div>
              </ng-template>
            </li>
            <li [ngbNavItem]="'access'">
              <a ngbNavLink class="small">Access Logs</a>
              <ng-template ngbNavContent>
                <div class="list-group list-group-flush">
                  <div class="list-group-item px-0 py-2" *ngFor="let log of accessLogs">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                      <div>
                        <span class="small fw-medium">{{log.user}}</span>
                        <small class="text-muted d-block">{{log.date | date:'medium'}}</small>
                      </div>
                      <span class="badge bg-secondary">{{log.action}}</span>
                    </div>
                    <p class="small mb-1" *ngIf="log.details">{{log.details}}</p>
                    <div class="d-flex justify-content-between align-items-center text-muted">
                      <small>{{log.ip}}</small>
                      <small>{{log.userAgent}}</small>
                    </div>
                  </div>
                </div>
              </ng-template>
            </li>
          </ul>
          <div [ngbNavOutlet]="nav" class="mt-2"></div>
        </div>
      </div>
    </div>

    <div class="modal-footer py-2">
      <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Close</button>
    </div>
  `
})
export class DocumentHistoryModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  activeTab = 'versions';

  // Simulated data - in a real app, this would come from a service
  versions: DocumentVersion[] = [
    {
      version: '1.2',
      uploadDate: new Date().toISOString(),
      author: 'John Smith',
      size: 2500000,
      changes: 'Added executive summary',
      path: '/documents/v1.2/doc.pdf'
    },
    {
      version: '1.1',
      uploadDate: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      author: 'John Smith',
      size: 2400000,
      changes: 'Updated formatting and fixed typos',
      path: '/documents/v1.1/doc.pdf'
    },
    {
      version: '1.0',
      uploadDate: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      author: 'John Smith',
      size: 2300000,
      changes: 'Initial version',
      path: '/documents/v1.0/doc.pdf'
    }
  ];

  shares: DocumentShare[] = [
    {
      id: '1',
      date: new Date().toISOString(),
      sharedBy: 'John Smith',
      recipients: [
        { name: 'Jane Doe', email: 'jane@example.com', permission: 'view' },
        { name: 'Mike Johnson', email: 'mike@example.com', permission: 'comment' }
      ],
      expiration: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      status: 'Active'
    },
    {
      id: '2',
      date: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
      sharedBy: 'John Smith',
      recipients: [
        { email: 'external@example.com', permission: 'view' }
      ],
      expiration: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
      status: 'Expired'
    }
  ];

  accessLogs: AccessLog[] = [
    {
      id: '1',
      date: new Date().toISOString(),
      user: 'Jane Doe',
      action: 'View',
      ip: '192.168.1.100',
      userAgent: 'Chrome/Windows'
    },
    {
      id: '2',
      date: new Date(new Date().setHours(new Date().getHours() - 2)).toISOString(),
      user: 'Mike Johnson',
      action: 'Download',
      details: 'Downloaded version 1.2',
      ip: '192.168.1.101',
      userAgent: 'Firefox/Mac'
    },
    {
      id: '3',
      date: new Date(new Date().setHours(new Date().getHours() - 4)).toISOString(),
      user: 'John Smith',
      action: 'Share',
      details: 'Shared with 2 users',
      ip: '192.168.1.102',
      userAgent: 'Safari/Mac'
    }
  ];

  constructor(public activeModal: NgbActiveModal) {}

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getShareStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'Active': 'bg-success',
      'Expired': 'bg-warning',
      'Revoked': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  onPreview(): void {
    // In a real app, this would open the preview modal
    console.log('Previewing current version:', this.document.path);
  }

  onPreviewVersion(version: DocumentVersion): void {
    // In a real app, this would open the preview modal
    console.log('Previewing version:', version.path);
  }

  onDownloadVersion(version: DocumentVersion): void {
    // In a real app, this would trigger a file download
    console.log('Downloading version:', version.path);
  }

  onRevokeShare(share: DocumentShare): void {
    // In a real app, this would call a service to revoke access
    console.log('Revoking share:', share.id);
    share.status = 'Revoked';
  }
}
