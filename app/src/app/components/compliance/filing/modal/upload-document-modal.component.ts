import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Filing } from './../../compliance.types';

@Component({
  selector: 'app-upload-document-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule],
  template: `
    <div class="modal-header">
      <h5 class="modal-title">Upload Document</h5>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()"></button>
    </div>

    <form [formGroup]="documentForm" (ngSubmit)="onSubmit()">
      <div class="modal-body">
        <!-- Filing Reference -->
        <div class="mb-3">
          <label class="form-label text-muted small">Filing</label>
          <p class="mb-0">{{ filing.title }}</p>
          <small class="text-muted">
            {{ filing.type }} | {{ filing.authority }} | Ref: {{ filing.referenceNumber || 'Not assigned' }}
          </small>
        </div>

        <!-- Document Upload -->
        <div class="mb-3">
          <label class="form-label">Document</label>
          <input 
            type="file" 
            class="form-control" 
            (change)="onFileSelected($event)"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
          >
          <div class="form-text text-danger" *ngIf="showFileError">
            Please select a valid document file
          </div>
          <small class="form-text text-muted">
            Supported formats: PDF, Word, Excel, Images (max 10MB)
          </small>
        </div>

        <!-- Document Details -->
        <div class="mb-3">
          <label class="form-label">Title</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="title"
            placeholder="Enter document title"
          >
          <div class="form-text text-danger" *ngIf="documentForm.get('title')?.touched && documentForm.get('title')?.errors?.['required']">
            Document title is required
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label">Description</label>
          <textarea 
            class="form-control" 
            rows="2" 
            formControlName="description"
            placeholder="Enter document description"
          ></textarea>
        </div>

        <!-- Document Type -->
        <div class="mb-3">
          <label class="form-label">Document Type</label>
          <select class="form-select" formControlName="type">
            <option value="">Select Type</option>
            <option value="Form">Form</option>
            <option value="Report">Report</option>
            <option value="Certificate">Certificate</option>
            <option value="Statement">Statement</option>
            <option value="Receipt">Receipt</option>
            <option value="Correspondence">Correspondence</option>
            <option value="Supporting">Supporting Document</option>
            <option value="Other">Other</option>
          </select>
          <div class="form-text text-danger" *ngIf="documentForm.get('type')?.touched && documentForm.get('type')?.errors?.['required']">
            Document type is required
          </div>
        </div>

        <!-- Document Status -->
        <div class="mb-3">
          <label class="form-label">Status</label>
          <select class="form-select" formControlName="status">
            <option value="Draft">Draft</option>
            <option value="Final">Final</option>
            <option value="Signed">Signed</option>
            <option value="Submitted">Submitted</option>
          </select>
          <div class="form-text text-danger" *ngIf="documentForm.get('status')?.touched && documentForm.get('status')?.errors?.['required']">
            Document status is required
          </div>
        </div>

        <!-- Version -->
        <div class="mb-3">
          <label class="form-label">Version</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="version"
            placeholder="e.g., 1.0"
          >
        </div>

        <!-- Additional Options -->
        <div class="mb-3">
          <div class="form-check mb-2">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="isConfidential"
              id="confidentialCheck"
            >
            <label class="form-check-label" for="confidentialCheck">
              Mark as Confidential
            </label>
          </div>

          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              formControlName="requiresReview"
              id="reviewCheck"
            >
            <label class="form-check-label" for="reviewCheck">
              Requires Review
            </label>
          </div>
        </div>

        <!-- Tags -->
        <div class="mb-3">
          <label class="form-label">Tags</label>
          <input 
            type="text" 
            class="form-control" 
            formControlName="tags"
            placeholder="Enter tags separated by commas"
          >
          <small class="form-text text-muted">
            Optional: Add tags to help organize and find documents
          </small>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-link" (click)="activeModal.dismiss()">Cancel</button>
        <button 
          type="submit" 
          class="btn btn-primary" 
          [disabled]="!documentForm.valid || !selectedFile"
        >
          Upload Document
        </button>
      </div>
    </form>
  `
})
export class UploadDocumentModalComponent {
  @Input() filing!: Filing;

  documentForm: FormGroup;
  selectedFile: File | null = null;
  showFileError: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder
  ) {
    this.documentForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      status: ['Draft', Validators.required],
      version: ['1.0'],
      isConfidential: [false],
      requiresReview: [false],
      tags: [''],
      uploadedBy: [''], // Will be set from current user
      uploadDate: [new Date().toISOString()],
      filingId: [''] // Will be set from input filing
    });
  }

  ngOnInit(): void {
    if (this.filing) {
      this.documentForm.patchValue({
        filingId: this.filing.id
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ];

    if (file && file.size <= maxSize && allowedTypes.includes(file.type)) {
      this.selectedFile = file;
      this.showFileError = false;

      // Auto-fill title if empty
      if (!this.documentForm.get('title')?.value) {
        this.documentForm.patchValue({
          title: file.name.split('.')[0] // Remove extension
        });
      }
    } else {
      this.selectedFile = null;
      this.showFileError = true;
    }
  }

  onSubmit(): void {
    if (this.documentForm.valid && this.selectedFile) {
      // Convert tags string to array
      const tagsString = this.documentForm.get('tags')?.value;
      const tags = tagsString ? 
        tagsString.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag.length > 0) : 
        [];

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('metadata', JSON.stringify({
        ...this.documentForm.value,
        tags,
        fileName: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        fileType: this.selectedFile.type
      }));

      const result = {
        filing: this.filing,
        document: formData
      };
      
      this.activeModal.close(result);
    }
  }
}
