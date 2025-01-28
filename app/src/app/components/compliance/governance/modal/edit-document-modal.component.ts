import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'app-edit-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header py-2">
      <h5 class="modal-title fs-6">Edit Document</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
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

          <!-- Current Document -->
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <small class="text-muted d-block">Current File</small>
                    <span class="small">{{document.path.split('/').pop()}}</span>
                  </div>
                  <button type="button" class="btn btn-sm btn-outline-primary" (click)="onDownload()">
                    <i class="bi bi-download"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Document Type -->
          <div class="col-12">
            <select class="form-select form-select-sm" formControlName="type">
              <option value="">Select Document Type</option>
              <option value="Agenda">Agenda</option>
              <option value="Minutes">Minutes</option>
              <option value="Presentation">Presentation</option>
              <option value="Report">Report</option>
              <option value="Supporting Material">Supporting Material</option>
              <option value="Other">Other</option>
            </select>
            <div class="invalid-feedback" [class.d-block]="documentForm.get('type')?.touched && documentForm.get('type')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Title -->
          <div class="col-12">
            <input type="text" class="form-control form-control-sm" 
                   placeholder="Document Title"
                   formControlName="title">
            <div class="invalid-feedback" [class.d-block]="documentForm.get('title')?.touched && documentForm.get('title')?.errors?.['required']">
              Required
            </div>
          </div>

          <!-- Description -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" 
                      rows="2" 
                      placeholder="Document Description"
                      formControlName="description">
            </textarea>
          </div>

          <!-- New Version -->
          <div class="col-12">
            <div class="card bg-light">
              <div class="card-body p-2">
                <div class="d-flex flex-column gap-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Upload New Version</small>
                    <small class="text-muted">Max size: 10MB</small>
                  </div>
                  <input type="file" class="form-control form-control-sm" 
                         (change)="onFileSelected($event)"
                         accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx">
                  <div class="invalid-feedback" [class.d-block]="!isFileValid">
                    Please select a valid file (PDF, Word, Excel, PowerPoint) under 10MB
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Version Info -->
          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" 
                   placeholder="Version (e.g., 1.1)"
                   formControlName="version">
          </div>

          <!-- Author -->
          <div class="col-md-6">
            <input type="text" class="form-control form-control-sm" 
                   placeholder="Author"
                   formControlName="author">
          </div>

          <!-- Tags -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" 
                      rows="2" 
                      placeholder="Tags (comma separated)"
                      formControlName="tags">
            </textarea>
          </div>

          <!-- Change Notes -->
          <div class="col-12">
            <textarea class="form-control form-control-sm" 
                      rows="2" 
                      placeholder="Change Notes"
                      formControlName="changeNotes">
            </textarea>
            <small class="text-muted">Describe the changes made in this version</small>
          </div>
        </div>
      </div>

      <div class="modal-footer py-2">
        <button type="button" class="btn btn-link btn-sm" (click)="activeModal.dismiss()">Cancel</button>
        <button type="submit" class="btn btn-primary btn-sm" [disabled]="!documentForm.valid">
          Update Document
        </button>
      </div>
    </form>
  `
})
export class EditDocumentModalComponent {
  @Input() meeting!: CommitteeMeeting;
  @Input() document!: MeetingDocument;

  documentForm: FormGroup;
  selectedFile: File | null = null;
  isFileValid = true;
  maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      type: ['', Validators.required],
      title: ['', Validators.required],
      description: [''],
      version: [''],
      author: [''],
      tags: [''],
      changeNotes: ['']
    });
  }

  ngOnInit(): void {
    if (this.document) {
      // Calculate next version number
      const currentVersion = parseFloat(this.document.version);
      const nextVersion = (Math.floor(currentVersion * 10) + 1) / 10;

      this.documentForm.patchValue({
        type: this.document.type,
        title: this.document.title,
        description: this.document.description || '',
        version: nextVersion.toFixed(1),
        author: this.document.author,
        tags: this.document.tags.join(', ')
      });
    }
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

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check file size
      if (file.size > this.maxFileSize) {
        this.isFileValid = false;
        this.selectedFile = null;
        return;
      }

      // Check file type
      const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ];

      if (!validTypes.includes(file.type)) {
        this.isFileValid = false;
        this.selectedFile = null;
        return;
      }

      this.isFileValid = true;
      this.selectedFile = file;
    }
  }

  onDownload(): void {
    // In a real app, this would trigger a file download
    console.log('Downloading:', this.document.path);
  }

  onSubmit(): void {
    if (this.documentForm.valid) {
      const formValue = this.documentForm.value;

      // Convert tags from comma-separated string to array
      const tags = formValue.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const result = {
        meeting: this.meeting,
        document: {
          ...this.document,
          ...formValue,
          tags,
          file: this.selectedFile,
          uploadDate: new Date().toISOString(),
          size: this.selectedFile?.size || this.document.size
        }
      };

      this.activeModal.close(result);
    }
  }
}
